import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_NAGA_DATA, normalizeNagaData } from './src/defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Directories & Files
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PUBLIC_DATA_DIR = path.join(__dirname, 'public', 'data');
const PUBLIC_DB_FILE = path.join(PUBLIC_DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

for (const dir of [DATA_DIR, PUBLIC_DATA_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initialize db.json and public/data/db.json if not present
if (!fs.existsSync(DB_FILE)) {
  try {
    const initialJson = JSON.stringify(DEFAULT_NAGA_DATA, null, 2);
    fs.writeFileSync(DB_FILE, initialJson, 'utf-8');
    fs.writeFileSync(PUBLIC_DB_FILE, initialJson, 'utf-8');
  } catch (err) {
    console.error('Failed to initialize db.json:', err);
  }
} else if (!fs.existsSync(PUBLIC_DB_FILE)) {
  try {
    fs.copyFileSync(DB_FILE, PUBLIC_DB_FILE);
  } catch (err) {
    console.error('Failed to sync public/data/db.json:', err);
  }
}

// ============================================================================
// GITHUB REPOSITORY SYNC ENGINE (REST Contents API)
// ============================================================================
interface GitHubSyncState {
  lastSyncAt: string | null;
  lastCommitUrl: string | null;
  lastError: string | null;
}

const githubSyncState: GitHubSyncState = {
  lastSyncAt: null,
  lastCommitUrl: null,
  lastError: null,
};

function getGitHubConfig() {
  const token = (process.env.GITHUB_TOKEN || '').trim();
  const rawRepo = (process.env.GITHUB_REPO || '').trim();
  const branch = (process.env.GITHUB_BRANCH || 'main').trim() || 'main';

  // Normalize "https://github.com/owner/repo.git" or "owner/repo" -> "owner/repo"
  const cleanedRepo = rawRepo
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');

  const isValidRepo = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cleanedRepo);

  return {
    token,
    repo: isValidRepo ? cleanedRepo : '',
    branch,
    canWrite: Boolean(token && isValidRepo),
    canRead: Boolean(isValidRepo),
  };
}

async function upsertFileToGitHub(
  repoPath: string,
  contentBuffer: Buffer,
  commitMessage: string
): Promise<{ ok: boolean; commitUrl?: string; message: string }> {
  const { token, repo, branch, canWrite } = getGitHubConfig();
  if (!canWrite) {
    return {
      ok: false,
      message: 'GITHUB_TOKEN 또는 GITHUB_REPO 환경변수가 설정되지 않아 로컬 서버에만 저장되었습니다.',
    };
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${repoPath}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'NAGA-Admin-CMS',
  };

  try {
    // 1. Check if file already exists on the branch to get its current SHA
    let existingSha: string | undefined;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
      method: 'GET',
      headers,
    });

    if (getRes.ok) {
      const existingData = (await getRes.json()) as { sha?: string };
      if (existingData && existingData.sha) {
        existingSha = existingData.sha;
      }
    }

    // 2. Commit & push the updated file content
    const putBody: Record<string, unknown> = {
      message: commitMessage,
      content: contentBuffer.toString('base64'),
      branch,
    };
    if (existingSha) {
      putBody.sha = existingSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      const errMsg = `GitHub API 오류 (${putRes.status}): ${errText.slice(0, 180)}`;
      githubSyncState.lastError = errMsg;
      return { ok: false, message: errMsg };
    }

    const putData = (await putRes.json()) as { commit?: { html_url?: string } };
    const commitUrl = putData?.commit?.html_url;
    githubSyncState.lastSyncAt = new Date().toISOString();
    githubSyncState.lastCommitUrl = commitUrl || null;
    githubSyncState.lastError = null;

    return {
      ok: true,
      commitUrl,
      message: `GitHub (${repo}@${branch}) 저장소에 푸시 완료`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'GitHub 통신 중 알 수 없는 오류';
    githubSyncState.lastError = errMsg;
    return { ok: false, message: errMsg };
  }
}

async function syncDatabaseToGitHub(reason: string) {
  const { canWrite } = getGitHubConfig();
  if (!canWrite) {
    return {
      ok: false,
      configured: false,
      message: '로컬 서버에 저장 완료 (GitHub 자동 푸시를 사용하려면 환경변수에 GITHUB_TOKEN 및 GITHUB_REPO를 설정하세요)',
    };
  }

  try {
    const dbContent = fs.readFileSync(DB_FILE);
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const commitMessage = `chore(cms): ${reason} (${timestamp})`;

    // Commit both data/db.json and public/data/db.json so both backend & static hosting stay in sync
    const res1 = await upsertFileToGitHub('data/db.json', dbContent, commitMessage);
    await upsertFileToGitHub('public/data/db.json', dbContent, commitMessage);

    return {
      ok: res1.ok,
      configured: true,
      commitUrl: res1.commitUrl,
      message: res1.message,
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      message: err instanceof Error ? err.message : 'GitHub 동기화 실패',
    };
  }
}

// Pull latest data/db.json from GitHub on server startup (survives container restarts/redeployments)
async function pullDatabaseFromGitHubOnStartup() {
  const { token, repo, branch, canRead } = getGitHubConfig();
  if (!canRead) return;

  const apiUrl = `https://api.github.com/repos/${repo}/contents/data/db.json?ref=${encodeURIComponent(branch)}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'NAGA-Admin-CMS',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(apiUrl, { method: 'GET', headers });
    if (!res.ok) return;
    const fileObj = (await res.json()) as { content?: string; encoding?: string };
    if (fileObj?.content && fileObj.encoding === 'base64') {
      const decoded = Buffer.from(fileObj.content.replace(/\n/g, ''), 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      const normalized = normalizeNagaData(parsed);
      const formatted = JSON.stringify(normalized, null, 2);
      fs.writeFileSync(DB_FILE, formatted, 'utf-8');
      fs.writeFileSync(PUBLIC_DB_FILE, formatted, 'utf-8');
      githubSyncState.lastSyncAt = new Date().toISOString();
      console.log(`[NAGA Server] Pulled latest data/db.json from GitHub (${repo}@${branch})`);
    }
  } catch (err) {
    console.warn('[NAGA Server] Could not pull initial db.json from GitHub:', err);
  }
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads and static data
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/data', express.static(PUBLIC_DATA_DIR));

// Helper to read database
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return normalizeNagaData(parsed);
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return DEFAULT_NAGA_DATA;
}

// Helper to write database (writes both data/db.json and public/data/db.json)
function writeDatabase(data: unknown) {
  try {
    const normalized = normalizeNagaData(data as Record<string, unknown>);
    const jsonString = JSON.stringify(normalized, null, 2);
    fs.writeFileSync(DB_FILE, jsonString, 'utf-8');
    fs.writeFileSync(PUBLIC_DB_FILE, jsonString, 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Admin Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'admin' && password === '1q2w3e4r!!') {
    return res.json({
      success: true,
      token: 'naga-admin-session-' + Date.now(),
      message: '관리자 인증에 성공했습니다.',
    });
  }
  return res.status(401).json({
    success: false,
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  });
});

// 2. Get Site Data
app.get('/api/data', (req, res) => {
  const data = readDatabase();
  const gh = getGitHubConfig();
  res.json({
    success: true,
    data,
    github: {
      configured: gh.canWrite,
      repo: gh.repo || null,
      branch: gh.branch,
      lastSyncAt: githubSyncState.lastSyncAt,
      lastCommitUrl: githubSyncState.lastCommitUrl,
    },
  });
});

// 3. Update Site Data (+ Auto GitHub Commit & Push)
app.post('/api/data', async (req, res) => {
  const newData = req.body;
  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ success: false, message: '유효하지 않은 데이터 형식입니다.' });
  }

  const success = writeDatabase(newData);
  if (!success) {
    return res.status(500).json({ success: false, message: '데이터베이스 저장에 실패했습니다.' });
  }

  const ghResult = await syncDatabaseToGitHub('Update NAGA site content via Admin Console');

  return res.json({
    success: true,
    githubSynced: ghResult.ok,
    githubConfigured: ghResult.configured,
    githubCommitUrl: ghResult.commitUrl || null,
    message: ghResult.configured
      ? ghResult.ok
        ? `서버 저장 및 ${ghResult.message}`
        : `서버에는 저장되었으나 GitHub 푸시 실패: ${ghResult.message}`
      : '데이터가 서버에 저장되었습니다.',
  });
});

// 4. Reset Site Data to Seed Defaults (+ Auto GitHub Commit & Push)
app.post('/api/data/reset', async (req, res) => {
  const success = writeDatabase(DEFAULT_NAGA_DATA);
  if (!success) {
    return res.status(500).json({ success: false, message: '데이터 초기화에 실패했습니다.' });
  }

  const ghResult = await syncDatabaseToGitHub('Reset NAGA site content to default');
  return res.json({
    success: true,
    data: DEFAULT_NAGA_DATA,
    githubSynced: ghResult.ok,
    message: '기본 데이터로 초기화되었습니다.',
  });
});

// 5. Upload Image File (Base64) (+ Auto GitHub Commit & Push to public/uploads/)
app.post('/api/upload', async (req, res) => {
  try {
    const { imageBase64, filename } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: '이미지 데이터가 없습니다.' });
    }

    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('svg')) ext = '.svg';
    else if (mimeType.includes('gif')) ext = '.gif';

    const safeBaseName = (filename || 'naga_asset')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/\.[^/.]+$/, '');
    const finalFilename = `${Date.now()}_${safeBaseName}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, finalFilename);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(targetPath, buffer);

    // Also push the uploaded image file to GitHub repository if configured
    const { canWrite } = getGitHubConfig();
    let githubUploaded = false;
    if (canWrite) {
      const ghUpload = await upsertFileToGitHub(
        `public/uploads/${finalFilename}`,
        buffer,
        `chore(cms): Upload asset ${finalFilename}`
      );
      githubUploaded = ghUpload.ok;
    }

    const publicUrl = `/uploads/${finalFilename}`;
    return res.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      githubUploaded,
      message: githubUploaded
        ? '이미지가 업로드되었으며 GitHub 저장소에도 푸시되었습니다.'
        : '이미지가 성공적으로 업로드되었습니다.',
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({
      success: false,
      message: '이미지 파일 저장 중 오류가 발생했습니다.',
    });
  }
});

// 6. GitHub Sync Status & Manual Full Push Endpoint
app.get('/api/github/status', (req, res) => {
  const gh = getGitHubConfig();
  return res.json({
    success: true,
    configured: gh.canWrite,
    repo: gh.repo || null,
    branch: gh.branch,
    lastSyncAt: githubSyncState.lastSyncAt,
    lastCommitUrl: githubSyncState.lastCommitUrl,
    lastError: githubSyncState.lastError,
  });
});

app.post('/api/github/push', async (req, res) => {
  const gh = getGitHubConfig();
  if (!gh.canWrite) {
    return res.status(400).json({
      success: false,
      configured: false,
      message:
        '배포 환경변수에 GITHUB_TOKEN 과 GITHUB_REPO(예: owner/repo)를 설정하면 어드민 저장 시 GitHub 저장소로 자동 커밋·푸시됩니다.',
    });
  }

  // Optionally save incoming data body first if provided
  if (req.body && req.body.data && typeof req.body.data === 'object') {
    writeDatabase(req.body.data);
  }

  // Push db.json and public/data/db.json
  const dbSync = await syncDatabaseToGitHub('Manual push from NAGA Admin Console');

  // Also ensure any uploaded images in public/uploads/ are pushed
  let uploadedCount = 0;
  try {
    const files = fs.readdirSync(UPLOADS_DIR).filter((f) => !f.startsWith('.'));
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      if (fs.statSync(filePath).isFile()) {
        const buf = fs.readFileSync(filePath);
        const upRes = await upsertFileToGitHub(
          `public/uploads/${file}`,
          buf,
          `chore(cms): Sync uploaded asset ${file}`
        );
        if (upRes.ok) uploadedCount++;
      }
    }
  } catch (err) {
    console.warn('Error syncing upload directory to GitHub:', err);
  }

  if (dbSync.ok) {
    return res.json({
      success: true,
      configured: true,
      commitUrl: dbSync.commitUrl || null,
      uploadedCount,
      lastSyncAt: githubSyncState.lastSyncAt,
      message: `${dbSync.message} (데이터베이스 및 업로드 이미지 ${uploadedCount}건 동기화 완료)`,
    });
  }

  return res.status(500).json({
    success: false,
    configured: true,
    message: dbSync.message,
  });
});

// ============================================================================
// SERVER INITIALIZATION (Vite in dev, static in prod)
// ============================================================================
async function startServer() {
  // Pull latest committed db.json from GitHub on startup if GITHUB_REPO is set
  await pullDatabaseFromGitHubOnStartup();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NAGA Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NAGA Server] Fatal error starting server:', err);
});

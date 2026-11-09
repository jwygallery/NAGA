import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_NAGA_DATA, normalizeNagaData } from './src/defaultData.js';
import type { NagaAppData } from './src/types.js';

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
const DEFAULT_DATA_TS_FILE = path.join(__dirname, 'src', 'defaultData.ts');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

for (const dir of [DATA_DIR, PUBLIC_DATA_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getMimeTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'image/jpeg';
}

// Generate valid src/defaultData.ts source code from NagaAppData so static builds on GitHub/Netlify also bake in all comment/text edits permanently
function generateDefaultDataTsContent(data: NagaAppData): string {
  const joinNoticesJson = JSON.stringify(data.joinNotices || [data.joinNotice], null, 2);
  const productsJson = JSON.stringify(data.products || [], null, 2);
  const activitiesJson = JSON.stringify(data.activities || [], null, 2);
  const heroSlidesJson = JSON.stringify(data.heroSlides || [], null, 2);

  return `import { NagaAppData, JoinNoticeItem, ProductItem } from './types';

export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const ghRawMatch = trimmed.match(
    /^https?:\\/\\/raw\\.githubusercontent\\.com\\/[^/]+\\/[^/]+\\/[^/]+\\/(?:public\\/)?uploads\\/([^?#]+)(?:\\?.*)?$/i
  );
  if (ghRawMatch && ghRawMatch[1]) {
    return \`/uploads/\${decodeURIComponent(ghRawMatch[1])}\`;
  }
  const ghBlobMatch = trimmed.match(
    /^https?:\\/\\/github\\.com\\/[^/]+\\/[^/]+\\/(?:raw|blob)\\/[^/]+\\/(?:public\\/)?uploads\\/([^?#]+)(?:\\?.*)?$/i
  );
  if (ghBlobMatch && ghBlobMatch[1]) {
    return \`/uploads/\${decodeURIComponent(ghBlobMatch[1])}\`;
  }
  return trimmed;
}

export const DEFAULT_JOIN_NOTICES: JoinNoticeItem[] = ${joinNoticesJson};

export const DEFAULT_PRODUCTS: ProductItem[] = ${productsJson};

export const DEFAULT_NAGA_DATA: NagaAppData = {
  activities: ${activitiesJson},
  heroSlides: ${heroSlidesJson},
  products: DEFAULT_PRODUCTS,
  joinNotice: DEFAULT_JOIN_NOTICES[0],
  joinNotices: DEFAULT_JOIN_NOTICES,
};

export function normalizeNagaData(raw: Partial<NagaAppData> | null | undefined): NagaAppData {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_NAGA_DATA;
  }

  let joinNotices: JoinNoticeItem[] = [];

  if (Array.isArray(raw.joinNotices) && raw.joinNotices.length > 0) {
    joinNotices = raw.joinNotices.map((item, idx) => ({
      id: item.id || \`join-session-\${idx + 1}\`,
      isActive: item.isActive !== undefined ? item.isActive : true,
      tag: item.tag ?? 'UPCOMING EXPEDITION',
      title: item.title ?? 'NAGA EXPEDITION',
      sub: item.sub ?? '',
      description: item.description ?? '',
      coursePhoto: normalizeImageUrl(item.coursePhoto) || '/images/activity_taebaek_slide_1.jpg',
      photoArchiveTag: item.photoArchiveTag ?? 'EXPEDITION ARCHIVE',
      photoTrailTag: item.photoTrailTag ?? 'TRAIL ARCHIVE',
      targetSession: item.targetSession ?? item.title ?? 'NAGA EXPEDITION',
    }));
  } else if (raw.joinNotice && typeof raw.joinNotice === 'object') {
    const primaryFromLegacy: JoinNoticeItem = {
      id: raw.joinNotice.id || 'join-session-taebaek',
      isActive: true,
      tag: raw.joinNotice.tag ?? DEFAULT_JOIN_NOTICES[0].tag,
      title: raw.joinNotice.title ?? DEFAULT_JOIN_NOTICES[0].title,
      sub: raw.joinNotice.sub ?? DEFAULT_JOIN_NOTICES[0].sub,
      description: raw.joinNotice.description ?? DEFAULT_JOIN_NOTICES[0].description,
      coursePhoto: normalizeImageUrl(raw.joinNotice.coursePhoto) || DEFAULT_JOIN_NOTICES[0].coursePhoto,
      photoArchiveTag: raw.joinNotice.photoArchiveTag ?? DEFAULT_JOIN_NOTICES[0].photoArchiveTag,
      photoTrailTag: raw.joinNotice.photoTrailTag ?? DEFAULT_JOIN_NOTICES[0].photoTrailTag,
      targetSession: raw.joinNotice.targetSession ?? DEFAULT_JOIN_NOTICES[0].targetSession,
    };
    joinNotices = [primaryFromLegacy, ...DEFAULT_JOIN_NOTICES.slice(1)];
  } else {
    joinNotices = DEFAULT_JOIN_NOTICES;
  }

  const firstActive = joinNotices.find((n) => n.isActive) || joinNotices[0] || DEFAULT_JOIN_NOTICES[0];

  const normalizedProducts: ProductItem[] =
    Array.isArray(raw.products) && raw.products.length > 0
      ? raw.products.map((prod, idx) => {
          const fallbackDefault =
            DEFAULT_PRODUCTS.find((dp) => dp.id === prod.id) || DEFAULT_PRODUCTS[idx] || DEFAULT_PRODUCTS[0];
          const rawImages =
            Array.isArray(prod.images) && prod.images.length > 0
              ? prod.images.map((img) => normalizeImageUrl(img)).filter(Boolean)
              : undefined;
          const mainImage = normalizeImageUrl(prod.image) || fallbackDefault.image;
          return {
            ...prod,
            image: mainImage,
            detailDescription:
              prod.detailDescription !== undefined
                ? prod.detailDescription
                : fallbackDefault?.detailDescription || prod.usage || '',
            images: rawImages && rawImages.length > 0
              ? rawImages
              : fallbackDefault && fallbackDefault.id === prod.id && fallbackDefault.images
              ? [mainImage, ...fallbackDefault.images.slice(1).map((img) => normalizeImageUrl(img))]
              : [mainImage],
          };
        })
      : DEFAULT_PRODUCTS;

  const normalizedActivities =
    Array.isArray(raw.activities) && raw.activities.length > 0
      ? raw.activities.map((act) => ({
          ...act,
          images: Array.isArray(act.images)
            ? act.images.map((img) => normalizeImageUrl(img)).filter(Boolean)
            : [],
        }))
      : DEFAULT_NAGA_DATA.activities;

  const normalizedHeroSlides =
    Array.isArray(raw.heroSlides) && raw.heroSlides.length > 0
      ? raw.heroSlides.map((slide) => ({
          ...slide,
          image: normalizeImageUrl(slide.image),
        }))
      : DEFAULT_NAGA_DATA.heroSlides;

  return {
    activities: normalizedActivities,
    heroSlides: normalizedHeroSlides,
    products: normalizedProducts,
    joinNotice: firstActive,
    joinNotices,
  };
}
`;
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
// GITHUB REPOSITORY SYNC ENGINE (Atomic Git Data API + Contents API)
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

function getGitHubHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'NAGA-Admin-CMS',
    'Cache-Control': 'no-cache, no-store',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Fetch binary file (e.g. public/uploads/<filename>) directly from GitHub API using GITHUB_TOKEN
async function fetchBinaryFileFromGitHub(repoPath: string): Promise<Buffer | null> {
  const { token, repo, branch, canRead } = getGitHubConfig();
  if (!canRead) return null;

  try {
    const rawHeaders: Record<string, string> = {
      ...getGitHubHeaders(token),
      Accept: 'application/vnd.github.raw+json',
    };

    const apiUrl = `https://api.github.com/repos/${repo}/contents/${repoPath}?ref=${encodeURIComponent(branch)}`;
    const res = await fetch(apiUrl, { method: 'GET', headers: rawHeaders });
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const jsonObj = (await res.json()) as { content?: string; encoding?: string };
      if (jsonObj?.content && jsonObj.encoding === 'base64') {
        const buf = Buffer.from(jsonObj.content.replace(/\n/g, ''), 'base64');
        return buf.length > 0 ? buf : null;
      }
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    return buf.length > 0 ? buf : null;
  } catch (err) {
    console.warn(`[NAGA Server] Failed to fetch binary ${repoPath} from GitHub:`, err);
    return null;
  }
}

// Atomic multi-file commit via GitHub Git Data API (commits data/db.json, public/data/db.json, and src/defaultData.ts in 1 commit)
async function commitMultipleTextFilesToGitHub(
  files: Array<{ repoPath: string; content: string }>,
  commitMessage: string
): Promise<{ ok: boolean; commitUrl?: string; message: string }> {
  const { token, repo, branch, canWrite } = getGitHubConfig();
  if (!canWrite) {
    return {
      ok: false,
      message: 'GITHUB_TOKEN 또는 GITHUB_REPO 환경변수가 설정되지 않아 로컬 서버에만 저장되었습니다.',
    };
  }

  const headers = {
    ...getGitHubHeaders(token),
    'Content-Type': 'application/json',
  };

  try {
    // 1. Get latest commit SHA on target branch
    const refRes = await fetch(
      `https://api.github.com/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
      { method: 'GET', headers }
    );
    if (!refRes.ok) {
      throw new Error(`Failed to fetch branch ref (${refRes.status})`);
    }
    const refData = (await refRes.json()) as { object?: { sha?: string } };
    const latestCommitSha = refData?.object?.sha;
    if (!latestCommitSha) {
      throw new Error('Could not resolve latestCommitSha');
    }

    // 2. Get base tree SHA of that commit
    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/git/commits/${latestCommitSha}`,
      { method: 'GET', headers }
    );
    if (!commitRes.ok) {
      throw new Error(`Failed to fetch base commit (${commitRes.status})`);
    }
    const commitData = (await commitRes.json()) as { tree?: { sha?: string } };
    const baseTreeSha = commitData?.tree?.sha;
    if (!baseTreeSha) {
      throw new Error('Could not resolve baseTreeSha');
    }

    // 3. Create new tree with all updated files
    const treeEntries = files.map((f) => ({
      path: f.repoPath,
      mode: '100644',
      type: 'blob',
      content: f.content,
    }));

    const createTreeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeEntries,
      }),
    });
    if (!createTreeRes.ok) {
      const errText = await createTreeRes.text();
      throw new Error(`Failed to create git tree (${createTreeRes.status}): ${errText.slice(0, 150)}`);
    }
    const treeData = (await createTreeRes.json()) as { sha?: string };
    const newTreeSha = treeData?.sha;

    // 4. Create commit
    const createCommitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [latestCommitSha],
      }),
    });
    if (!createCommitRes.ok) {
      const errText = await createCommitRes.text();
      throw new Error(`Failed to create commit (${createCommitRes.status}): ${errText.slice(0, 150)}`);
    }
    const newCommitData = (await createCommitRes.json()) as { sha?: string; html_url?: string };
    const newCommitSha = newCommitData?.sha;
    const commitUrl = newCommitData?.html_url || `https://github.com/${repo}/commit/${newCommitSha}`;

    // 5. Update branch reference to point to new commit
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: newCommitSha,
          force: true,
        }),
      }
    );
    if (!updateRefRes.ok) {
      const errText = await updateRefRes.text();
      throw new Error(`Failed to update branch ref (${updateRefRes.status}): ${errText.slice(0, 150)}`);
    }

    githubSyncState.lastSyncAt = new Date().toISOString();
    githubSyncState.lastCommitUrl = commitUrl;
    githubSyncState.lastError = null;

    return {
      ok: true,
      commitUrl,
      message: `GitHub (${repo}@${branch}) 저장소에 데이터 및 코멘트 변경사항 푸시 완료`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'GitHub 커밋 중 오류';
    githubSyncState.lastError = errMsg;
    return { ok: false, message: errMsg };
  }
}

async function upsertFileToGitHub(
  repoPath: string,
  contentBuffer: Buffer,
  commitMessage: string
): Promise<{ ok: boolean; commitUrl?: string; downloadUrl?: string; message: string }> {
  const { token, repo, branch, canWrite } = getGitHubConfig();
  if (!canWrite) {
    return {
      ok: false,
      message: 'GITHUB_TOKEN 또는 GITHUB_REPO 환경변수가 설정되지 않아 로컬 서버에만 저장되었습니다.',
    };
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${repoPath}`;
  const headers = getGitHubHeaders(token);

  try {
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

    const putData = (await putRes.json()) as {
      commit?: { html_url?: string };
      content?: { download_url?: string };
    };
    const commitUrl = putData?.commit?.html_url;
    const downloadUrl = putData?.content?.download_url;
    githubSyncState.lastSyncAt = new Date().toISOString();
    githubSyncState.lastCommitUrl = commitUrl || null;
    githubSyncState.lastError = null;

    return {
      ok: true,
      commitUrl,
      downloadUrl,
      message: `GitHub (${repo}@${branch}) 저장소에 푸시 완료`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'GitHub 통신 중 알 수 없는 오류';
    githubSyncState.lastError = errMsg;
    return { ok: false, message: errMsg };
  }
}

async function syncDatabaseToGitHub(reason: string, includeAppSourceFiles = false) {
  const { canWrite } = getGitHubConfig();
  if (!canWrite) {
    return {
      ok: false,
      configured: false,
      message:
        '로컬 서버에 저장 완료 (GitHub 자동 푸시를 사용하려면 환경변수에 GITHUB_TOKEN 및 GITHUB_REPO를 설정하세요)',
    };
  }

  try {
    const dbText = fs.readFileSync(DB_FILE, 'utf-8');
    const defaultDataTsText = fs.readFileSync(DEFAULT_DATA_TS_FILE, 'utf-8');
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const commitMessage = `chore(cms): ${reason} (${timestamp})`;

    const filesToCommit: Array<{ repoPath: string; content: string }> = [
      { repoPath: 'data/db.json', content: dbText },
      { repoPath: 'public/data/db.json', content: dbText },
      { repoPath: 'src/defaultData.ts', content: defaultDataTsText },
    ];

    if (includeAppSourceFiles) {
      const extraPaths = [
        'src/types.ts',
        'src/App.tsx',
        'src/components/AdminConsoleModal.tsx',
        'server.ts',
        'netlify.toml',
        'netlify/functions/api.mjs',
      ];
      for (const relPath of extraPaths) {
        const absPath = path.join(__dirname, relPath);
        if (fs.existsSync(absPath)) {
          filesToCommit.push({
            repoPath: relPath,
            content: fs.readFileSync(absPath, 'utf-8'),
          });
        }
      }
    }

    const res = await commitMultipleTextFilesToGitHub(filesToCommit, commitMessage);

    return {
      ok: res.ok,
      configured: true,
      commitUrl: res.commitUrl,
      message: res.message,
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      message: err instanceof Error ? err.message : 'GitHub 동기화 실패',
    };
  }
}

// Pull latest data/db.json and any missing/0-byte uploaded images from GitHub on server startup
async function pullDatabaseFromGitHubOnStartup() {
  const { token, repo, branch, canRead } = getGitHubConfig();
  if (!canRead) return;

  const headers = getGitHubHeaders(token);

  try {
    // Resolve latest commit SHA on branch so GitHub never serves a stale cached ref
    let targetRef = branch;
    const refRes = await fetch(
      `https://api.github.com/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
      { method: 'GET', headers }
    );
    if (refRes.ok) {
      const refData = (await refRes.json()) as { object?: { sha?: string } };
      if (refData?.object?.sha) {
        targetRef = refData.object.sha;
      }
    }

    const apiUrl = `https://api.github.com/repos/${repo}/contents/data/db.json?ref=${encodeURIComponent(targetRef)}`;
    const res = await fetch(apiUrl, { method: 'GET', headers });
    if (res.ok) {
      const fileObj = (await res.json()) as { content?: string; encoding?: string };
      if (fileObj?.content && fileObj.encoding === 'base64') {
        const decoded = Buffer.from(fileObj.content.replace(/\n/g, ''), 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        const normalized = normalizeNagaData(parsed);
        const formatted = JSON.stringify(normalized, null, 2);
        fs.writeFileSync(DB_FILE, formatted, 'utf-8');
        fs.writeFileSync(PUBLIC_DB_FILE, formatted, 'utf-8');
        fs.writeFileSync(DEFAULT_DATA_TS_FILE, generateDefaultDataTsContent(normalized), 'utf-8');
        githubSyncState.lastSyncAt = new Date().toISOString();
        console.log(`[NAGA Server] Pulled latest data/db.json from GitHub (${repo}@${targetRef.slice(0, 7)})`);
      }
    }

    // Also hydrate any missing or 0-byte uploaded images in public/uploads from GitHub
    const uploadsListUrl = `https://api.github.com/repos/${repo}/contents/public/uploads?ref=${encodeURIComponent(targetRef)}`;
    const uploadsRes = await fetch(uploadsListUrl, { method: 'GET', headers });
    if (uploadsRes.ok) {
      const items = (await uploadsRes.json()) as Array<{ name?: string; type?: string; size?: number }>;
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.type === 'file' && item.name && (item.size ?? 0) > 0) {
            const safeName = path.basename(item.name);
            const localPath = path.join(UPLOADS_DIR, safeName);
            const needsDownload = !fs.existsSync(localPath) || fs.statSync(localPath).size === 0;
            if (needsDownload) {
              const buf = await fetchBinaryFileFromGitHub(`public/uploads/${safeName}`);
              if (buf && buf.length > 0) {
                fs.writeFileSync(localPath, buf);
                console.log(`[NAGA Server] Hydrated uploaded image from GitHub: /uploads/${safeName} (${buf.length} bytes)`);
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[NAGA Server] Could not pull initial db.json or uploads from GitHub:', err);
  }
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dynamic proxy + local disk cache for /uploads/:filename
// Ensures uploaded images never break on reconnect even if the container restarts or had a 0-byte file
app.get('/uploads/:filename', async (req, res) => {
  const filename = path.basename(req.params.filename || '');
  if (!filename) {
    return res.status(404).end();
  }

  const mimeType = getMimeTypeFromFilename(filename);
  const localPath = path.join(UPLOADS_DIR, filename);

  try {
    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.sendFile(localPath);
    }

    const remoteBuffer = await fetchBinaryFileFromGitHub(`public/uploads/${filename}`);
    if (remoteBuffer && remoteBuffer.length > 0) {
      try {
        fs.writeFileSync(localPath, remoteBuffer);
      } catch (writeErr) {
        console.warn('[NAGA Server] Could not cache remote upload to disk:', writeErr);
      }
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(remoteBuffer);
    }
  } catch (err) {
    console.error(`[NAGA Server] Error serving /uploads/${filename}:`, err);
  }

  return res.status(404).end();
});

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

// Helper to write database (writes data/db.json, public/data/db.json, AND src/defaultData.ts)
function writeDatabase(data: unknown) {
  try {
    const normalized = normalizeNagaData(data as Record<string, unknown>);
    const jsonString = JSON.stringify(normalized, null, 2);
    fs.writeFileSync(DB_FILE, jsonString, 'utf-8');
    fs.writeFileSync(PUBLIC_DB_FILE, jsonString, 'utf-8');
    fs.writeFileSync(DEFAULT_DATA_TS_FILE, generateDefaultDataTsContent(normalized), 'utf-8');
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
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
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

// 3. Update Site Data (+ Atomic GitHub Commit & Push of db.json, public/data/db.json, and src/defaultData.ts)
app.post('/api/data', async (req, res) => {
  const newData = req.body;
  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ success: false, message: '유효하지 않은 데이터 형식입니다.' });
  }

  const success = writeDatabase(newData);
  if (!success) {
    return res.status(500).json({ success: false, message: '데이터베이스 저장에 실패했습니다.' });
  }

  const ghResult = await syncDatabaseToGitHub('Update NAGA site content & comments via Admin Console', true);

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

  const ghResult = await syncDatabaseToGitHub('Reset NAGA site content to default', false);
  return res.json({
    success: true,
    data: DEFAULT_NAGA_DATA,
    githubSynced: ghResult.ok,
    message: '기본 데이터로 초기화되었습니다.',
  });
});

// 5. Upload Image File (Base64) (+ Auto GitHub Commit & Push to public/uploads/)
// Always returns permanent `/uploads/<filename>` path (never expiring ?token=... URLs)
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

    // Always use permanent relative path `/uploads/<filename>` so private repo tokens never expire
    const publicUrl = `/uploads/${finalFilename}`;
    return res.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      githubUploaded,
      message: githubUploaded
        ? '이미지가 업로드되었으며 GitHub 저장소에도 영구 반영되었습니다.'
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

  if (req.body && req.body.data && typeof req.body.data === 'object') {
    writeDatabase(req.body.data);
  }

  // Push db.json, public/data/db.json, src/defaultData.ts, and app source files atomically
  const dbSync = await syncDatabaseToGitHub('Sync NAGA site data, comments & source from Admin Console', true);

  if (dbSync.ok) {
    return res.json({
      success: true,
      configured: true,
      commitUrl: dbSync.commitUrl || null,
      lastSyncAt: githubSyncState.lastSyncAt,
      message: dbSync.message,
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

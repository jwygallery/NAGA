// Netlify Serverless Function for NAGA™ Admin CMS & GitHub Auto-Push
// Handles /api/auth/login, /api/data, /api/upload, /api/github/status, /api/github/push on Netlify

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

function getHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'NAGA-Netlify-CMS',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchJsonFromGitHub(repoPath) {
  const { token, repo, branch, canRead } = getGitHubConfig();
  if (!canRead) return null;

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${repoPath}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: getHeaders(token),
  });

  if (!res.ok) return null;
  const fileObj = await res.json();
  if (fileObj && fileObj.content && fileObj.encoding === 'base64') {
    const decoded = Buffer.from(fileObj.content.replace(/\n/g, ''), 'base64').toString('utf-8');
    return JSON.parse(decoded);
  }
  return null;
}

async function upsertFileToGitHub(repoPath, contentBuffer, commitMessage) {
  const { token, repo, branch, canWrite } = getGitHubConfig();
  if (!canWrite) {
    return {
      ok: false,
      message:
        'Netlify 환경변수(Site configuration > Environment variables)에 GITHUB_TOKEN 과 GITHUB_REPO를 설정해 주세요.',
    };
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${repoPath}`;
  const headers = getHeaders(token);

  try {
    let existingSha;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(branch)}`, {
      method: 'GET',
      headers,
    });

    if (getRes.ok) {
      const existingData = await getRes.json();
      if (existingData && existingData.sha) {
        existingSha = existingData.sha;
      }
    }

    const putBody = {
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
      return {
        ok: false,
        message: `GitHub API 오류 (${putRes.status}): ${errText.slice(0, 180)}`,
      };
    }

    const putData = await putRes.json();
    return {
      ok: true,
      commitUrl: putData?.commit?.html_url || null,
      downloadUrl: putData?.content?.download_url || null,
      message: `GitHub (${repo}@${branch}) 원격 저장소에 커밋·푸시되었습니다.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'GitHub 통신 오류',
    };
  }
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event) => {
  const rawPath = event.path || '';
  const route = rawPath
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
  const method = (event.httpMethod || 'GET').toUpperCase();

  let body = {};
  if (event.body) {
    try {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;
      body = JSON.parse(rawBody);
    } catch {
      body = {};
    }
  }

  // 1. Admin Login
  if (route === '/auth/login' && method === 'POST') {
    const { username, password } = body;
    if (username === 'admin' && password === '1q2w3e4r!!') {
      return jsonResponse(200, {
        success: true,
        token: 'naga-admin-session-' + Date.now(),
        message: '관리자 인증에 성공했습니다.',
      });
    }
    return jsonResponse(401, {
      success: false,
      message: '아이디 또는 비밀번호가 올바르지 않습니다.',
    });
  }

  // 2. GitHub Status
  if (route === '/github/status' && method === 'GET') {
    const gh = getGitHubConfig();
    return jsonResponse(200, {
      success: true,
      configured: gh.canWrite,
      repo: gh.repo || null,
      branch: gh.branch,
      lastSyncAt: null,
      lastCommitUrl: null,
    });
  }

  // 3. Get Site Data from GitHub
  if (route === '/data' && method === 'GET') {
    const gh = getGitHubConfig();
    const remoteData = await fetchJsonFromGitHub('data/db.json');
    if (remoteData) {
      return jsonResponse(200, {
        success: true,
        data: remoteData,
        github: {
          configured: gh.canWrite,
          repo: gh.repo || null,
          branch: gh.branch,
        },
      });
    }
    return jsonResponse(404, {
      success: false,
      message: 'GitHub에서 데이터를 불러오지 못해 정적 db.json을 사용합니다.',
    });
  }

  // 4. Save Site Data & Push to GitHub
  if ((route === '/data' || route === '/github/push') && method === 'POST') {
    const payloadData = route === '/github/push' && body.data ? body.data : body;
    if (!payloadData || typeof payloadData !== 'object') {
      return jsonResponse(400, { success: false, message: '유효하지 않은 데이터입니다.' });
    }

    const contentBuffer = Buffer.from(JSON.stringify(payloadData, null, 2), 'utf-8');
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const commitMsg = `chore(cms): Update NAGA site data (${timestamp})`;

    const res1 = await upsertFileToGitHub('data/db.json', contentBuffer, commitMsg);
    await upsertFileToGitHub('public/data/db.json', contentBuffer, commitMsg);

    if (res1.ok) {
      return jsonResponse(200, {
        success: true,
        configured: true,
        githubSynced: true,
        commitUrl: res1.commitUrl,
        lastSyncAt: new Date().toISOString(),
        message: res1.message,
      });
    }
    return jsonResponse(400, {
      success: false,
      configured: false,
      message: res1.message,
    });
  }

  // 5. Upload Image & Push to GitHub public/uploads/
  if (route === '/upload' && method === 'POST') {
    const { imageBase64, filename } = body;
    if (!imageBase64) {
      return jsonResponse(400, { success: false, message: '이미지 데이터가 없습니다.' });
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
    const buffer = Buffer.from(base64Data, 'base64');

    const ghUpload = await upsertFileToGitHub(
      `public/uploads/${finalFilename}`,
      buffer,
      `chore(cms): Upload image ${finalFilename}`
    );

    // Use GitHub raw download_url if available so the image renders immediately before Netlify finishes rebuilding
    const immediateUrl = ghUpload.downloadUrl || `/uploads/${finalFilename}`;

    return jsonResponse(200, {
      success: true,
      url: immediateUrl,
      filename: finalFilename,
      githubUploaded: ghUpload.ok,
      message: ghUpload.ok
        ? '사진이 GitHub 저장소에 커밋·푸시되었습니다.'
        : '사진이 임시 적용되었습니다.',
    });
  }

  return jsonResponse(404, { success: false, message: `Not found: ${route}` });
};

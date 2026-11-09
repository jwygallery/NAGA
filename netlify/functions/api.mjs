// Netlify Serverless Function for NAGA™ Admin CMS & GitHub Auto-Push
// Atomically commits data/db.json, public/data/db.json, and src/defaultData.ts to GitHub

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
    'Cache-Control': 'no-cache, no-store',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function generateDefaultDataTsContent(data) {
  const joinNoticesJson = JSON.stringify(data.joinNotices || [data.joinNotice], null, 2);
  const productsJson = JSON.stringify(data.products || [], null, 2);
  const activitiesJson = JSON.stringify(data.activities || [], null, 2);
  const heroSlidesJson = JSON.stringify(data.heroSlides || [], null, 2);

  return `import { NagaAppData, JoinNoticeItem, ProductItem } from './types';

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
      coursePhoto: item.coursePhoto || '/images/activity_taebaek_slide_1.jpg',
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
      coursePhoto: raw.joinNotice.coursePhoto || DEFAULT_JOIN_NOTICES[0].coursePhoto,
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
          const rawImages = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : undefined;
          const mainImage = prod.image || fallbackDefault.image;
          return {
            ...prod,
            image: mainImage,
            detailDescription:
              prod.detailDescription !== undefined
                ? prod.detailDescription
                : fallbackDefault?.detailDescription || prod.usage || '',
            images: rawImages
              ? rawImages
              : fallbackDefault && fallbackDefault.id === prod.id && fallbackDefault.images
              ? [mainImage, ...fallbackDefault.images.slice(1)]
              : [mainImage],
          };
        })
      : DEFAULT_PRODUCTS;

  return {
    activities:
      Array.isArray(raw.activities) && raw.activities.length > 0
        ? raw.activities
        : DEFAULT_NAGA_DATA.activities,
    heroSlides:
      Array.isArray(raw.heroSlides) && raw.heroSlides.length > 0
        ? raw.heroSlides
        : DEFAULT_NAGA_DATA.heroSlides,
    products: normalizedProducts,
    joinNotice: firstActive,
    joinNotices,
  };
}
`;
}

// Fetch latest JSON from GitHub using exact commit SHA so GitHub CDN cache is bypassed
async function fetchJsonFromGitHub(repoPath) {
  const { token, repo, branch, canRead } = getGitHubConfig();
  if (!canRead) return null;

  const headers = getHeaders(token);

  let targetRef = branch;
  try {
    const refRes = await fetch(
      `https://api.github.com/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
      { method: 'GET', headers }
    );
    if (refRes.ok) {
      const refData = await refRes.json();
      if (refData?.object?.sha) {
        targetRef = refData.object.sha;
      }
    }
  } catch {}

  const apiUrl = `https://api.github.com/repos/${repo}/contents/${repoPath}?ref=${encodeURIComponent(targetRef)}`;
  const res = await fetch(apiUrl, {
    method: 'GET',
    headers,
  });

  if (!res.ok) return null;
  const fileObj = await res.json();
  if (fileObj && fileObj.content && fileObj.encoding === 'base64') {
    const decoded = Buffer.from(fileObj.content.replace(/\n/g, ''), 'base64').toString('utf-8');
    return JSON.parse(decoded);
  }
  return null;
}

// Atomic multi-file commit via GitHub Git Data API
async function commitMultipleTextFilesToGitHub(files, commitMessage) {
  const { token, repo, branch, canWrite } = getGitHubConfig();
  if (!canWrite) {
    return {
      ok: false,
      message:
        'Netlify 환경변수(Site configuration > Environment variables)에 GITHUB_TOKEN 과 GITHUB_REPO를 설정해 주세요.',
    };
  }

  const headers = {
    ...getHeaders(token),
    'Content-Type': 'application/json',
  };

  try {
    const refRes = await fetch(
      `https://api.github.com/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
      { method: 'GET', headers }
    );
    if (!refRes.ok) {
      throw new Error(`Failed to fetch branch ref (${refRes.status})`);
    }
    const refData = await refRes.json();
    const latestCommitSha = refData?.object?.sha;

    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/git/commits/${latestCommitSha}`,
      { method: 'GET', headers }
    );
    if (!commitRes.ok) {
      throw new Error(`Failed to fetch base commit (${commitRes.status})`);
    }
    const commitData = await commitRes.json();
    const baseTreeSha = commitData?.tree?.sha;

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
      throw new Error(`Failed to create tree (${createTreeRes.status}): ${errText.slice(0, 150)}`);
    }
    const treeData = await createTreeRes.json();

    const createCommitRes = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    });
    if (!createCommitRes.ok) {
      const errText = await createCommitRes.text();
      throw new Error(`Failed to create commit (${createCommitRes.status}): ${errText.slice(0, 150)}`);
    }
    const newCommitData = await createCommitRes.json();
    const commitUrl =
      newCommitData?.html_url || `https://github.com/${repo}/commit/${newCommitData.sha}`;

    const updateRefRes = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: newCommitData.sha,
          force: true,
        }),
      }
    );
    if (!updateRefRes.ok) {
      const errText = await updateRefRes.text();
      throw new Error(`Failed to update ref (${updateRefRes.status}): ${errText.slice(0, 150)}`);
    }

    return {
      ok: true,
      commitUrl,
      message: `GitHub (${repo}@${branch}) 원격 저장소에 데이터 및 코멘트 변경사항이 커밋·푸시되었습니다.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'GitHub 커밋 오류',
    };
  }
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

  // 3. Get Site Data from GitHub (bypasses CDN cache using latest commit SHA)
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

  // 4. Save Site Data & Atomically Push data/db.json, public/data/db.json, and src/defaultData.ts to GitHub
  if ((route === '/data' || route === '/github/push') && method === 'POST') {
    const payloadData = route === '/github/push' && body.data ? body.data : body;
    if (!payloadData || typeof payloadData !== 'object') {
      return jsonResponse(400, { success: false, message: '유효하지 않은 데이터입니다.' });
    }

    const dbText = JSON.stringify(payloadData, null, 2);
    const defaultDataTsText = generateDefaultDataTsContent(payloadData);
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const commitMsg = `chore(cms): Update NAGA site data & comments (${timestamp})`;

    const res = await commitMultipleTextFilesToGitHub(
      [
        { repoPath: 'data/db.json', content: dbText },
        { repoPath: 'public/data/db.json', content: dbText },
        { repoPath: 'src/defaultData.ts', content: defaultDataTsText },
      ],
      commitMsg
    );

    if (res.ok) {
      return jsonResponse(200, {
        success: true,
        configured: true,
        githubSynced: true,
        commitUrl: res.commitUrl,
        lastSyncAt: new Date().toISOString(),
        message: res.message,
      });
    }
    return jsonResponse(400, {
      success: false,
      configured: false,
      message: res.message,
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

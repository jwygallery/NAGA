import { NagaAppData } from './types';

export interface GitHubDirectConfig {
  token: string;
  repo: string;
  branch: string;
}

const GITHUB_CONFIG_STORAGE_KEY = 'naga_github_direct_config';
const UPLOAD_PREVIEW_SESSION_KEY = 'naga_upload_preview_cache';

// Runtime cache mapping `/uploads/<filename>` -> `data:image/jpeg;base64,...`
// Keeps uploaded photos immediately visible on GitHub Pages before deployment rebuild completes
const runtimePreviewCache = new Map<string, string>();

try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const saved = window.sessionStorage.getItem(UPLOAD_PREVIEW_SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, string>;
      Object.entries(parsed).forEach(([k, v]) => {
        if (k && typeof v === 'string') runtimePreviewCache.set(k, v);
      });
    }
  }
} catch {}

export function cacheUploadPreview(path: string, dataUrl: string): void {
  if (!path || !dataUrl) return;
  runtimePreviewCache.set(path, dataUrl);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const entries = Array.from(runtimePreviewCache.entries()).slice(-12);
      const obj = Object.fromEntries(entries);
      window.sessionStorage.setItem(UPLOAD_PREVIEW_SESSION_KEY, JSON.stringify(obj));
    }
  } catch {
    // Ignore sessionStorage quota errors; in-memory Map still works
  }
}

/**
 * Resolves `/images/*` and `/uploads/*` URLs so they work both on root hosts (Cloud Run / localhost)
 * and subpath deployments on GitHub Pages (`*.github.io/<repo>/`) using `import.meta.env.BASE_URL`.
 */
export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Immediate Data URL preview for newly uploaded assets in serverless (github.io) mode
  const cachedPreview = runtimePreviewCache.get(trimmed);
  if (cachedPreview) {
    return cachedPreview;
  }

  // Keep data, blob, and external HTTP(S) URLs unchanged
  if (/^(data:|blob:|https?:\/\/)/i.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const rawBase = (import.meta.env?.BASE_URL || '/').trim();
  const base = rawBase.replace(/\/+$/, '');

  if (base === '.') {
    return `.${normalizedPath}`;
  }

  if (base && base !== '/') {
    if (normalizedPath.startsWith(`${base}/`)) {
      return normalizedPath;
    }
    return `${base}${normalizedPath}`;
  }

  // Fallback subpath detection if Vite BASE_URL was `/` when hosted at `https://<user>.github.io/<repo>/`
  if (typeof window !== 'undefined' && /\.github\.io$/i.test(window.location.hostname)) {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const repoPrefix = `/${pathSegments[0]}`;
      if (!normalizedPath.startsWith(`${repoPrefix}/`)) {
        return `${repoPrefix}${normalizedPath}`;
      }
    }
  }

  return normalizedPath;
}

export function cleanGitHubRepoInput(rawRepo: string): string {
  let cleaned = (rawRepo || '')
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');

  if (/^iamcoolkorean\//i.test(cleaned)) {
    cleaned = cleaned.replace(/^iamcoolkorean\//i, 'jwygallery/');
  }
  return cleaned;
}

export function getGitHubDirectConfig(): GitHubDirectConfig {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(GITHUB_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GitHubDirectConfig>;
        return {
          token: (parsed.token || '').trim(),
          repo: cleanGitHubRepoInput(parsed.repo || 'jwygallery/NAGA') || 'jwygallery/NAGA',
          branch: (parsed.branch || 'main').trim() || 'main',
        };
      }
    }
  } catch {}
  return {
    token: '',
    repo: 'jwygallery/NAGA',
    branch: 'main',
  };
}

export function saveGitHubDirectConfig(config: GitHubDirectConfig): GitHubDirectConfig {
  const normalized: GitHubDirectConfig = {
    token: (config.token || '').trim(),
    repo: cleanGitHubRepoInput(config.repo || 'jwygallery/NAGA') || 'jwygallery/NAGA',
    branch: (config.branch || 'main').trim() || 'main',
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(GITHUB_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
    }
  } catch {}
  return normalized;
}

export function clearGitHubDirectConfig(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(GITHUB_CONFIG_STORAGE_KEY);
    }
  } catch {}
}

export function hasGitHubDirectConfig(): boolean {
  const cfg = getGitHubDirectConfig();
  return Boolean(cfg.token && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cfg.repo) && cfg.branch);
}

function getDirectGitHubHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

/**
 * Browser-side image resizing & compression via HTML5 <canvas>.
 * Constrains max width/height to 1600px while preserving aspect ratio, compressed to JPEG quality 0.82.
 */
export function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const readRawAsDataUrl = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('이미지 파일을 읽을 수 없습니다.'));
      reader.readAsDataURL(file);
    };

    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      readRawAsDataUrl();
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          URL.revokeObjectURL(objectUrl);
          readRawAsDataUrl();
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          readRawAsDataUrl();
          return;
        }

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);

        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        URL.revokeObjectURL(objectUrl);
        readRawAsDataUrl();
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readRawAsDataUrl();
    };

    img.src = objectUrl;
  });
}

/**
 * Directly uploads a compressed image Data URL to GitHub Contents API:
 * `PUT /repos/{owner}/{repo}/contents/public/uploads/{filename}`
 * Caches the Data URL for immediate UI preview while returning `/uploads/{filename}` for persistence.
 */
export async function uploadImageViaGitHubDirect(
  dataUrl: string,
  originalFilename: string
): Promise<{ ok: boolean; url?: string; filename?: string; message: string }> {
  const cfg = getGitHubDirectConfig();
  if (!cfg.token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cfg.repo)) {
    return {
      ok: false,
      message: 'GitHub Token과 저장소(owner/repo) 설정이 필요합니다.',
    };
  }

  let mimeType = 'image/jpeg';
  let base64Content = dataUrl;
  const match = dataUrl.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
  if (match && match.length === 3) {
    mimeType = match[1];
    base64Content = match[2];
  }

  let ext = '.jpg';
  if (mimeType.includes('png')) ext = '.png';
  else if (mimeType.includes('webp')) ext = '.webp';
  else if (mimeType.includes('svg')) ext = '.svg';
  else if (mimeType.includes('gif')) ext = '.gif';

  const safeBaseName =
    (originalFilename || 'naga_asset')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_') || 'naga_asset';
  const finalFilename = `${Date.now()}_${safeBaseName}${ext}`;
  const repoPath = `public/uploads/${finalFilename}`;
  const apiUrl = `https://api.github.com/repos/${cfg.repo}/contents/${repoPath}`;
  const headers = getDirectGitHubHeaders(cfg.token);

  try {
    let existingSha: string | undefined;
    const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(cfg.branch)}`, {
      method: 'GET',
      headers,
    });
    if (checkRes.ok) {
      const checkJson = (await checkRes.json()) as { sha?: string };
      existingSha = checkJson?.sha;
    }

    const putBody: Record<string, unknown> = {
      message: `chore(cms): Upload asset ${finalFilename}`,
      content: base64Content,
      branch: cfg.branch,
    };
    if (existingSha) {
      putBody.sha = existingSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return {
        ok: false,
        message: `GitHub 이미지 업로드 실패 (${putRes.status}): ${errText.slice(0, 140)}`,
      };
    }

    const savedUrl = `/uploads/${finalFilename}`;
    cacheUploadPreview(savedUrl, dataUrl);

    return {
      ok: true,
      url: savedUrl,
      filename: finalFilename,
      message: `GitHub (${cfg.repo}@${cfg.branch})에 이미지가 직접 업로드되었습니다.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'GitHub API 이미지 업로드 중 오류',
    };
  }
}

export function generateDefaultDataTsContent(data: NagaAppData): string {
  const joinNoticesJson = JSON.stringify(data.joinNotices || [data.joinNotice], null, 2);
  const productsJson = JSON.stringify(data.products || [], null, 2);
  const activitiesJson = JSON.stringify(data.activities || [], null, 2);
  const heroSlidesJson = JSON.stringify(data.heroSlides || [], null, 2);

  return `import { NagaAppData, JoinNoticeItem, ProductItem, RecoveryContentBlock } from './types';

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
          const resolvedSubtitle =
            prod.subtitle !== undefined
              ? prod.subtitle
              : prod.usage || prod.category || '';
          const resolvedDetail =
            prod.detailDescription !== undefined
              ? prod.detailDescription
              : fallbackDefault?.detailDescription || prod.usage || '';
          const resolvedImages =
            rawImages && rawImages.length > 0
              ? rawImages
              : fallbackDefault && fallbackDefault.id === prod.id && fallbackDefault.images
              ? [mainImage, ...fallbackDefault.images.slice(1).map((img) => normalizeImageUrl(img))]
              : [mainImage];

          let resolvedBlocks: RecoveryContentBlock[];
          if (Array.isArray(prod.blocks) && prod.blocks.length > 0) {
            resolvedBlocks = prod.blocks.map((b, bIdx) => ({
              id: b.id || \`\${prod.id || 'prod'}-block-\${bIdx}\`,
              type: b.type === 'image' ? 'image' : 'text',
              content: b.type === 'image' ? normalizeImageUrl(b.content) : (b.content ?? ''),
              caption: b.caption ?? '',
            }));
          } else {
            resolvedBlocks = [];
            if (resolvedImages[0]) {
              resolvedBlocks.push({
                id: \`\${prod.id || 'prod'}-block-img-0\`,
                type: 'image',
                content: resolvedImages[0],
              });
            }
            if (resolvedDetail.trim()) {
              resolvedBlocks.push({
                id: \`\${prod.id || 'prod'}-block-txt-0\`,
                type: 'text',
                content: resolvedDetail,
              });
            }
            for (let i = 1; i < resolvedImages.length; i++) {
              resolvedBlocks.push({
                id: \`\${prod.id || 'prod'}-block-img-\${i}\`,
                type: 'image',
                content: resolvedImages[i],
              });
            }
          }

          return {
            ...prod,
            subtitle: resolvedSubtitle,
            usage: resolvedSubtitle,
            image: mainImage,
            detailDescription: resolvedDetail,
            images: resolvedImages,
            blocks: resolvedBlocks,
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

/**
 * Browser-side Atomic 3-Way Commit via GitHub Git Data API (Tree & Commit):
 * Commits `data/db.json`, `public/data/db.json`, and `src/defaultData.ts` in one commit.
 */
export async function commitDataViaGitHubDirect(
  normalizedData: NagaAppData
): Promise<{ ok: boolean; commitUrl?: string; message: string }> {
  const cfg = getGitHubDirectConfig();
  if (!cfg.token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cfg.repo)) {
    return {
      ok: false,
      message: 'GitHub Token과 저장소(owner/repo) 설정이 필요합니다.',
    };
  }

  const headers = getDirectGitHubHeaders(cfg.token);
  const dbJsonContent = JSON.stringify(normalizedData, null, 2);
  const defaultDataTsContent = generateDefaultDataTsContent(normalizedData);
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const commitMessage = `chore(cms): Update NAGA 3-way data via browser Admin Console (${timestamp})`;

  try {
    // 1. Get latest commit SHA on target branch
    const refRes = await fetch(
      `https://api.github.com/repos/${cfg.repo}/git/ref/heads/${encodeURIComponent(cfg.branch)}`,
      { method: 'GET', headers, cache: 'no-store' }
    );
    if (!refRes.ok) {
      throw new Error(`브랜치 참조 조회 실패 (${refRes.status})`);
    }
    const refJson = (await refRes.json()) as { object?: { sha?: string } };
    const latestCommitSha = refJson?.object?.sha;
    if (!latestCommitSha) {
      throw new Error('최신 커밋 SHA를 찾을 수 없습니다.');
    }

    // 2. Get base tree SHA
    const commitRes = await fetch(
      `https://api.github.com/repos/${cfg.repo}/git/commits/${latestCommitSha}`,
      { method: 'GET', headers, cache: 'no-store' }
    );
    if (!commitRes.ok) {
      throw new Error(`기준 커밋 조회 실패 (${commitRes.status})`);
    }
    const commitJson = (await commitRes.json()) as { tree?: { sha?: string } };
    const baseTreeSha = commitJson?.tree?.sha;
    if (!baseTreeSha) {
      throw new Error('기준 트리 SHA를 찾을 수 없습니다.');
    }

    // 3. Create new tree with all 3 synchronized files
    const treeRes = await fetch(`https://api.github.com/repos/${cfg.repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: [
          { path: 'data/db.json', mode: '100644', type: 'blob', content: dbJsonContent },
          { path: 'public/data/db.json', mode: '100644', type: 'blob', content: dbJsonContent },
          { path: 'src/defaultData.ts', mode: '100644', type: 'blob', content: defaultDataTsContent },
        ],
      }),
    });
    if (!treeRes.ok) {
      const errText = await treeRes.text();
      throw new Error(`Git Tree 생성 실패 (${treeRes.status}): ${errText.slice(0, 140)}`);
    }
    const treeJson = (await treeRes.json()) as { sha?: string };
    const newTreeSha = treeJson?.sha;
    if (!newTreeSha) {
      throw new Error('새 트리 SHA가 반환되지 않았습니다.');
    }

    // 4. Create atomic commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${cfg.repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [latestCommitSha],
      }),
    });
    if (!newCommitRes.ok) {
      const errText = await newCommitRes.text();
      throw new Error(`Git Commit 생성 실패 (${newCommitRes.status}): ${errText.slice(0, 140)}`);
    }
    const newCommitJson = (await newCommitRes.json()) as { sha?: string; html_url?: string };
    const newCommitSha = newCommitJson?.sha;
    const commitUrl =
      newCommitJson?.html_url || `https://github.com/${cfg.repo}/commit/${newCommitSha}`;

    // 5. Fast-forward branch ref
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${cfg.repo}/git/refs/heads/${encodeURIComponent(cfg.branch)}`,
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
      throw new Error(`브랜치 업데이트 실패 (${updateRefRes.status}): ${errText.slice(0, 140)}`);
    }

    return {
      ok: true,
      commitUrl,
      message: `GitHub (${cfg.repo}@${cfg.branch})에 3중 데이터(db.json · public/data/db.json · defaultData.ts)가 원자적으로 커밋·푸시되었습니다.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'GitHub 직접 커밋 중 오류가 발생했습니다.',
    };
  }
}

/**
 * Fetches the latest `data/db.json` directly from GitHub Contents API when running on static hosting
 * with a configured token, so recently committed changes appear immediately even before GH Pages rebuilds.
 */
export async function fetchLatestDbFromGitHubDirect(): Promise<Record<string, unknown> | null> {
  const cfg = getGitHubDirectConfig();
  if (!cfg.token || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cfg.repo)) {
    return null;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.repo}/contents/data/db.json?ref=${encodeURIComponent(cfg.branch)}`,
      {
        method: 'GET',
        headers: getDirectGitHubHeaders(cfg.token),
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { content?: string; encoding?: string };
    if (json?.content && json.encoding === 'base64') {
      const binary = atob(json.content.replace(/\n/g, ''));
      const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
      const decoded = new TextDecoder('utf-8').decode(bytes);
      const parsed = JSON.parse(decoded);
      return parsed && typeof parsed === 'object' ? parsed : null;
    }
  } catch {}
  return null;
}

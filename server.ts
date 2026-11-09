import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_NAGA_DATA } from './src/defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data directory and db.json exist
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize db.json if not present
if (!fs.existsSync(DB_FILE)) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_NAGA_DATA, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to initialize db.json:', err);
  }
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper to read database
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return DEFAULT_NAGA_DATA;
}

// Helper to write database
function writeDatabase(data: unknown) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
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
  res.json({ success: true, data });
});

// 3. Update Site Data
app.post('/api/data', (req, res) => {
  const newData = req.body;
  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ success: false, message: '유효하지 않은 데이터 형식입니다.' });
  }

  const success = writeDatabase(newData);
  if (success) {
    return res.json({ success: true, message: '데이터가 성공적으로 저장되었습니다.' });
  }
  return res.status(500).json({ success: false, message: '데이터베이스 저장에 실패했습니다.' });
});

// 4. Reset Site Data to Seed Defaults
app.post('/api/data/reset', (req, res) => {
  const success = writeDatabase(DEFAULT_NAGA_DATA);
  if (success) {
    return res.json({ success: true, data: DEFAULT_NAGA_DATA, message: '기본 데이터로 초기화되었습니다.' });
  }
  return res.status(500).json({ success: false, message: '데이터 초기화에 실패했습니다.' });
});

// 5. Upload Image File (Base64)
app.post('/api/upload', async (req, res) => {
  try {
    const { imageBase64, filename } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: '이미지 데이터가 없습니다.' });
    }

    // Extract base64 payload & file extension
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

    const publicUrl = `/uploads/${finalFilename}`;
    return res.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      message: '이미지가 성공적으로 업로드되었습니다.',
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({
      success: false,
      message: '이미지 파일 저장 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================================
// SERVER INITIALIZATION (Vite in dev, static in prod)
// ============================================================================
async function startServer() {
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

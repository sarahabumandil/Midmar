import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import asyncHandler from '../middleware/asyncHandler.js';
import { authenticate, isAnalyst } from '../middleware/auth.js';
import { predictMarketValue, predictInjury, analyzeVideo, health } from '../controllers/aiController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(path.dirname(__dirname), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `video_${Date.now()}${path.extname(file.originalname) || '.mp4'}`)
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

const router = express.Router();

const PYTHON_API_URL = (process.env.PYTHON_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

// Path to Python API output_videos (relative to this file: server/routes/ai.js -> server/python-api/output_videos)
const outputVideosDir = path.resolve(__dirname, '..', 'python-api', 'output_videos');
if (!fs.existsSync(outputVideosDir)) {
  fs.mkdirSync(outputVideosDir, { recursive: true });
}

router.post('/predict/market-value', authenticate, isAnalyst, asyncHandler(predictMarketValue));
router.post('/predict/injury', authenticate, isAnalyst, asyncHandler(predictInjury));
router.post('/analyze-video', authenticate, isAnalyst, upload.single('video'), asyncHandler(analyzeVideo));

function isSafeOutputFilename(name) {
  if (!name || typeof name !== 'string') return false;
  return /^analysis_[a-fA-F0-9]+\.mp4$/.test(name) && !name.includes('..') && !path.isAbsolute(name);
}

function isPathInsideDir(filePath, dirPath) {
  const rel = path.relative(path.normalize(dirPath), path.normalize(filePath));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Stream from Python API when the file is not on the Node disk (same bytes Python wrote during analysis).
 */
async function proxyVideoFromPython(req, res, filename) {
  const url = `${PYTHON_API_URL}/output-videos/${encodeURIComponent(filename)}`;
  const headers = {};
  if (req.headers.range) {
    headers.Range = req.headers.range;
  }
  let upstream;
  try {
    upstream = await fetch(url, { headers });
  } catch (e) {
    return res.status(502).json({
      error: 'Python API unavailable',
      details: e instanceof Error ? e.message : String(e),
      hint: 'Start the Python API (e.g. npm run dev:python) and ensure PYTHON_API_URL matches it.',
    });
  }

  if (!upstream.ok) {
    let body;
    const text = await upstream.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text || upstream.statusText };
    }
    return res.status(upstream.status).json(body);
  }

  ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'].forEach((name) => {
    const v = upstream.headers.get(name);
    if (v) res.setHeader(name, v);
  });
  res.status(upstream.status);

  if (upstream.body) {
    const nodeStream = Readable.fromWeb(upstream.body);
    nodeStream.on('error', () => {
      if (!res.writableEnded) res.destroy();
    });
    return nodeStream.pipe(res);
  }
  return res.end();
}

router.get(
  '/analysis-output/:filename',
  asyncHandler(async (req, res) => {
    const { filename } = req.params;
    if (!isSafeOutputFilename(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const filePath = path.join(outputVideosDir, filename);
    const resolvedFile = path.resolve(filePath);
    const resolvedDir = path.resolve(outputVideosDir);

    if (fs.existsSync(resolvedFile) && isPathInsideDir(resolvedFile, resolvedDir)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.type('mp4');
      return new Promise((resolve, reject) => {
        res.sendFile(resolvedFile, (err) => {
          if (err && !res.headersSent) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    return proxyVideoFromPython(req, res, filename);
  })
);

router.get('/health', asyncHandler(health));

export default router;

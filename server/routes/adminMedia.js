import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { requirePool } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { logAudit } from '../lib/audit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

export const adminMediaRouter = Router();

function publicUploadUrl(req, filename) {
  const base =
    process.env.API_PUBLIC_URL?.replace(/\/$/, '') ||
    `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
}

// List all uploaded files
adminMediaRouter.get('/media', requireAdmin, async (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ files: [] });
    }

    const entries = fs.readdirSync(uploadsDir);
    const files = entries
      .map((name) => {
        try {
          const stat = fs.statSync(path.join(uploadsDir, name));
          if (!stat.isFile()) return null;
          return {
            name,
            url: publicUploadUrl(req, name),
            size: stat.size,
            modified: stat.mtime.toISOString(),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.modified) - new Date(a.modified));

    res.json({ files, total: files.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list media' });
  }
});

// Delete an uploaded file
adminMediaRouter.delete('/media/:filename', requireAdmin, async (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filePath);
    await logAudit(req.admin, 'delete', 'media', filename, { filename });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

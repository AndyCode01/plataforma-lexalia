import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// POST /api/upload  (multipart/form-data { file })
router.post('/', authRequired, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });
    const url = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
  } catch (err) {
    console.error('Error subiendo archivo:', err);
    return res.status(500).json({ message: 'Error subiendo archivo' });
  }
});

export default router;

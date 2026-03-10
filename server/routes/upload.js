import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// POST /api/upload  (multipart/form-data { file })
router.post('/', authRequired, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'La imagen no debe superar 2MB' });
      }
      return res.status(400).json({ message: `Error de carga: ${err.code}` });
    }

    if (err) {
      return res.status(400).json({ message: err.message || 'Archivo no valido' });
    }

    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });

    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename, size: req.file.size, mimetype: req.file.mimetype });
  });
});

export default router;

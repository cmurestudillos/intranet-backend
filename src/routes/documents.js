const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', req.user.uid, 'documentos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);

const upload = multer({
  storage,
  limits: { fileSize: maxSizeMB * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/json',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  },
});

router.get('/', auth, getDocuments);
router.post('/upload', auth, upload.single('file'), uploadDocument);
router.delete('/:id', auth, deleteDocument);

module.exports = router;

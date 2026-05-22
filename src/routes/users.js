const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { updateAvatar } = require('../controllers/userController');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', req.user.uid, 'perfil');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, 'avatar' + path.extname(file.originalname));
  },
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPEG, PNG o WebP'));
  },
});

router.put('/avatar', auth, uploadAvatar.single('avatar'), updateAvatar);

module.exports = router;

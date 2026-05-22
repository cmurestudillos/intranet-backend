const express = require('express')
const router = express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const { updateAvatar } = require('../controllers/userController')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Solo se permiten imágenes JPEG, PNG o WebP'))
  },
})

router.put('/avatar', auth, upload.single('avatar'), updateAvatar)

module.exports = router

const path = require('path')
const User = require('../models/User')
const { saveFile } = require('../storage')

async function updateAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ninguna imagen' })
  }

  try {
    const ext = path.extname(req.file.originalname)
    const url = await saveFile(req.file.buffer, `avatar${ext}`, `${req.user.uid}/perfil`)
    await User.findOneAndUpdate({ uid: req.user.uid }, { foto: url })
    res.json({ foto: url })
  } catch (error) {
    console.error('Error al actualizar avatar:', error.message)
    res.status(500).json({ message: 'Error al actualizar avatar' })
  }
}

module.exports = { updateAvatar }

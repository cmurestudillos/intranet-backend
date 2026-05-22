const path = require('path');
const User = require('../models/User');

async function updateAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ninguna imagen' });
  }

  const fileUrl = `/uploads/${req.user.uid}/perfil/${req.file.filename}`;

  try {
    await User.findOneAndUpdate({ uid: req.user.uid }, { foto: fileUrl });
    res.json({ foto: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar avatar' });
  }
}

module.exports = { updateAvatar };

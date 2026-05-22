const Chat = require('../models/Chat');

async function getMessages(req, res) {
  try {
    const messages = await Chat.find()
      .sort({ fecha: -1 })
      .limit(50)
      .lean();
    const normalized = messages
      .map(({ _id, ...m }) => ({ ...m, id: _id.toString() }))
      .reverse();
    res.json({ messages: normalized });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
}

async function sendMessage(req, res) {
  const { mensaje, nombre, foto } = req.body;
  try {
    const chat = await Chat.create({
      mensaje,
      nombre,
      foto,
      uid: req.user.uid,
      fecha: Date.now(),
    });
    const obj = chat.toObject();
    res.status(201).json({ message: { ...obj, id: obj._id.toString() } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { getMessages, sendMessage };

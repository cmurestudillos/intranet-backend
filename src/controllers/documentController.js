const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');

async function getDocuments(req, res) {
  try {
    const docs = await Document.find({ uid: req.user.uid }).sort({ fecha: -1 }).lean();
    const normalized = docs.map(({ _id, ...d }) => ({ ...d, id: _id.toString() }));
    res.json({ documents: normalized });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener documentos' });
  }
}

async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  const fileUrl = `/uploads/${req.user.uid}/documentos/${req.file.filename}`;
  try {
    const doc = await Document.create({
      nombre: req.file.originalname,
      uid: req.user.uid,
      tipo: req.file.mimetype,
      fecha: Date.now(),
      archivo: fileUrl,
    });
    const obj = doc.toObject();
    res.status(201).json({ document: { ...obj, id: obj._id.toString() } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteDocument(req, res) {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, uid: req.user.uid });
    if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });

    // Eliminar el archivo físico del servidor
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.join(process.cwd(), uploadDir, req.user.uid, 'documentos', path.basename(doc.archivo));
    fs.unlink(filePath, (err) => {
      if (err) console.warn('No se pudo eliminar el archivo físico:', err.message);
    });

    res.json({ message: 'Documento eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar documento' });
  }
}

module.exports = { getDocuments, uploadDocument, deleteDocument };

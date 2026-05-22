const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    uid: { type: String, required: true, index: true },
    tipo: { type: String, required: true },
    fecha: { type: Number, default: () => Date.now() },
    // Ruta relativa del archivo en el servidor (ej: "uploads/uid/archivo.pdf")
    archivo: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);

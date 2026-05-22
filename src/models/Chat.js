const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    mensaje: { type: String, required: true, maxlength: 100 },
    nombre: { type: String, required: true },
    foto: { type: String, default: '' },
    uid: { type: String, required: true },
    fecha: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

chatSchema.index({ fecha: -1 });

module.exports = mongoose.model('Chat', chatSchema);

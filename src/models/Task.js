const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, minlength: 5 },
    horas: { type: Number, required: true, min: 0 },
    prioridad: {
      type: String,
      enum: ['alta', 'media', 'relax'],
      required: true,
    },
    uid: { type: String, required: true, index: true },
    fecha: { type: String, default: () => new Date().toLocaleDateString('es-ES') },
    estado: { type: Boolean, default: false },
    mesTarea: { type: Number, min: 0, max: 11, default: () => new Date().getMonth() },
  },
  { timestamps: true }
);

taskSchema.index({ uid: 1, estado: 1 });

module.exports = mongoose.model('Task', taskSchema);

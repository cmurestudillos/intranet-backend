const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    foto: { type: String, default: '' },
    // uid = _id como string, para compatibilidad con el frontend
    uid: { type: String },
  },
  { timestamps: true }
);

// Antes de guardar, hashear la contraseña si fue modificada
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Establecer uid igual al _id después de crear
userSchema.post('save', function (doc) {
  if (!doc.uid) {
    doc.uid = doc._id.toString();
    // No re-save en post para evitar bucle; el controller lo gestiona
  }
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);

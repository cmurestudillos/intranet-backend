const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { uid: user.uid, email: user.email, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return { uid: user.uid, email: user.email, nombre: user.nombre, foto: user.foto };
}

// POST /api/auth/register
async function register(req, res) {
  const { nombre, email, password } = req.body;

  if (!nombre?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });
  }

  try {
    const existe = await User.findOne({ email: email.toLowerCase().trim() });
    if (existe) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
    }

    const user = new User({ nombre: nombre.trim(), email, password });
    await user.save();

    // Asignar uid = _id y guardar de nuevo
    user.uid = user._id.toString();
    await User.updateOne({ _id: user._id }, { uid: user.uid });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('Error en registro:', error.message);
    res.status(500).json({ message: 'Error al crear la cuenta' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const user = await User.findOne({ uid: req.user.uid }).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
}

module.exports = { register, login, getMe };

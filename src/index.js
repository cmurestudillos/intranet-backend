require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/database')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const taskRoutes = require('./routes/tasks')
const chatRoutes = require('./routes/chat')
const documentRoutes = require('./routes/documents')

const app = express()
const isVercel = !!process.env.VERCEL

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:8080'
app.use(
  cors({
    origin: isVercel ? '*' : allowedOrigin,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Archivos estáticos ────────────────────────────────────────────────────────
// En Vercel se usa /tmp (efímero). Para persistencia real usar Cloudinary / S3.
const uploadDir = process.env.UPLOAD_DIR || (isVercel ? '/tmp/uploads' : 'uploads')
app.use('/uploads', express.static(path.isAbsolute(uploadDir) ? uploadDir : path.join(process.cwd(), uploadDir)))

// ─── Conexión DB por request (Vercel serverless) ──────────────────────────────
// En local la conexión se hace una vez al arrancar; en Vercel cada función
// puede ser una instancia nueva, así que garantizamos la conexión aquí.
if (isVercel) {
  app.use(async (req, res, next) => {
    try {
      await connectDB()
      next()
    } catch (err) {
      res.status(500).json({ message: 'Error de conexión a la base de datos' })
    }
  })
}

// ─── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/documents', documentRoutes)

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', env: isVercel ? 'vercel' : 'local' })
)

// ─── Manejo de errores global ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.message)
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' })
})

// ─── Arranque ──────────────────────────────────────────────────────────────────
if (isVercel) {
  module.exports = app
} else {
  // Local: servidor HTTP completo con Socket.io para el chat en tiempo real
  const http = require('http')
  const { Server } = require('socket.io')
  const jwt = require('jsonwebtoken')
  const Chat = require('./models/Chat')

  const server = http.createServer(app)

  const io = new Server(server, {
    cors: { origin: allowedOrigin, methods: ['GET', 'POST'] },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Token requerido'))
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET)
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('chat:message', async (data) => {
      const { mensaje, nombre, foto } = data
      if (!mensaje || mensaje.length > 100) return
      try {
        const chat = await Chat.create({
          mensaje,
          nombre,
          foto,
          uid: socket.user.uid,
          fecha: Date.now(),
        })
        const obj = chat.toObject()
        io.emit('chat:message', { ...obj, id: obj._id.toString() })
      } catch (err) {
        socket.emit('chat:error', { message: err.message })
      }
    })
  })

  const PORT = process.env.PORT || 3000
  connectDB()
    .then(() => server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`)))
    .catch((err) => {
      console.error('Error al conectar MongoDB:', err.message)
      process.exit(1)
    })

  module.exports = app
}

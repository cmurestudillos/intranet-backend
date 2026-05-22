const mongoose = require('mongoose')

let cached = null

async function connectDB() {
  if (cached && mongoose.connection.readyState === 1) return cached

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI no está definida en las variables de entorno')

  cached = await mongoose.connect(uri)
  console.log(`MongoDB conectado: ${mongoose.connection.host}`)
  return cached
}

module.exports = connectDB

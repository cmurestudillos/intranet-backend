const fs = require('fs')
const path = require('path')

const isVercel = !!process.env.VERCEL

async function saveFile(buffer, filename, folder) {
  if (isVercel) {
    const { put } = require('@vercel/blob')
    const { url } = await put(`${folder}/${filename}`, buffer, { access: 'public' })
    return url
  }

  const uploadDir = process.env.UPLOAD_DIR || 'uploads'
  const dir = path.join(process.cwd(), uploadDir, folder)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), buffer)
  return `/${uploadDir}/${folder}/${filename}`
}

async function deleteFile(fileUrl) {
  if (!fileUrl) return

  if (fileUrl.startsWith('http')) {
    const { del } = require('@vercel/blob')
    await del(fileUrl)
  } else {
    const filePath = path.join(process.cwd(), fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl)
    fs.unlink(filePath, () => {})
  }
}

module.exports = { saveFile, deleteFile }

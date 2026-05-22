# Intranet — Backend

API REST + Socket.io para la aplicación de intranet personal. Node.js + Express + MongoDB.

## Stack

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| Node.js | 18+ | Runtime |
| Express | ^4.21 | API REST |
| MongoDB / Mongoose | ^8.9 | Base de datos |
| Socket.io | ^4.8 | Chat en tiempo real (solo local) |
| jsonwebtoken | ^9.0 | JWT |
| bcryptjs | ^3.0 | Hash de contraseñas |
| Multer | ^2.1 | Upload de archivos |
| pnpm | 11.1.3 | Package manager |

## Requisitos

- Node.js 18+
- pnpm 11+ → `npm install -g pnpm`
- MongoDB local o [Atlas](https://cloud.mongodb.com) (obligatorio en Vercel)

## Instalación

```bash
pnpm install
cp .env.example .env   # Editar con tus valores
pnpm dev               # http://localhost:3000
```

## Variables de entorno

```env
MONGODB_URI=mongodb://localhost:27017/intranet
JWT_SECRET=minimo_32_caracteres_aleatorios
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=http://localhost:8080
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=50
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Desarrollo con nodemon |
| `pnpm start` | Producción |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | Corrige errores automáticamente |

## API Endpoints

Todos los endpoints protegidos requieren `Authorization: Bearer <token>`.

### Auth
| Método | Ruta | Body | Auth |
|--------|------|------|------|
| POST | `/api/auth/register` | `{ nombre, email, password }` | — |
| POST | `/api/auth/login` | `{ email, password }` | — |
| GET | `/api/auth/me` | — | ✓ |

### Tareas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tasks?estado=false\|true` | Listar tareas |
| GET | `/api/tasks/:id` | Obtener tarea |
| POST | `/api/tasks` | Crear tarea `{ nombre, horas, prioridad }` |
| PUT | `/api/tasks/:id` | Editar tarea |
| PATCH | `/api/tasks/:id/estado` | Toggle pendiente/completada |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

### Chat
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/chat` | Últimos 50 mensajes |
| POST | `/api/chat` | Enviar mensaje (fallback REST) |

### Documentos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/documents` | Listar documentos |
| POST | `/api/documents/upload` | Subir archivo (`multipart/form-data`, campo `file`) |
| DELETE | `/api/documents/:id` | Eliminar documento |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| PUT | `/api/users/avatar` | Actualizar avatar (`multipart/form-data`, campo `avatar`) |
| GET | `/api/health` | Estado del servidor |

### Socket.io (solo local)
| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `chat:message` | cliente → servidor | Enviar mensaje |
| `chat:message` | servidor → clientes | Broadcast del mensaje |
| `chat:error` | servidor → cliente | Error en envío |

La autenticación del socket se hace pasando el JWT en el handshake:
```js
io(url, { auth: { token } })
```

## Estructura

```
src/
├── index.js              # Entry point (detecta local vs Vercel)
├── config/
│   └── database.js       # Conexión Mongoose con caché serverless
├── models/
│   ├── User.js
│   ├── Task.js
│   ├── Chat.js
│   └── Document.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── tasks.js
│   ├── chat.js
│   └── documents.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── taskController.js
│   ├── chatController.js
│   └── documentController.js
└── middleware/
    └── auth.js           # JWT middleware
```

## Deploy en Vercel

El backend está preparado para Vercel (`vercel.json` incluido). Importa la colección de Postman desde `postman_collection.json`.

**Limitaciones en Vercel:**
- Socket.io no funciona (serverless no soporta conexiones persistentes) — el historial de chat sí funciona vía REST
- Los archivos subidos se guardan en `/tmp` (efímero) — para producción real usa Cloudinary o S3

**Variables de entorno adicionales para Vercel:**
```env
MONGODB_URI=mongodb+srv://...   # Atlas obligatorio
UPLOAD_DIR=/tmp/uploads
FRONTEND_URL=https://tu-frontend.vercel.app
```

```bash
npx vercel
```

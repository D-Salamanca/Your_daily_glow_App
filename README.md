# Sentir · Tu compañero emocional

App de bienestar emocional personal. Reflexiona, procesa y crece emocionalmente cada día.

## Integrantes

| Nombre | GitHub |
|--------|--------|
| D. Salamanca | [@D-Salamanca](https://github.com/D-Salamanca) |

## Prototipo en Lovable

[Ver prototipo en Lovable →](https://lovable.dev)

> El prototipo inicial fue generado con Lovable (IA) y extendido manualmente con Firebase, Ionic y una capa de IA multiproveedor.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Mobile shell | Ionic React 8 |
| Estilos | Tailwind CSS + shadcn/ui + CSS Modules |
| Autenticación | Firebase Auth (email/password + Google OAuth) |
| Base de datos | Firebase Firestore (offline cache) |
| Tiempo real | Firestore `onSnapshot` listeners |
| IA / Chat | Claude (Anthropic) · Ollama (local) · Supabase Edge Function |
| Estado | React Context + TanStack React Query |
| HTTP | Axios personalizado (fetch API) |
| Animaciones | Framer Motion |

---

## Sensores del dispositivo

| Sensor | Hook |
|--------|------|
| Cámara | `usePermissions` → `getUserMedia` |
| Notificaciones | `usePermissions` → `Notification.requestPermission` |

---

## APIs consumidas

### Firebase / Firestore

| Operación | Método | Colección |
|-----------|--------|-----------|
| Crear perfil de usuario | `setDoc` | `users/{uid}` |
| Leer perfil | `getDoc` | `users/{uid}` |
| Actualizar perfil | `updateDoc` | `users/{uid}` |
| Guardar mensaje de diario | `addDoc` | `users/{uid}/journal` |
| Leer mensajes (paginado) | `getDocs` | `users/{uid}/journal` |
| Suscripción en tiempo real | `onSnapshot` | `users/{uid}/journal` |

### IA — Anthropic Claude

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/anthropic/v1/messages` | `POST` | Chat con streaming SSE |

### IA — Ollama (local)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/ollama/api/chat` | `POST` | Chat con streaming SSE |

### Supabase Edge Function (fallback)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/functions/v1/chat` | `POST` | Gateway de IA (Gemini) |

### JSONPlaceholder (demo HTTP Methods)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/posts?_limit=5` | `GET` | Listar metas |
| `/posts/:id` | `GET` | Detalle de meta |
| `/posts` | `POST` | Crear meta |
| `/posts/:id` | `PUT` | Actualizar meta |
| `/posts/:id` | `DELETE` | Eliminar meta |

---

## Estructura del proyecto

```
src/
├── helpers/          # Funciones generales reutilizables
├── contexts/         # Contextos de React (Auth)
├── hooks/            # Custom hooks
├── routes/           # AppRoutes, UserRoutes, AdminRoutes
├── pages/            # Páginas de la aplicación
├── components/
│   ├── Shared/       # Componentes compartidos + CSS Modules
│   ├── Index/        # Componentes de página + CSS Modules
│   └── ui/           # shadcn/ui (generado)
├── services/         # Servicios HTTP (Axios personalizado)
└── lib/              # Firebase, Firestore, utils
```

---

## Inicio rápido

```bash
npm install
npm start
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena:

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | Credenciales de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_STORAGE_BUCKET` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_ANTHROPIC_API_KEY` | API key de Claude |
| `VITE_ANTHROPIC_MODEL` | Modelo (default: `claude-haiku-4-5-20251001`) |
| `VITE_OLLAMA_MODEL` | Modelo local de Ollama (ej: `llama3.2`) |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase |

## Proveedor de IA

La app usa el primer proveedor configurado en este orden:

1. **Claude** — si `VITE_ANTHROPIC_API_KEY` tiene valor
2. **Ollama** — si `VITE_OLLAMA_MODEL` tiene valor (requiere `ollama serve`)
3. **Supabase Edge Function** — fallback por defecto

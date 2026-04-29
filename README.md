# Sentir · Tu compañero emocional

App de bienestar emocional personal. Reflexiona, procesa y crece emocionalmente cada día.

## Stack

- React 18 + TypeScript + Vite
- Ionic React (mobile shell)
- Tailwind CSS + shadcn/ui
- Firebase Authentication
- Supabase (base de datos)
- IA: Claude (Anthropic) · Ollama (local) · Supabase Edge Function

## Inicio rápido

```bash
npm install
npm start
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | Credenciales de Firebase (auth) |
| `VITE_FIREBASE_AUTH_DOMAIN` | |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_STORAGE_BUCKET` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_ANTHROPIC_API_KEY` | API key de Claude — [console.anthropic.com](https://console.anthropic.com) |
| `VITE_ANTHROPIC_MODEL` | Modelo (default: `claude-haiku-4-5-20251001`) |
| `VITE_OLLAMA_MODEL` | Modelo local de Ollama (ej: `llama3.2`) |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública de Supabase |

## Proveedor de IA

La app usa el primer proveedor configurado en este orden:

1. **Claude** — si `VITE_ANTHROPIC_API_KEY` tiene valor
2. **Ollama** — si `VITE_OLLAMA_MODEL` tiene valor (requiere `ollama serve`)
3. **Supabase Edge Function** — fallback por defecto

# Sentir · Tu compañero emocional

App de bienestar emocional personal. Reflexiona, procesa y crece emocionalmente cada día.

## Integrantes

| Nombre | GitHub |
|--------|--------|
| D. Salamanca | [@D-Salamanca](https://github.com/D-Salamanca) |

## Prototipo en Lovable

[Ver prototipo en Lovable →](https://id-preview--4ff98f0d-dada-472d-b1a4-38e349576a1a.lovable.app/)

> El prototipo inicial fue generado con Lovable (IA generativa) y extendido manualmente con Firebase, Capacitor, sensores nativos, mapas y capa de IA multiproveedor.

---

## Funcionalidades implementadas

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Login y registro con email/contraseña y Google OAuth (Firebase Auth) |
| Onboarding | Flujo de 6 pasos para personalizar la experiencia del usuario |
| Home | Dashboard con selector de emoción, racha diaria y gráfico emocional semanal (Recharts) |
| Diario IA | Chat con IA multiproveedor (Claude, Ollama, Supabase) con soporte de imágenes vía cámara o galería |
| Procesos | Actividades guiadas paso a paso con seguimiento de progreso y creación de procesos propios |
| Metas | Gestión de metas con demostración de HTTP Methods (GET, POST, PUT, DELETE) sobre JSONPlaceholder |
| Ciclo | Seguimiento opcional del ciclo menstrual con contexto emocional |
| Ajustes | Datos personales, preferencias, recordatorios diarios, modo claro/oscuro, permisos del dispositivo |
| Psicólogos cerca de ti | Mapa Leaflet con geolocalización real del dispositivo y recursos de salud mental |
| Cuenta demo | `demo@demo.com` / `demo12` con 7 días de historial emocional y racha precargados |

---

## Stack tecnológico

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18 | Framework principal de UI |
| TypeScript | 5 | Tipado estático |
| Vite | 5 | Bundler y servidor de desarrollo |
| Capacitor | 6 | Shell nativo para Android/iOS |
| Ionic React | 8 | Integración Capacitor + React (CSS únicamente) |
| Tailwind CSS | 3 | Estilos utilitarios |
| shadcn/ui | latest | Componentes accesibles (Radix UI) |
| CSS Modules | nativo | Estilos encapsulados por componente y página |
| Framer Motion | 11 | Animaciones fluidas |
| TanStack Query | 5 | Estado del servidor y caché HTTP |
| Recharts | 2 | Gráfico de área para historial emocional |
| Leaflet JS | 1.9 | Mapa interactivo (sin react-leaflet) |

### Backend / Servicios

| Servicio | Uso |
|---------|-----|
| Firebase Authentication | Login email/password + Google OAuth |
| Firebase Firestore | Perfiles, mensajes de diario, historial emocional (caché offline) |
| `@capacitor/preferences` | Almacenamiento nativo persistente en Android |
| Supabase Edge Functions | Gateway de IA (fallback) |
| Anthropic Claude API | Modelo de IA principal para el diario |
| Ollama (local) | Modelo de IA alternativo gratuito (llama3.2) |
| JSONPlaceholder | API pública para demostración de HTTP Methods |
| OpenStreetMap | Tiles gratuitos del mapa (sin API key) |

### Patrones de arquitectura

| Patrón | Implementación |
|--------|---------------|
| Component-based | Todos los módulos de UI son componentes React |
| Context API | `AuthContext` para estado de autenticación global |
| Custom Hooks | 10 hooks de sensores, permisos, UI y datos |
| Service Layer | `axiosInstance`, `goalsService`, `geocodeService` para HTTP |
| Helper Functions | `dateHelpers`, `emotionHelpers`, `storageHelpers` |
| Route Guards | `ProtectedRoute` en `AppRoutes` |
| Real-time updates | `onSnapshot` de Firestore para mensajes en vivo |
| SSE Streaming | Chat IA con respuestas carácter a carácter |
| Storage híbrido | `@capacitor/preferences` (nativo) + `localStorage` (web) |

---

## Sensores del dispositivo (Capacitor)

| Plugin | Sensor | Hook | API web (fallback) | Permiso Android |
|--------|--------|------|--------------------|----------------|
| `@capacitor/camera` | Cámara + Galería | `useCamera` | `<input type="file">` | `CAMERA`, `READ_MEDIA_IMAGES` |
| `@capacitor/geolocation` | GPS | `useGeolocation` | `navigator.geolocation` | `ACCESS_FINE_LOCATION` |
| `@capacitor/haptics` | Vibración | `useHaptics` | — | `VIBRATE` |
| `@capacitor/device` | Info del dispositivo | `useDevice` | `navigator.userAgent` | — |
| `@capacitor/filesystem` | Sistema de archivos | `useFilesystem` | — | `READ_EXTERNAL_STORAGE` |
| `@capacitor/local-notifications` | Notificaciones locales | `useLocalNotifications` | `Notification API` | `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM` |
| `@capacitor/push-notifications` | Push notifications | — | — | `RECEIVE_BOOT_COMPLETED` |
| `@capacitor/preferences` | Almacenamiento nativo | `storageHelpers` | `localStorage` | — |

Cada función verifica `Capacitor.isNativePlatform()` y cae al equivalente browser en web.

---

## APIs consumidas

| API | Método | Endpoint | Descripción |
|-----|--------|----------|-------------|
| Firebase Firestore | `setDoc` | `users/{uid}` | Crear perfil |
| Firebase Firestore | `getDoc` | `users/{uid}` | Leer perfil |
| Firebase Firestore | `updateDoc` | `users/{uid}` | Actualizar perfil |
| Firebase Firestore | `addDoc` | `users/{uid}/journal` | Guardar mensaje de diario |
| Firebase Firestore | `onSnapshot` | `users/{uid}/journal` | Escucha en tiempo real |
| Anthropic Claude | `POST` | `/anthropic/v1/messages` | Chat con streaming SSE |
| Ollama | `POST` | `/ollama/api/chat` | Chat local con streaming SSE |
| Supabase | `POST` | `/functions/v1/chat` | Gateway de IA (fallback) |
| JSONPlaceholder | `GET/POST/PUT/DELETE` | `/posts` | Demo de HTTP Methods en Metas |
| OpenStreetMap | `GET` | `{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Tiles del mapa |

---

## Estructura del proyecto

```
src/
├── helpers/                   # Funciones puras reutilizables
│   ├── dateHelpers.ts         # Saludo, formato de fechas, cálculo de racha
│   ├── emotionHelpers.ts      # Lista de emociones, getEmotion, mensajes
│   └── storageHelpers.ts      # Wrappers sync/async sobre Storage
├── lib/
│   ├── firebase.ts            # Inicialización Firebase
│   ├── firestore.ts           # CRUD helpers de Firestore
│   ├── storage.ts             # Capa unificada: Preferences (nativo) / localStorage (web)
│   └── utils.ts
├── contexts/
│   └── AuthContext.tsx        # Proveedor de autenticación Firebase
├── hooks/
│   ├── useCamera.ts           # Foto + galería (@capacitor/camera)
│   ├── useGeolocation.ts      # GPS (@capacitor/geolocation)
│   ├── useHaptics.ts          # Vibración (@capacitor/haptics)
│   ├── useDevice.ts           # Info del dispositivo (@capacitor/device)
│   ├── useFilesystem.ts       # Sistema de archivos (@capacitor/filesystem)
│   ├── useLocalNotifications.ts
│   ├── usePermissions.ts      # Estado y solicitud de permisos
│   ├── useUserProfile.ts      # Perfil de usuario desde Firestore
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── routes/
│   ├── AppRoutes.tsx          # Rutas centrales + ProtectedRoute
│   ├── UserRoutes.tsx         # Rutas autenticadas
│   └── AdminRoutes.tsx        # Rutas de administrador
├── pages/                     # Cada página en su propia subcarpeta
│   ├── Home/index.tsx + Home.module.css
│   ├── Login/index.tsx + Login.module.css
│   ├── Journal/index.tsx + Journal.module.css
│   ├── Processes/index.tsx + Processes.module.css
│   ├── Savings/index.tsx + Savings.module.css
│   ├── Settings/index.tsx + Settings.module.css
│   ├── ProfessionalHelp/index.tsx + ProfessionalHelp.module.css
│   ├── Onboarding/index.tsx + Onboarding.module.css
│   ├── CycleTracking/index.tsx + CycleTracking.module.css
│   ├── NotFound/index.tsx + NotFound.module.css
│   └── Index/index.tsx
├── components/
│   ├── Shared/                # Componentes reutilizables + CSS Modules
│   │   ├── BottomNav.tsx + BottomNav.module.css
│   │   ├── EmotionPicker.tsx + EmotionPicker.module.css
│   │   └── MapsComponent.tsx + MapsComponent.module.css
│   ├── Index/                 # Componentes del home + CSS Modules
│   │   ├── ActivityCard.tsx + ActivityCard.module.css
│   │   ├── EmotionChart.tsx + EmotionChart.module.css
│   │   └── StreakCounter.tsx + StreakCounter.module.css
│   └── ui/                   # shadcn/ui (57 componentes)
├── services/
│   ├── axiosInstance.ts       # Cliente HTTP personalizado (fetch API)
│   ├── goalsService.ts        # CRUD de metas
│   └── geocodeService.ts
└── main.tsx
```

---

## Modelo de datos (Firestore)

```
users/
  {uid}/
    uid, email, displayName, onboarded, cycleEnabled
    streak, lastCheckin, todayEmotion
    emotionHistory: [{ date: string, emotion: string }]
    onboardingData: { preference, gender, cycle, goal, time }
    createdAt, updatedAt (serverTimestamp)

    journal/
      {messageId}/
        role: "user" | "assistant"
        content: string
        imageUrl?: string
        createdAt: serverTimestamp
```

---

## Flujo de autenticación

```
/ (Index)
  └── isLoggedIn?
        ├── isOnboarded? → /home
        └── else         → /onboarding
      else → /login

/login
  ├── Email + contraseña → Firebase signInWithEmailAndPassword
  ├── Google             → signInWithPopup(googleProvider)
  └── Registro           → createUserWithEmailAndPassword
        → createUserProfile(Firestore)
        → navigate("/onboarding")
```

---

## Almacenamiento local

| Clave | Valor | Uso |
|-------|-------|-----|
| `sentir-streak` | número | Racha de días consecutivos |
| `sentir-last-checkin` | fecha | Última selección de emoción |
| `sentir-today-emotion` | string | Emoción del día |
| `sentir-emotion-history` | JSON array | Historial de 30 días |
| `sentir-onboarded` | `"true"` | Flag de onboarding completado |
| `sentir-theme` | `"light"/"dark"/"system"` | Preferencia de tema |
| `sentir-profile-name` | string | Nombre en ajustes |
| `sentir-preferences` | JSON | Preferencias de bienestar |
| `sentir-reminder` | JSON | Configuración del recordatorio |
| `sentir-demo-seeded` | fecha | Evita re-seed del demo en el mismo día |

En Android se usa `@capacitor/preferences` (grupo `SentirApp`). `storageHelpers.ts` provee la capa unificada.

---

## Decisiones técnicas

1. **Sin axios npm** — `AxiosInstance` personalizado sobre `fetch` para demostrar HTTP Methods sin dependencia externa.
2. **Capacitor + React sin IonApp** — Ionic se usa solo para CSS; `structure.css` bloqueaba el scroll en web y fue removido.
3. **Leaflet sin react-leaflet** — Leaflet JS puro (`L.map(el)`) evita el bug de página en blanco de react-leaflet v5 en Vite.
4. **localStorage-first en Ajustes** — Los ajustes se guardan primero en localStorage; Firestore es fire-and-forget (`.catch(() => {})`).
5. **Múltiples proveedores de IA** — Prioridad: Claude → Ollama → Supabase, configurable por variables de entorno.
6. **Seed del demo por fecha** — El historial demo se re-siembra si cambia el día o se limpia el storage.

---

## Inicio rápido

```bash
npm install        # instalar dependencias
npm run dev        # desarrollo web

npm run build      # build de producción
npx cap sync android   # sincronizar con Android
npx cap open android   # abrir en Android Studio
```

---

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

El primer proveedor de IA configurado tiene prioridad: **Claude** → **Ollama** → **Supabase**.

---

## Branches

| Branch | Descripción |
|--------|-------------|
| `main` | Producción estable |
| `feature/sensores` | Integración Capacitor + sensores nativos |
| `claude/add-axios-http-methods-*` | Capa HTTP con Axios personalizado |

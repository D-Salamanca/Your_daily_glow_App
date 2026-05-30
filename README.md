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

# 📱 Capturas de la Aplicación

## 🔐 Login

<div align="center">

<img src="https://github.com/user-attachments/assets/c2f3798b-8f9a-48eb-a594-4229792863cf" width="30%">
<img src="https://github.com/user-attachments/assets/0b4911ad-a2ee-45af-912c-544e3c3571bd" width="30%">
<img src="https://github.com/user-attachments/assets/1bc7704b-421a-4694-ab57-c36af044c758" width="30%">

<img src="https://github.com/user-attachments/assets/a9d514a1-e35b-4477-a692-5390a72e991b" width="30%">
<img src="https://github.com/user-attachments/assets/31616ba9-d483-46d6-897d-5a64852546fd" width="30%">
<img src="https://github.com/user-attachments/assets/2ca53202-f473-4af3-90d6-70ce9b10ba99" width="30%">

<img src="https://github.com/user-attachments/assets/8cd63c04-5419-44f6-8fc2-c6b7fc358c8c" width="30%">

</div>

---

## 🏠 Home

<div align="center">

<img src="https://github.com/user-attachments/assets/35e0d340-0f43-469c-b901-7161796aa813" width="30%">

</div>

---

## 🤖 Chatbot

<div align="center">

<img src="https://github.com/user-attachments/assets/f5da7fdc-58b6-4efe-81d5-e0da4fe6e7ff" width="30%">
<img src="https://github.com/user-attachments/assets/f6ba490b-9cb8-4a1a-9500-5c0cb67d12ff" width="30%">

</div>

---

## 📈 Proceso

<div align="center">

<img src="https://github.com/user-attachments/assets/1989488e-839f-4896-9d43-d163641440ee" width="30%">
<img src="https://github.com/user-attachments/assets/9f3f2385-ef88-4883-a04f-5e49d25b6eb3" width="30%">
<img src="https://github.com/user-attachments/assets/e077f651-04d0-4329-b406-3152c2a16c4e" width="30%">

<img src="https://github.com/user-attachments/assets/802057b6-a58a-432f-8588-ca6d03ed7271" width="30%">

</div>

---

## 🎯 Metas

<div align="center">

<img src="https://github.com/user-attachments/assets/414f7a41-f984-4d3e-9e16-563c451ef267" width="30%">
<img src="https://github.com/user-attachments/assets/7bd2ca0c-47cc-4264-b46c-57512df7692f" width="30%">

</div>

---

## ❓ Ayuda

<div align="center">

<img src="https://github.com/user-attachments/assets/2f3c8940-8d22-4d9c-8777-d4d15cd64b05" width="30%">
<img src="https://github.com/user-attachments/assets/7a108641-580c-4368-b122-e28ec0ea4569" width="30%">

</div>

---

## ⚙️ Ajustes

<div align="center">

<img src="https://github.com/user-attachments/assets/9f61244d-d9b7-42a1-b734-c8fd01004ef4" width="30%">
<img src="https://github.com/user-attachments/assets/9b7a37e5-ba7d-46bd-9b4d-fcf17321c690" width="30%">
<img src="https://github.com/user-attachments/assets/e2465062-2b95-46b2-8db7-4ac2e48d9c2d" width="30%">

<img src="https://github.com/user-attachments/assets/5ee74bf9-7a94-4891-a028-0f53246d994e" width="30%">
<img src="https://github.com/user-attachments/assets/3d90558a-51d2-463f-90b0-d220b36a63b5" width="30%">
<img src="https://github.com/user-attachments/assets/861d7da3-6c30-41e7-8036-32599d5cb22e" width="30%">

<img src="https://github.com/user-attachments/assets/dfba0bc1-e434-48fc-8552-f1b2ff901404" width="30%">

</div>

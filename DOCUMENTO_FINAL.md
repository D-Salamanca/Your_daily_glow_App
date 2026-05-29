# Documento Final — Sentir · App de Bienestar Emocional

## 1. Descripción del proyecto

**Sentir** es una aplicación móvil/web de bienestar emocional desarrollada con Ionic + React + Firebase. Permite a los usuarios registrar su estado emocional diario, llevar un diario conversacional con IA, seguir procesos de crecimiento personal y gestionar metas de bienestar.

---

## 2. Alcance

### Funcionalidades implementadas

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Login y registro con email/contraseña y Google OAuth (Firebase Auth) |
| Onboarding | Flujo de 6 pasos para personalizar la experiencia del usuario |
| Home | Dashboard con selector de emoción, racha diaria y tarjetas de actividades |
| Diario IA | Chat conversacional con IA multiproveedor (Claude, Ollama, Supabase) con soporte de imágenes |
| Procesos | Actividades guiadas paso a paso con seguimiento de progreso |
| Metas | Gestión de metas financieras y personales con métodos HTTP (GET, POST, PUT, DELETE) |
| Ciclo | Seguimiento opcional del ciclo menstrual con contexto emocional |
| Ajustes | Gestión de permisos de cámara y notificaciones, cierre de sesión |
| Ayuda | Recursos de salud mental y contactos profesionales |

### Funcionalidades excluidas del alcance

- Mapas geográficos (no aplica al concepto)
- Carrito de compras (no aplica al concepto)
- Panel de administración (estructura creada, sin UI)
- Modo offline completo (Firestore tiene caché local parcial)

---

## 3. Tecnologías utilizadas

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18 | Framework principal de UI |
| TypeScript | 5 | Tipado estático |
| Vite | 5 | Bundler y servidor de desarrollo |
| Ionic React | 8 | Shell móvil y componentes nativos |
| Tailwind CSS | 3 | Sistema de estilos utilitarios |
| shadcn/ui | latest | Componentes de UI accesibles (Radix UI) |
| CSS Modules | nativo | Estilos encapsulados por componente |
| Framer Motion | 11 | Animaciones fluidas |
| TanStack Query | 5 | Estado del servidor y caché de datos |

### Backend / Servicios

| Servicio | Uso |
|---------|-----|
| Firebase Authentication | Login email/password + Google OAuth |
| Firebase Firestore | Base de datos de perfiles y mensajes con caché offline |
| Supabase Edge Functions | Gateway de IA (fallback) |
| Anthropic Claude API | Modelo de IA principal para el diario |
| Ollama (local) | Modelo de IA alternativo gratuito |

### Patrones de arquitectura

| Patrón | Implementación |
|--------|---------------|
| Component-based | Todos los módulos de UI son componentes React |
| Context API | `AuthContext` para estado de autenticación global |
| Custom Hooks | `usePermissions`, `useUserProfile`, `useToast`, `use-mobile` |
| Service Layer | `axiosInstance`, `goalsService` para HTTP |
| Helper Functions | `dateHelpers`, `emotionHelpers`, `storageHelpers` |
| Route Guards | `ProtectedRoute` en `AppRoutes` |
| Real-time updates | `onSnapshot` de Firestore para mensajes en vivo |
| SSE Streaming | Chat IA con respuestas en tiempo real |

---

## 4. Estructura de carpetas

```
src/
├── helpers/            # Funciones puras reutilizables
│   ├── dateHelpers.ts
│   ├── emotionHelpers.ts
│   └── storageHelpers.ts
├── contexts/           # React Context (estado global)
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   ├── usePermissions.ts
│   ├── useUserProfile.ts
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── routes/             # Configuración de rutas
│   ├── AppRoutes.tsx
│   ├── UserRoutes.tsx
│   └── AdminRoutes.tsx
├── pages/              # Vistas de la aplicación
│   ├── Index.tsx
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   ├── Home.tsx
│   ├── Journal.tsx
│   ├── Processes.tsx
│   ├── Savings.tsx
│   ├── Settings.tsx
│   ├── CycleTracking.tsx
│   ├── ProfessionalHelp.tsx
│   └── NotFound.tsx
├── components/
│   ├── Shared/         # Componentes compartidos + CSS Modules
│   │   ├── BottomNav.tsx + BottomNav.module.css
│   │   └── EmotionPicker.tsx + EmotionPicker.module.css
│   ├── Index/          # Componentes de página + CSS Modules
│   │   ├── ActivityCard.tsx + ActivityCard.module.css
│   │   └── StreakCounter.tsx + StreakCounter.module.css
│   └── ui/             # shadcn/ui (57 componentes)
├── services/           # Capa de HTTP
│   ├── axiosInstance.ts
│   └── goalsService.ts
└── lib/                # Inicialización de servicios
    ├── firebase.ts
    ├── firestore.ts
    └── utils.ts
```

---

## 5. Modelo de datos (Firestore)

```
users/
  {uid}/
    uid, email, displayName, onboarded, cycleEnabled
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

## 6. Flujo de autenticación

```
/ (Index)
  └── isOnboarded? → /home
      isLoggedIn?  → /onboarding
      else         → /login

/login
  ├── Email + contraseña → Firebase signInWithEmailAndPassword
  ├── Google             → signInWithPopup(googleProvider)
  └── Registro           → createUserWithEmailAndPassword
        → createUserProfile(Firestore)
        → navigate("/onboarding")
```

---

## 7. Sensores del dispositivo

| Sensor | API Web | Estado reportado |
|--------|---------|-----------------|
| Cámara | `navigator.mediaDevices.getUserMedia` | granted / denied / prompt / unsupported |
| Notificaciones | `Notification.requestPermission` | granted / denied / prompt / unsupported |

Los permisos se gestionan en `usePermissions.ts` y se muestran en la pantalla de Ajustes.

---

## 8. Comunicación en tiempo real

- **Chat IA**: SSE (Server-Sent Events) — respuestas se renderizan carácter a carácter
- **Mensajes del diario**: `onSnapshot` de Firestore — sincronización en tiempo real entre pestañas y dispositivos

---

## 9. Decisiones técnicas relevantes

1. **Sin axios npm** — Se implementó una clase `AxiosInstance` personalizada sobre `fetch` para cumplir el requisito de HTTP Methods sin dependencia externa.
2. **Múltiples proveedores de IA** — Prioridad configurable: Claude → Ollama → Supabase, sin cambiar código.
3. **Firestore offline** — `persistentLocalCache` con `persistentMultipleTabManager` permite uso sin conexión.
4. **CSS Modules + Tailwind** — Coexisten: Tailwind para utilidades rápidas, CSS Modules para estilos encapsulados por componente.
5. **Re-exports de compatibilidad** — Los archivos originales de componentes son re-exports de las versiones en `Shared/` e `Index/`, evitando romper imports existentes.

---

*Documento generado como parte del proyecto final — Ionic + React + Firebase*

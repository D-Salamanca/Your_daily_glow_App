# Documento Final — Sentir · App de Bienestar Emocional

## 1. Descripción del sistema

**Sentir** es una aplicación móvil/web de bienestar emocional que acompaña al usuario en el registro diario de sus emociones, la reflexión personal asistida por IA y el seguimiento de su progreso emocional a lo largo del tiempo. Funciona tanto en navegador web como en Android nativo a través de Capacitor.

---

## 2. Alcance

### Objetivos del sistema

- Permitir al usuario registrar su estado emocional diario y mantener una racha de hábito.
- Proveer un diario conversacional con inteligencia artificial que procese texto e imágenes.
- Mostrar el historial emocional de la última semana en un gráfico visual.
- Guiar al usuario en procesos de crecimiento personal paso a paso.
- Conectar al usuario con recursos de salud mental y psicólogos cercanos usando geolocalización.
- Gestionar metas personales con operaciones HTTP completas (GET, POST, PUT, DELETE).
- Funcionar en web y Android con los mismos sensores nativos del dispositivo.

### Funcionalidades incluidas

| Módulo | Alcance |
|--------|---------|
| Autenticación | Login, registro y Google OAuth via Firebase. Onboarding de 6 pasos al registrarse por primera vez. |
| Check-in emocional | Selector diario de emoción, cálculo de racha, gráfico de los últimos 7 días. |
| Diario IA | Chat con IA (texto + imágenes). Historial persistido en Firestore con sincronización en tiempo real. |
| Procesos | Actividades guiadas con pasos y progreso. El usuario puede crear procesos propios. |
| Metas | CRUD completo sobre JSONPlaceholder como demostración de los 4 métodos HTTP. |
| Seguimiento de ciclo | Módulo opcional para registro del ciclo menstrual con contexto emocional por fase. |
| Ajustes | Perfil, preferencias de bienestar, recordatorio diario, modo oscuro/claro y gestión de permisos. |
| Psicólogos cerca de ti | Mapa con geolocalización real del dispositivo, marcadores de recursos y listado de líneas de ayuda. |

### Decisiones de alcance

- **Modo offline parcial**: Home, Procesos y Metas funcionan sin conexión. El resto de secciones (Diario IA, Ajustes, Ciclo, Psicólogos) muestran una pantalla de aviso y redirigen a las secciones disponibles. Firestore tiene caché local activado para los datos ya descargados.

---

## 3. Tecnologías utilizadas y justificación

### Framework y plataforma

- **React 18 + TypeScript + Vite** — base estándar para aplicaciones web modernas con tipado estricto y build rápido.
- **Capacitor 6** — permite compilar el mismo código web a Android/iOS sin mantener dos codebases. Se eligió sobre React Native para reutilizar al 100% los componentes web.
- **Ionic React (solo CSS)** — se integra con Capacitor para estilos nativos. `IonApp`/`IonContent` fueron descartados porque `structure.css` bloqueaba el scroll en web; se usa únicamente la capa de estilos.

### Almacenamiento y base de datos

- **Firebase Firestore** — base de datos NoSQL en tiempo real con caché offline. Elegida por su integración directa con Firebase Auth y por la función `onSnapshot` que evita polling.
- **`@capacitor/preferences`** — reemplaza `localStorage` en Android para persistencia nativa real. Se implementó una capa unificada (`storage.ts`) que elige automáticamente según la plataforma.
- **localStorage-first en Ajustes** — los ajustes se guardan primero en local (siempre disponible) y Firestore recibe la actualización en segundo plano (`.catch(() => {})`), evitando bloqueos por red.

### Inteligencia artificial

- **Anthropic Claude API** — modelo principal. Se consume via proxy en Vite para no exponer la API key en el cliente.
- **Ollama (local)** — alternativa gratuita que no requiere conexión a internet. Permite desarrollo sin costos.
- **Supabase Edge Function** — fallback que actúa como gateway de IA. El sistema detecta automáticamente qué proveedor usar según las variables de entorno.
- Todos los proveedores usan **SSE (Server-Sent Events)** para renderizar respuestas carácter a carácter.

### Mapas y geolocalización

- **Leaflet JS (sin react-leaflet)** — se descartó react-leaflet v5 por un bug de página en blanco en Vite. La implementación usa `L.map(el)` directamente sobre un `ref` de React.
- **`@capacitor/geolocation`** — en Android accede al GPS nativo; en web cae a `navigator.geolocation`. El patrón `Capacitor.isNativePlatform()` unifica ambas rutas.
- **OpenStreetMap tiles** — solución gratuita sin API key para los tiles del mapa.

### Estilos

- **Tailwind CSS** — utilidades rápidas para layout y tipografía.
- **CSS Modules** — cada página (`pages/X/X.module.css`) y componente (`components/Shared/`, `components/Index/`) tiene su módulo de estilos encapsulado para evitar colisiones de clases.
- Ambos coexisten: Tailwind para estructuras generales, CSS Modules para variantes específicas.

### HTTP y estado

- **Axios personalizado (`axiosInstance.ts`)** — implementado sobre `fetch` nativo para cumplir el requisito de HTTP Methods sin instalar el paquete `axios`.
- **TanStack React Query** — gestión del estado del servidor con caché, invalidación y mutaciones en la página de Metas.

---

*Proyecto final — Ionic + React + Firebase*

/**
 * seedDemo.mjs
 * Creates the demo@demo.com / demo12 account in Firebase and populates
 * Firestore with 7 days of emotion history + journal conversations.
 *
 * Run: node scripts/seedDemo.mjs
 * Requires Node 18+ (built-in fetch).
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Read .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, "..", ".env");
  const content = readFileSync(envPath, "utf-8");
  return Object.fromEntries(
    content
      .split("\n")
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => {
        const [k, ...v] = l.split("=");
        return [k.trim(), v.join("=").trim()];
      })
  );
}

const env        = loadEnv();
const API_KEY    = env.VITE_FIREBASE_API_KEY;
const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;

if (!API_KEY || !PROJECT_ID) {
  console.error("❌  VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID missing from .env");
  process.exit(1);
}

const AUTH_URL = `https://identitytoolkit.googleapis.com/v1`;
const FS_URL   = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Firebase Auth helpers ────────────────────────────────────────────────────
async function createOrSignIn() {
  // Try create
  let res = await fetch(`${AUTH_URL}/accounts:signUp?key=${API_KEY}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email: "demo@demo.com", password: "demo12", returnSecureToken: true }),
  });

  let data = await res.json();

  if (data.error?.message === "EMAIL_EXISTS") {
    // Already exists → sign in
    res = await fetch(`${AUTH_URL}/accounts:signInWithPassword?key=${API_KEY}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: "demo@demo.com", password: "demo12", returnSecureToken: true }),
    });
    data = await res.json();
  }

  if (!data.idToken) throw new Error("Auth failed:\n" + JSON.stringify(data, null, 2));
  console.log(`✅  Signed in as demo@demo.com (uid: ${data.localId})`);
  return { token: data.idToken, uid: data.localId };
}

// ── Firestore value helpers ──────────────────────────────────────────────────
function toFS(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string")  return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number")  return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value))       return { arrayValue: { values: value.map(toFS) } };
  if (typeof value === "object")  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toFS(v)])) } };
  return { stringValue: String(value) };
}

function fieldsOf(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toFS(v)]));
}

async function patchDoc(path, obj, token) {
  const keys   = Object.keys(obj).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
  const res    = await fetch(`${FS_URL}/${path}?${keys}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ fields: fieldsOf(obj) }),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${await res.text()}`);
  return res.json();
}

async function addDoc(collPath, obj, token) {
  const res = await fetch(`${FS_URL}/${collPath}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ fields: fieldsOf(obj) }),
  });
  if (!res.ok) throw new Error(`POST ${collPath} failed: ${await res.text()}`);
  return res.json();
}

// ── Build demo data ──────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date(Date.now() - n * 86_400_000);
  return d.toDateString(); // e.g. "Thu May 22 2026"
}

const EMOTION_HISTORY = [
  { date: daysAgo(0), emotion: "Bien"        },
  { date: daysAgo(1), emotion: "Tranquilo/a" },
  { date: daysAgo(2), emotion: "Bien"        },
  { date: daysAgo(3), emotion: "Regular"     },
  { date: daysAgo(4), emotion: "Bajo/a"      },
  { date: daysAgo(5), emotion: "Bien"        },
  { date: daysAgo(6), emotion: "Frustrado/a" },
];

const JOURNAL_MESSAGES = [
  // Day 6 — Frustrado/a
  { role: "user",      content: "Hoy estoy muy frustrado/a. Nada me salió bien en el trabajo.",                                         daysAgo: 6 },
  { role: "assistant", content: "Entiendo, es agotador cuando el día no va como esperas. ¿Qué fue lo que más te pesó hoy?",               daysAgo: 6 },
  { role: "user",      content: "Un proyecto que preparé mucho tiempo lo rechazaron sin explicación.",                                   daysAgo: 6 },
  { role: "assistant", content: "Eso duele. Dedicarle tiempo y esfuerzo a algo y no recibir feedback es muy frustrante. Tu esfuerzo tiene valor, independientemente del resultado. 💙", daysAgo: 6 },

  // Day 4 — Bajo/a
  { role: "user",      content: "Me siento bajo/a hoy. Sin energía para nada.",                                                         daysAgo: 4 },
  { role: "assistant", content: "A veces el cuerpo y la mente necesitan parar. ¿Has podido descansar bien esta semana?",                  daysAgo: 4 },
  { role: "user",      content: "No, duermo poco. Muchas preocupaciones en la cabeza.",                                                  daysAgo: 4 },
  { role: "assistant", content: "El sueño es vital para el estado emocional. ¿Qué te da más vueltas en la cabeza antes de dormir? A veces escribirlo ayuda a soltarlo. 🌙", daysAgo: 4 },

  // Day 3 — Regular
  { role: "user",      content: "Hoy regular, ni bien ni mal. Un día gris.",                                                             daysAgo: 3 },
  { role: "assistant", content: "Los días grises también son parte de la vida. ¿Hiciste algo pequeño para ti hoy?",                       daysAgo: 3 },
  { role: "user",      content: "Me tomé un café tranquilo y escuché música. Eso fue lo mejor del día.",                                 daysAgo: 3 },
  { role: "assistant", content: "Eso es autocuidado puro. Los momentos pequeños cuentan mucho más de lo que creemos. ✨",                 daysAgo: 3 },

  // Day 2 — Bien
  { role: "user",      content: "Hoy me siento bien. Salí a caminar y me despejé.",                                                      daysAgo: 2 },
  { role: "assistant", content: "¡Qué bien! El movimiento y el aire fresco hacen maravillas. ¿A dónde fuiste?",                           daysAgo: 2 },
  { role: "user",      content: "Al parque cerca de casa. Vi un perro muy gracioso y me hizo reír.",                                     daysAgo: 2 },
  { role: "assistant", content: "Las risas inesperadas son un regalo. Me alegra que hayas tenido ese momento de alegría hoy. 🐶💚",        daysAgo: 2 },

  // Day 1 — Tranquilo/a
  { role: "user",      content: "Hoy estoy tranquilo/a. Día de reuniones pero me sentí seguro/a.",                                       daysAgo: 1 },
  { role: "assistant", content: "Esa sensación de seguridad en situaciones que antes te ponían nervioso/a es crecimiento real. ¿Qué te ayudó a sentirte así?", daysAgo: 1 },
  { role: "user",      content: "Preparé bien las cosas la noche anterior. Me sentí con el control.",                                    daysAgo: 1 },
  { role: "assistant", content: "La preparación genera confianza. Vas construyendo un patrón muy saludable. Sigue así. 🌿",               daysAgo: 1 },

  // Today — Bien
  { role: "user",      content: "¡Hoy me siento bien! Empezando la semana con buena energía.",                                           daysAgo: 0 },
  { role: "assistant", content: "¡Eso es fantástico! ¿Qué está alimentando esa buena energía hoy?",                                       daysAgo: 0 },
  { role: "user",      content: "Dormí bien, desayuné tranquilo y el día arrancó sin estrés.",                                           daysAgo: 0 },
  { role: "assistant", content: "Las mañanas tranquilas marcan el tono del día entero. Llevas 7 días seguidos conectando contigo mismo/a. ¡Eso es una racha increíble! 🔥", daysAgo: 0 },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Seeding demo account…\n");

  const { token, uid } = await createOrSignIn();

  // ── User profile ────────────────────────────────────────────────────────
  const profile = {
    uid,
    email:           "demo@demo.com",
    displayName:     "Demo ✨",
    onboarded:       true,
    cycleEnabled:    false,
    streak:          7,
    lastCheckin:     daysAgo(0),
    todayEmotion:    "Bien",
    emotionHistory:  EMOTION_HISTORY,
    onboardingData:  { preference: "mixed", gender: "female", goal: "feel-better", time: "5" },
  };

  await patchDoc(`users/${uid}`, profile, token);
  console.log("✅  User profile created in Firestore");

  // ── Journal messages ────────────────────────────────────────────────────
  let msgCount = 0;
  for (const msg of JOURNAL_MESSAGES) {
    const ts = new Date(Date.now() - msg.daysAgo * 86_400_000 + msgCount * 60_000).toISOString();
    await addDoc(`users/${uid}/journal`, {
      role:      msg.role,
      content:   msg.content,
      createdAt: ts,
    }, token);
    msgCount++;
  }
  console.log(`✅  ${JOURNAL_MESSAGES.length} journal messages created`);

  console.log("\n🎉  Demo account ready!");
  console.log("   Email:    demo@demo.com");
  console.log("   Password: demo12");
  console.log(`   Streak:   7 días 🔥`);
  console.log(`   Emotions: ${EMOTION_HISTORY.map(e => e.emotion).join(" → ")}`);
}

main().catch((err) => { console.error("❌ ", err.message); process.exit(1); });

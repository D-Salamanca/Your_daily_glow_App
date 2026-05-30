import styles from './Settings.module.css';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Moon, Heart, Shield, LogOut, ChevronRight,
  Camera, BellRing, CheckCircle2, XCircle, AlertCircle, Loader2,
  MapPin, Sun, Monitor, X, Check, Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, type PermissionStatus } from "@/hooks/usePermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLocalNotifications } from "@/hooks/useLocalNotifications";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

// ── Theme helpers ────────────────────────────────────────────────────────────
type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
  localStorage.setItem("sentir-theme", theme);
}

function getSavedTheme(): Theme {
  return (localStorage.getItem("sentir-theme") as Theme) ?? "system";
}

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PermissionStatus }) {
  const map = {
    granted:     { label: "Activo",       color: "text-emerald-600 bg-emerald-50",     Icon: CheckCircle2 },
    denied:      { label: "Denegado",     color: "text-destructive bg-destructive/10", Icon: XCircle      },
    prompt:      { label: "Sin activar",  color: "text-amber-600 bg-amber-50",         Icon: AlertCircle  },
    unsupported: { label: "No soportado", color: "text-muted-foreground bg-muted",     Icon: AlertCircle  },
  } as const;
  const { label, color, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${color}`}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

// ── Shared bottom sheet wrapper ──────────────────────────────────────────────
function Sheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <h3 className="font-bold text-foreground">{title}</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast }        = useToast();
  const { profile, update } = useUserProfile();
  const { scheduleDailyReminder, requestPermissions: reqNotifPerm } = useLocalNotifications();
  const {
    camera, notifications, location,
    cameraLoading, notifLoading, locationLoading,
    requestCamera, requestNotifications, requestLocation,
    sendTestNotification,
  } = usePermissions();

  // Active sheet
  type SheetId = "profile" | "preferences" | "reminder" | "appearance" | null;
  const [sheet, setSheet] = useState<SheetId>(null);
  const close = () => setSheet(null);

  // ── Sheet: Datos personales ─────────────────────────────────────────────
  const [displayName, setDisplayName] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("sentir-profile-name");
    setDisplayName(saved ?? profile?.displayName ?? "");
  }, [profile]);

  const saveProfile = async () => {
    if (!displayName.trim()) return;
    // Save locally first (always works)
    localStorage.setItem("sentir-profile-name", displayName.trim());
    // Try Firestore (optional)
    update({ displayName: displayName.trim() }).catch(() => {});
    toast({ title: "Datos guardados", description: "Tu nombre ha sido actualizado." });
    close();
  };

  // ── Sheet: Preferencias de bienestar ────────────────────────────────────
  const GOALS = [
    { value: "feel-better", label: "🌻 Sentirme mejor",    desc: "Día a día"        },
    { value: "organize",    label: "🗂️ Organizar mi vida",  desc: "Claridad mental"  },
    { value: "heal",        label: "🩹 Sanar procesos",     desc: "A mi ritmo"       },
    { value: "habits",      label: "🌱 Crear hábitos",      desc: "Paso a paso"      },
  ];
  const TIMES = [
    { value: "3",  label: "3 min",  desc: "Un respiro rápido"    },
    { value: "5",  label: "5 min",  desc: "Un momento para ti"   },
    { value: "10", label: "10 min", desc: "Tiempo de calidad"    },
  ];
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedTime, setSelectedTime] = useState("5");
  useEffect(() => {
    const saved = localStorage.getItem("sentir-preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedGoal(parsed.goal ?? "feel-better");
        setSelectedTime(parsed.time ?? "5");
        return;
      } catch {}
    }
    if (profile?.onboardingData) {
      setSelectedGoal(profile.onboardingData.goal ?? "feel-better");
      setSelectedTime(String(profile.onboardingData.time ?? "5"));
    }
  }, [profile]);

  const savePreferences = async () => {
    const prefs = { goal: selectedGoal, time: selectedTime };
    // Save locally first
    localStorage.setItem("sentir-preferences", JSON.stringify(prefs));
    // Try Firestore
    update({ onboardingData: { ...(profile?.onboardingData ?? {}), ...prefs } }).catch(() => {});
    toast({ title: "Preferencias guardadas" });
    close();
  };

  // ── Sheet: Recordatorios ────────────────────────────────────────────────
  const [reminderHour,   setReminderHour]   = useState(() => {
    const saved = localStorage.getItem("sentir-reminder");
    return saved ? JSON.parse(saved).hour : 20;
  });
  const [reminderMinute, setReminderMinute] = useState(() => {
    const saved = localStorage.getItem("sentir-reminder");
    return saved ? JSON.parse(saved).minute : 0;
  });
  const [reminderSaving, setReminderSaving] = useState(false);

  const saveReminder = async () => {
    setReminderSaving(true);
    try {
      // Save to localStorage always
      localStorage.setItem("sentir-reminder", JSON.stringify({ hour: reminderHour, minute: reminderMinute }));

      // Request permission if needed
      if (notifications !== "granted") {
        await reqNotifPerm();
        await requestNotifications();
      }

      // Schedule notification (works on native; silently fails on web if no permission)
      await scheduleDailyReminder(
        reminderHour,
        reminderMinute,
        "¿Cómo te sientes hoy? Tómate un momento para ti. 💚"
      ).catch(() => {});

      toast({
        title: "Recordatorio activado",
        description: `Cada día a las ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")} 🔔`,
      });
      close();
    } catch {
      // Even on error, save locally
      toast({ title: "Recordatorio guardado localmente" });
      close();
    } finally {
      setReminderSaving(false);
    }
  };

  // ── Sheet: Apariencia ───────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  const handleTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  // Apply saved theme on mount
  useEffect(() => { applyTheme(getSavedTheme()); }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`min-h-screen bg-background pb-20 ${styles.page}`}>
      <div className="px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-6">Ajustes</h1>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-coral-light rounded-2xl p-4 mb-6 border border-accent/20"
        >
          <p className="text-sm text-foreground">
            <span className="font-semibold">Importante:</span> Esta app es un acompañante emocional.
            No reemplaza terapia ni atención profesional. Si necesitas ayuda, busca un profesional. 💙
          </p>
        </motion.div>

        {/* ── Permisos del dispositivo ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Permisos del dispositivo
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">

            {/* Cámara */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Camera className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">Cámara</p>
                <p className="text-xs text-muted-foreground">Análisis de estado de ánimo por foto</p>
                <div className="mt-1.5"><StatusBadge status={camera} /></div>
              </div>
              {camera !== "granted" && camera !== "unsupported" && (
                <button onClick={requestCamera} disabled={cameraLoading}
                  className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 disabled:opacity-60">
                  {cameraLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                  Activar
                </button>
              )}
            </div>

            {/* Notificaciones */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <BellRing className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">Notificaciones</p>
                <p className="text-xs text-muted-foreground">Recordatorios y check-ins diarios</p>
                <div className="mt-1.5"><StatusBadge status={notifications} /></div>
              </div>
              {notifications !== "granted" && notifications !== "unsupported" && (
                <button onClick={requestNotifications} disabled={notifLoading}
                  className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 disabled:opacity-60">
                  {notifLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                  Activar
                </button>
              )}
              {notifications === "granted" && (
                <button onClick={sendTestNotification}
                  className="flex-shrink-0 px-3 py-1.5 border border-border text-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 hover:bg-muted transition-colors">
                  <BellRing className="w-3 h-3" />Probar
                </button>
              )}
            </div>

            {/* Ubicación */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">Ubicación</p>
                <p className="text-xs text-muted-foreground">Psicólogos y recursos cerca de ti</p>
                <div className="mt-1.5"><StatusBadge status={location} /></div>
              </div>
              {location !== "granted" && location !== "unsupported" && (
                <button onClick={requestLocation} disabled={locationLoading}
                  className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 disabled:opacity-60">
                  {locationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                  Activar
                </button>
              )}
            </div>

          </div>
          {camera === "granted" && notifications === "granted" && location === "granted" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-emerald-600 mt-2 px-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Todos los sensores activos. La app funciona al 100%.
            </motion.p>
          )}
        </motion.div>

        {/* ── Tu perfil ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Tu perfil</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <button onClick={() => setSheet("profile")}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Datos personales</p>
                <p className="text-xs text-muted-foreground">{profile?.displayName || "Nombre, preferencias"}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button onClick={() => setSheet("preferences")}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Heart className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Preferencias de bienestar</p>
                <p className="text-xs text-muted-foreground">Objetivo, tiempo diario</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* ── Aplicación ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Aplicación</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <button onClick={() => setSheet("reminder")}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Bell className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Recordatorios</p>
                <p className="text-xs text-muted-foreground">Hora del check-in diario</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button onClick={() => setSheet("appearance")}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Moon className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Apariencia</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* ── Información ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Información</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Shield className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Privacidad</p>
                <p className="text-xs text-muted-foreground">Tus datos son solo tuyos</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cerrar sesión */}
        <button onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 p-3 text-destructive font-medium rounded-xl hover:bg-destructive/5 transition-colors active:scale-[0.98]">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <BottomNav />

      {/* ═══════════════════════════════════════════════════════════════════
          SHEETS
      ══════════════════════════════════════════════════════════════════ */}

      {/* Datos personales */}
      <Sheet open={sheet === "profile"} onClose={close} title="Datos personales">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Nombre</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Correo electrónico</label>
            <input
              value={user?.email ?? ""}
              readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
            />
          </div>
          <button onClick={saveProfile}
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />Guardar cambios
          </button>
        </div>
      </Sheet>

      {/* Preferencias de bienestar */}
      <Sheet open={sheet === "preferences"} onClose={close} title="Preferencias de bienestar">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">¿Qué quieres lograr?</p>
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button key={g.value} onClick={() => setSelectedGoal(g.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    selectedGoal === g.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                  {selectedGoal === g.value && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">¿Cuánto tiempo al día?</p>
            <div className="flex gap-2">
              {TIMES.map((t) => (
                <button key={t.value} onClick={() => setSelectedTime(t.value)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    selectedTime === t.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={savePreferences}
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />Guardar preferencias
          </button>
        </div>
      </Sheet>

      {/* Recordatorios */}
      <Sheet open={sheet === "reminder"} onClose={close} title="Recordatorio diario">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Recibirás una notificación cada día a la hora que elijas para hacer tu check-in emocional.
          </p>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Hora del recordatorio</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Hora</p>
                <select
                  value={reminderHour}
                  onChange={(e) => setReminderHour(Number(e.target.value))}
                  className="w-20 text-center px-2 py-2 rounded-xl border border-border bg-background text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
              <span className="text-2xl font-bold text-foreground mt-4">:</span>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Minuto</p>
                <select
                  value={reminderMinute}
                  onChange={(e) => setReminderMinute(Number(e.target.value))}
                  className="w-20 text-center px-2 py-2 rounded-xl border border-border bg-background text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-center text-sm text-primary font-medium mt-3">
              Todos los días a las {String(reminderHour).padStart(2, "0")}:{String(reminderMinute).padStart(2, "0")}
            </p>
          </div>

          <button onClick={saveReminder} disabled={reminderSaving}
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {reminderSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Activar recordatorio
          </button>
        </div>
      </Sheet>

      {/* Apariencia */}
      <Sheet open={sheet === "appearance"} onClose={close} title="Apariencia">
        <div className="space-y-3">
          {([
            { value: "light",  label: "Claro",   desc: "Fondo blanco / colores suaves", Icon: Sun     },
            { value: "dark",   label: "Oscuro",  desc: "Fondo oscuro / modo noche",     Icon: Moon    },
            { value: "system", label: "Sistema", desc: "Sigue la configuración del SO", Icon: Monitor },
          ] as const).map(({ value, label, desc, Icon }) => (
            <button key={value} onClick={() => handleTheme(value)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                theme === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === value ? "bg-primary/15" : "bg-muted"
              }`}>
                <Icon className={`w-5 h-5 ${theme === value ? "text-primary" : "text-foreground"}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {theme === value && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
};

export default Settings;

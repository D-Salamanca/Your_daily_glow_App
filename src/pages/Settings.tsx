import { motion } from "framer-motion";
import {
  User, Bell, Moon, Heart, Shield, LogOut, ChevronRight,
  Camera, BellRing, CheckCircle2, XCircle, AlertCircle, Loader2, MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, type PermissionStatus } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

// ── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PermissionStatus }) {
  const map = {
    granted:     { label: "Activo",       color: "text-emerald-600 bg-emerald-50",  Icon: CheckCircle2  },
    denied:      { label: "Denegado",     color: "text-destructive bg-destructive/10", Icon: XCircle    },
    prompt:      { label: "Sin activar",  color: "text-amber-600 bg-amber-50",      Icon: AlertCircle   },
    unsupported: { label: "No soportado", color: "text-muted-foreground bg-muted",  Icon: AlertCircle   },
  } as const;
  const { label, color, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Settings groups ─────────────────────────────────────────────────────────
const buildSettingsGroups = (onComingSoon: (label: string) => void) => [
  {
    title: "Tu perfil",
    items: [
      { icon: User,  label: "Datos personales",          desc: "Nombre, preferencias",     onClick: () => onComingSoon("Datos personales")          },
      { icon: Heart, label: "Preferencias de bienestar", desc: "Objetivo, tiempo diario",  onClick: () => onComingSoon("Preferencias de bienestar") },
    ],
  },
  {
    title: "Aplicación",
    items: [
      { icon: Bell, label: "Recordatorios", desc: "Hora del check-in diario", onClick: () => onComingSoon("Recordatorios") },
      { icon: Moon, label: "Apariencia",    desc: "Tema de la app",           onClick: () => onComingSoon("Apariencia")    },
    ],
  },
  {
    title: "Información",
    items: [
      { icon: Shield, label: "Privacidad", desc: "Tus datos son solo tuyos", onClick: () => onComingSoon("Privacidad") },
    ],
  },
];

// ── Component ───────────────────────────────────────────────────────────────
const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const {
    camera, notifications, location,
    cameraLoading, notifLoading, locationLoading,
    requestCamera, requestNotifications, requestLocation,
    sendTestNotification,
  } = usePermissions();

  const handleComingSoon = (label: string) =>
    toast({ title: `${label}`, description: "Próximamente disponible 🌱" });

  const settingsGroups = buildSettingsGroups(handleComingSoon);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-6">Ajustes</h1>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-coral-light rounded-2xl p-4 mb-6 border border-accent/20"
        >
          <p className="text-sm text-foreground">
            <span className="font-semibold">Importante:</span> Esta app es un acompañante emocional.
            No reemplaza terapia ni atención profesional. Si necesitas ayuda, busca un profesional. 💙
          </p>
        </motion.div>

        {/* ── Permisos del dispositivo ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
                <p className="text-xs text-muted-foreground">
                  Análisis de estado de ánimo por foto
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={camera} />
                </div>
              </div>
              {camera !== "granted" && camera !== "unsupported" && (
                <button
                  onClick={requestCamera}
                  disabled={cameraLoading}
                  className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 disabled:opacity-60"
                >
                  {cameraLoading
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Camera className="w-3 h-3" />
                  }
                  Activar
                </button>
              )}
              {camera === "denied" && (
                <span className="text-[10px] text-muted-foreground text-right leading-tight max-w-[90px]">
                  Actívala desde los ajustes del navegador
                </span>
              )}
            </div>

            {/* Notificaciones */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <BellRing className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">Notificaciones</p>
                <p className="text-xs text-muted-foreground">
                  Recordatorios y check-ins diarios
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={notifications} />
                </div>
              </div>
              {notifications !== "granted" && notifications !== "unsupported" && (
                <button
                  onClick={requestNotifications}
                  disabled={notifLoading}
                  className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 disabled:opacity-60"
                >
                  {notifLoading
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Bell className="w-3 h-3" />
                  }
                  Activar
                </button>
              )}
              {notifications === "granted" && (
                <button
                  onClick={sendTestNotification}
                  className="flex-shrink-0 px-3 py-1.5 border border-border text-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 hover:bg-muted transition-colors"
                >
                  <BellRing className="w-3 h-3" />
                  Probar
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
                <p className="text-xs text-muted-foreground">
                  Psicólogos y recursos cerca de ti
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={location} />
                </div>
              </div>
              {location !== "granted" && location !== "unsupported" && (
                <button
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 disabled:opacity-60"
                >
                  {locationLoading
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <MapPin className="w-3 h-3" />
                  }
                  Activar
                </button>
              )}
              {location === "denied" && (
                <span className="text-[10px] text-muted-foreground text-right leading-tight max-w-[90px]">
                  Actívala desde los ajustes del navegador
                </span>
              )}
            </div>

          </div>

          {/* Info extra cuando ambos están activos */}
          {camera === "granted" && notifications === "granted" && location === "granted" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-600 mt-2 px-1 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Todos los sensores activos. La app funciona al 100%.
            </motion.p>
          )}
        </motion.div>

        {/* ── Grupos de ajustes ─────────────────────────────────────────── */}
        <div className="space-y-6">
          {settingsGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + gi * 0.08 }}
            >
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {group.title}
              </h2>
              <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 flex items-center justify-center gap-2 p-3 text-destructive font-medium rounded-xl hover:bg-destructive/5 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;

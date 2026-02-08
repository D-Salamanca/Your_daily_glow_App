import { motion } from "framer-motion";
import { User, Bell, Moon, Heart, Shield, LogOut, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const settingsGroups = [
  {
    title: "Tu perfil",
    items: [
      { icon: User, label: "Datos personales", desc: "Nombre, preferencias" },
      { icon: Heart, label: "Preferencias de bienestar", desc: "Objetivo, tiempo diario" },
    ],
  },
  {
    title: "Aplicación",
    items: [
      { icon: Bell, label: "Recordatorios", desc: "Hora del check-in diario" },
      { icon: Moon, label: "Apariencia", desc: "Tema de la app" },
    ],
  },
  {
    title: "Información",
    items: [
      { icon: Shield, label: "Privacidad", desc: "Tus datos son solo tuyos" },
    ],
  },
];

const Settings = () => {
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

        <div className="space-y-6">
          {settingsGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
            >
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {group.title}
              </h2>
              <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="w-4.5 h-4.5 text-foreground" />
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

        <button className="w-full mt-8 flex items-center justify-center gap-2 p-3 text-destructive font-medium rounded-xl hover:bg-destructive/5 transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;

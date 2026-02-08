import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Droplets, Sun, Flower2, CalendarDays, Info } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const phases = [
  {
    id: "menstrual",
    label: "Menstruación",
    icon: Droplets,
    days: "Día 1-5",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    emotional: "Es normal sentirse más cansada o sensible. Permítete descansar. 🌙",
    tips: ["Descansa más de lo habitual", "Hidratación y alimentos cálidos", "Movimiento suave si te apetece"],
  },
  {
    id: "follicular",
    label: "Fase folicular",
    icon: Sun,
    days: "Día 6-13",
    color: "text-primary",
    bgColor: "bg-primary/10",
    emotional: "Tu energía sube. Buen momento para nuevos proyectos y socializar. ☀️",
    tips: ["Aprovecha la energía extra", "Buen momento para planificar", "Ejercicio más intenso si quieres"],
  },
  {
    id: "ovulation",
    label: "Ovulación",
    icon: Flower2,
    days: "Día 14-16",
    color: "text-accent",
    bgColor: "bg-accent/10",
    emotional: "Momento de mayor energía y conexión social. Disfrútalo. 🌸",
    tips: ["Comunicación más fluida", "Creatividad en su punto alto", "Conecta con personas queridas"],
  },
  {
    id: "luteal",
    label: "Fase lútea",
    icon: Moon,
    days: "Día 17-28",
    color: "text-lavender",
    bgColor: "bg-lavender/10",
    emotional: "Puede haber más sensibilidad emocional. Tus emociones son válidas. 💜",
    tips: ["Autocuidado y descanso", "Reduce la autoexigencia", "Journaling para procesar emociones"],
  },
];

interface CycleEntry {
  date: string;
  phase: string;
  notes: string;
}

const CycleTracking = () => {
  const [currentPhase, setCurrentPhase] = useState<string>("follicular");
  const [lastPeriodDate, setLastPeriodDate] = useState<string>("");
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([]);
  const [notes, setNotes] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sentir-cycle-data");
    if (saved) {
      const data = JSON.parse(saved);
      setLastPeriodDate(data.lastPeriodDate || "");
      setCycleEntries(data.entries || []);
      if (data.lastPeriodDate) {
        calculatePhase(data.lastPeriodDate);
      }
    }
  }, []);

  const calculatePhase = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) % 28;

    if (diffDays <= 5) setCurrentPhase("menstrual");
    else if (diffDays <= 13) setCurrentPhase("follicular");
    else if (diffDays <= 16) setCurrentPhase("ovulation");
    else setCurrentPhase("luteal");
  };

  const handleSetPeriodDate = (date: string) => {
    setLastPeriodDate(date);
    calculatePhase(date);
    const data = {
      lastPeriodDate: date,
      entries: cycleEntries,
    };
    localStorage.setItem("sentir-cycle-data", JSON.stringify(data));
  };

  const handleSaveEntry = () => {
    if (!notes.trim()) return;
    const entry: CycleEntry = {
      date: new Date().toISOString(),
      phase: currentPhase,
      notes: notes.trim(),
    };
    const updated = [entry, ...cycleEntries].slice(0, 30);
    setCycleEntries(updated);
    setNotes("");
    localStorage.setItem(
      "sentir-cycle-data",
      JSON.stringify({ lastPeriodDate, entries: updated })
    );
  };

  const activePhase = phases.find((p) => p.id === currentPhase)!;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-lavender px-6 pt-12 pb-8 rounded-b-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground">Mi ciclo</h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-9 h-9 rounded-xl bg-background/50 flex items-center justify-center"
            >
              <Info className="w-4 h-4 text-foreground" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Conocer tu ciclo te ayuda a entender tus emociones
          </p>

          {/* Phase indicator */}
          <div className="flex gap-2 mt-2">
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(phase.id)}
                className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all border-2 ${
                  currentPhase === phase.id
                    ? `${phase.bgColor} border-current ${phase.color}`
                    : "bg-background/40 border-transparent"
                }`}
              >
                <phase.icon className={`w-5 h-5 ${currentPhase === phase.id ? phase.color : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-semibold ${currentPhase === phase.id ? phase.color : "text-muted-foreground"}`}>
                  {phase.label.split(" ").pop()}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-6 mt-6 space-y-4">
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">💡 Recuerda:</span> Este registro es
              orientativo. No es un diagnóstico médico. Si tienes dudas sobre tu ciclo, consulta con
              tu ginecóloga. Tus emociones siempre son válidas, independientemente de la fase.
            </p>
          </motion.div>
        )}

        {/* Emotional context card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 border ${activePhase.bgColor} border-current/10`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${activePhase.bgColor} flex items-center justify-center`}>
              <activePhase.icon className={`w-5 h-5 ${activePhase.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{activePhase.label}</h3>
              <p className="text-xs text-muted-foreground">{activePhase.days}</p>
            </div>
          </div>
          <p className="text-sm text-foreground mb-3">{activePhase.emotional}</p>
          <div className="space-y-1.5">
            {activePhase.tips.map((tip) => (
              <div key={tip} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Period date */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-primary" />
            Último inicio de periodo
          </label>
          <input
            type="date"
            value={lastPeriodDate}
            onChange={(e) => handleSetPeriodDate(e.target.value)}
            className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm border-none outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Notes */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <label className="text-sm font-semibold text-foreground mb-3 block">
            ¿Cómo te sientes hoy? ✨
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anota cómo te sientes, síntomas, energía..."
            className="w-full bg-muted rounded-xl px-4 py-3 text-foreground text-sm border-none outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px]"
          />
          <button
            onClick={handleSaveEntry}
            disabled={!notes.trim()}
            className="mt-3 w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-opacity active:scale-[0.98]"
          >
            Guardar nota
          </button>
        </div>

        {/* Recent entries */}
        {cycleEntries.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              Notas recientes
            </h3>
            <div className="space-y-2">
              {cycleEntries.slice(0, 5).map((entry, i) => {
                const phase = phases.find((p) => p.id === entry.phase);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl p-3 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {phase && <phase.icon className={`w-3.5 h-3.5 ${phase.color}`} />}
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{entry.notes}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CycleTracking;

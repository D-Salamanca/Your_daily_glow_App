import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, ChevronRight, Target } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const defaultProcesses = [
  { id: "1", name: "Autoestima", emoji: "🌻", steps: ["Identifica una cualidad tuya", "Escribe algo que hiciste bien hoy", "Repite una afirmación positiva"], progress: 0 },
  { id: "2", name: "Establecer límites", emoji: "🛡️", steps: ["Reconoce una situación donde no pusiste límites", "Practica decir 'no' a algo pequeño", "Reflexiona sobre cómo te sentiste"], progress: 0 },
  { id: "3", name: "Motivación", emoji: "🔥", steps: ["Escribe tu 'por qué'", "Define un micro-objetivo para mañana", "Celebra un logro reciente"], progress: 0 },
  { id: "4", name: "Gestión emocional", emoji: "🌊", steps: ["Nombra lo que sientes ahora", "Respira 4-4-4 por 1 minuto", "Escribe qué disparó esa emoción"], progress: 0 },
];

const Processes = () => {
  const [processes] = useState(defaultProcesses);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mis procesos</h1>
          <p className="text-muted-foreground mb-6">
            Trabaja en lo que es importante para ti, paso a paso.
          </p>
        </motion.div>

        <div className="space-y-3">
          {processes.map((process, index) => (
            <motion.div
              key={process.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <button
                onClick={() => setExpandedId(expandedId === process.id ? null : process.id)}
                className="w-full bg-card rounded-2xl p-4 border border-border text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{process.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{process.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {process.steps.length} pasos · {process.progress}/{process.steps.length} completados
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedId === process.id ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(process.progress / process.steps.length) * 100}%` }}
                  />
                </div>
              </button>

              {expandedId === process.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-4 py-3 space-y-2"
                >
                  {process.steps.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        i < process.progress ? "bg-sage-light" : "bg-card border border-border"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          i < process.progress
                            ? "bg-primary text-primary-foreground"
                            : "border-2 border-muted-foreground/30"
                        }`}
                      >
                        {i < process.progress && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm ${i < process.progress ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Crear nuevo proceso</span>
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Processes;

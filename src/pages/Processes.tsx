import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, ChevronRight, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const defaultProcesses = [
  { id: "1", name: "Autoestima", emoji: "🌻", steps: ["Identifica una cualidad tuya", "Escribe algo que hiciste bien hoy", "Repite una afirmación positiva"], progress: 0 },
  { id: "2", name: "Establecer límites", emoji: "🛡️", steps: ["Reconoce una situación donde no pusiste límites", "Practica decir 'no' a algo pequeño", "Reflexiona sobre cómo te sentiste"], progress: 0 },
  { id: "3", name: "Motivación", emoji: "🔥", steps: ["Escribe tu 'por qué'", "Define un micro-objetivo para mañana", "Celebra un logro reciente"], progress: 0 },
  { id: "4", name: "Gestión emocional", emoji: "🌊", steps: ["Nombra lo que sientes ahora", "Respira 4-4-4 por 1 minuto", "Escribe qué disparó esa emoción"], progress: 0 },
];

const EMOJIS = ["🌻", "🛡️", "🔥", "🌊", "💪", "🌈", "🦋", "🌙", "⭐", "🎯"];

const Processes = () => {
  const { toast } = useToast();
  const [processes, setProcesses] = useState(defaultProcesses);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎯");
  const [newSteps, setNewSteps] = useState(["", "", ""]);

  const handleAddProcess = () => {
    const filledSteps = newSteps.filter((s) => s.trim().length > 0);
    if (!newName.trim() || filledSteps.length === 0) {
      toast({ title: "Completa el nombre y al menos un paso", variant: "destructive" });
      return;
    }
    const id = String(Date.now());
    setProcesses((prev) => [...prev, { id, name: newName.trim(), emoji: newEmoji, steps: filledSteps, progress: 0 }]);
    setNewName("");
    setNewEmoji("🎯");
    setNewSteps(["", "", ""]);
    setShowForm(false);
    toast({ title: "Proceso creado", description: `"${newName.trim()}" añadido a tu lista` });
  };

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
          onClick={() => setShowForm(true)}
          className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Crear nuevo proceso</span>
        </motion.button>

        {/* ── Create form modal ────────────────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6"
              onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="w-full max-w-md bg-card rounded-3xl p-6 space-y-4 border border-border shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Nuevo proceso</h3>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Emoji picker */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Elige un emoji</p>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setNewEmoji(e)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${newEmoji === e ? "bg-primary/15 ring-2 ring-primary" : "hover:bg-muted"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Nombre del proceso</p>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ej. Gestión del estrés"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Steps */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Pasos (mínimo 1)</p>
                  <div className="space-y-2">
                    {newSteps.map((step, i) => (
                      <input
                        key={i}
                        value={step}
                        onChange={(e) => {
                          const updated = [...newSteps];
                          updated[i] = e.target.value;
                          setNewSteps(updated);
                        }}
                        placeholder={`Paso ${i + 1}`}
                        className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddProcess}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Crear proceso
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default Processes;

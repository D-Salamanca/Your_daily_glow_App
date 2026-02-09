import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Coins, Target, TrendingUp, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  type: "financial" | "personal";
  createdAt: string;
}

const STORAGE_KEY = "sentir-savings";

const emojiOptions = ["💰", "🏠", "✈️", "📚", "🎯", "💪", "🧘", "🎨", "🚗", "🎓", "❤️", "⭐"];

const Savings = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [addAmountId, setAddAmountId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [newGoal, setNewGoal] = useState<{ name: string; emoji: string; target: string; type: "financial" | "personal" }>({ name: "", emoji: "💰", target: "", type: "financial" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);

  const handleCreate = () => {
    if (!newGoal.name || !newGoal.target) return;
    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      emoji: newGoal.emoji,
      target: Number(newGoal.target),
      saved: 0,
      type: newGoal.type,
      createdAt: new Date().toISOString(),
    };
    setGoals([...goals, goal]);
    setNewGoal({ name: "", emoji: "💰", target: "", type: "financial" });
    setShowForm(false);
  };

  const handleAddAmount = (id: string) => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) return;
    setGoals(goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g)));
    setAddAmount("");
    setAddAmountId(null);
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mis metas</h1>
          <p className="text-muted-foreground mb-6">Avanza hacia lo que importa, paso a paso.</p>
        </motion.div>

        {/* Resumen general */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl p-5 border border-border mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progreso general</p>
                <p className="text-lg font-bold text-foreground">
                  {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
                </p>
              </div>
            </div>
            <Progress value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {goals.length} {goals.length === 1 ? "meta activa" : "metas activas"}
            </p>
          </motion.div>
        )}

        {/* Lista de metas */}
        <div className="space-y-3">
          <AnimatePresence>
            {goals.map((goal, index) => {
              const percent = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
              const isComplete = percent >= 100;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: index * 0.06 }}
                  className={`bg-card rounded-2xl p-4 border ${isComplete ? "border-primary/40" : "border-border"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {goal.type === "financial" ? (
                            <>{goal.saved.toLocaleString()}€ / {goal.target.toLocaleString()}€</>
                          ) : (
                            <>{goal.saved} / {goal.target} pasos</>
                          )}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(goal.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Progress value={percent} className="h-2 mb-2" />

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isComplete ? "text-primary" : "text-muted-foreground"}`}>
                      {isComplete ? "🎉 ¡Meta cumplida!" : `${percent}% completado`}
                    </span>

                    {!isComplete && addAmountId !== goal.id && (
                      <button
                        onClick={() => setAddAmountId(goal.id)}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        + Añadir progreso
                      </button>
                    )}
                  </div>

                  {addAmountId === goal.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 flex gap-2">
                      <input
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder={goal.type === "financial" ? "Cantidad €" : "Pasos"}
                        className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        autoFocus
                      />
                      <button onClick={() => handleAddAmount(goal.id)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
                        Añadir
                      </button>
                      <button onClick={() => { setAddAmountId(null); setAddAmount(""); }} className="p-2 text-muted-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Formulario nueva meta */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-card rounded-2xl p-5 border border-border space-y-4"
            >
              <h3 className="font-semibold text-foreground">Nueva meta</h3>

              {/* Tipo */}
              <div className="flex gap-2">
                {[
                  { value: "financial" as const, label: "Financiera", icon: Coins },
                  { value: "personal" as const, label: "Personal", icon: Target },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setNewGoal({ ...newGoal, type: t.value })}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                      newGoal.type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Emoji */}
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewGoal({ ...newGoal, emoji: e })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      newGoal.emoji === e ? "bg-primary/10 ring-2 ring-primary scale-110" : "bg-muted"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="Nombre de la meta"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <input
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                placeholder={newGoal.type === "financial" ? "Objetivo en €" : "Número de pasos"}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                >
                  Crear meta
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Crear nueva meta</span>
          </motion.button>
        )}

        {goals.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mt-12">
            <span className="text-5xl mb-4 block">🎯</span>
            <h3 className="text-lg font-semibold text-foreground mb-1">Sin metas aún</h3>
            <p className="text-sm text-muted-foreground">Crea tu primera meta y empieza a avanzar.</p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Savings;

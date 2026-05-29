import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Coins, Target, TrendingUp, X, Eye, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import {
  fetchGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  type Goal,
} from "@/services/goalsService";

const emojiOptions = ["💰", "🏠", "✈️", "📚", "🎯", "💪", "🧘", "🎨", "🚗", "🎓", "❤️", "⭐"];

// ─── HTTP method badge ────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

function MethodBadge({ method, label }: { method: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${METHOD_COLORS[method] ?? ""}`}>
      {method} <span className="font-sans font-normal opacity-70">{label}</span>
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
const Savings = () => {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [addAmountId, setAddAmountId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [newGoal, setNewGoal] = useState<{
    name: string;
    emoji: string;
    target: string;
    type: "financial" | "personal";
  }>({ name: "", emoji: "💰", target: "", type: "financial" });

  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  // ── GET all goals ──────────────────────────────────────────────────────────
  const { data: goals = [], isLoading, isError } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);

  // ── GET one goal ───────────────────────────────────────────────────────────
  const handleViewDetail = async (id: string) => {
    setLoadingDetailId(id);
    try {
      const goal = await fetchGoalById(id);
      setDetailGoal(goal);
    } finally {
      setLoadingDetailId(null);
    }
  };

  // ── POST create goal ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (goal: Omit<Goal, "id">) => createGoal(goal),
    onSuccess: (newGoal) => {
      queryClient.setQueryData<Goal[]>(["goals"], (old = []) => [...old, newGoal]);
    },
  });

  const handleCreate = () => {
    if (!newGoal.name || !newGoal.target) return;
    createMutation.mutate({
      name: newGoal.name,
      emoji: newGoal.emoji,
      target: Number(newGoal.target),
      saved: 0,
      type: newGoal.type,
      createdAt: new Date().toISOString(),
    });
    setNewGoal({ name: "", emoji: "💰", target: "", type: "financial" });
    setShowForm(false);
  };

  // ── PUT update goal (add progress) ─────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      updateGoal(id, updates),
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData<Goal[]>(["goals"], (old = []) =>
        old.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
      );
    },
  });

  const handleAddAmount = (goal: Goal) => {
    const amount = Number(addAmount);
    if (!amount || amount <= 0) return;
    updateMutation.mutate({
      id: goal.id,
      updates: { ...goal, saved: Math.min(goal.saved + amount, goal.target) },
    });
    setAddAmount("");
    setAddAmountId(null);
  };

  // ── DELETE goal ────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Goal[]>(["goals"], (old = []) =>
        old.filter((g) => g.id !== id)
      );
    },
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Mis metas</h1>
          <p className="text-muted-foreground mb-2">Avanza hacia lo que importa, paso a paso.</p>
          {/* HTTP methods legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            <MethodBadge method="GET" label="cargar" />
            <MethodBadge method="POST" label="crear" />
            <MethodBadge method="PUT" label="actualizar" />
            <MethodBadge method="DELETE" label="eliminar" />
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando metas… <MethodBadge method="GET" label="/posts" /></span>
          </div>
        )}

        {isError && (
          <p className="text-center text-sm text-destructive py-8">
            Error al cargar las metas desde la API.
          </p>
        )}

        {/* Resumen general */}
        {!isLoading && goals.length > 0 && (
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
                    <div className="flex items-center gap-1">
                      {/* GET single */}
                      <button
                        onClick={() => handleViewDetail(goal.id)}
                        disabled={loadingDetailId === goal.id}
                        className="text-muted-foreground/50 hover:text-blue-500 transition-colors p-1"
                        title="GET — ver detalle"
                      >
                        {loadingDetailId === goal.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                      {/* DELETE */}
                      <button
                        onClick={() => deleteMutation.mutate(goal.id)}
                        disabled={deleteMutation.isPending}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors p-1"
                        title="DELETE — eliminar meta"
                      >
                        {deleteMutation.isPending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
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

                  {/* PUT — add progress */}
                  {addAmountId === goal.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-3"
                    >
                      <p className="text-xs text-muted-foreground mb-2">
                        <MethodBadge method="PUT" label={`/posts/${goal.id}`} />
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          placeholder={goal.type === "financial" ? "Cantidad €" : "Pasos"}
                          className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddAmount(goal)}
                          disabled={updateMutation.isPending}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
                        >
                          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Añadir"}
                        </button>
                        <button
                          onClick={() => { setAddAmountId(null); setAddAmount(""); }}
                          className="p-2 text-muted-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* POST — formulario nueva meta */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-card rounded-2xl p-5 border border-border space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Nueva meta</h3>
                <MethodBadge method="POST" label="/posts" />
              </div>

              <div className="flex gap-2">
                {([
                  { value: "financial" as const, label: "Financiera", icon: Coins },
                  { value: "personal" as const, label: "Personal", icon: Target },
                ] as const).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setNewGoal({ ...newGoal, type: t.value })}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                      newGoal.type === t.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

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
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear meta"}
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

        {!isLoading && goals.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-12"
          >
            <span className="text-5xl mb-4 block">🎯</span>
            <h3 className="text-lg font-semibold text-foreground mb-1">Sin metas aún</h3>
            <p className="text-sm text-muted-foreground">Crea tu primera meta y empieza a avanzar.</p>
          </motion.div>
        )}
      </div>

      {/* GET single — detalle modal */}
      <AnimatePresence>
        {detailGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 pb-6 px-4"
            onClick={() => setDetailGoal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-lg">Detalle de meta</h3>
                <MethodBadge method="GET" label={`/posts/${detailGoal.id}`} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{detailGoal.emoji}</span>
                <div>
                  <p className="font-semibold text-foreground">{detailGoal.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{detailGoal.type}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">ID:</span> {detailGoal.id}</p>
                <p><span className="font-medium text-foreground">Objetivo:</span> {detailGoal.target.toLocaleString()}{detailGoal.type === "financial" ? "€" : " pasos"}</p>
                <p><span className="font-medium text-foreground">Guardado:</span> {detailGoal.saved.toLocaleString()}{detailGoal.type === "financial" ? "€" : " pasos"}</p>
                <p><span className="font-medium text-foreground">Creado:</span> {new Date(detailGoal.createdAt).toLocaleDateString("es-ES")}</p>
              </div>
              <button
                onClick={() => setDetailGoal(null)}
                className="mt-5 w-full py-3 rounded-xl bg-muted text-foreground font-medium"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Savings;

import styles from './Onboarding.module.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile } from "@/lib/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Leaf, Sun, ArrowRight } from "lucide-react";

interface OnboardingData {
  preference: string;
  gender: string;
  cycle: string;
  goal: string;
  time: number;
}

const baseSteps = [
  {
    id: "welcome",
    title: "Bienvenido/a a Sentir",
    subtitle: "Tu compañero de bienestar emocional",
    icon: Heart,
  },
  {
    id: "preference",
    title: "¿Cómo prefieres expresarte?",
    subtitle: "Adaptaremos la experiencia a ti",
    options: [
      { value: "write", label: "✍️ Escribir", desc: "Journaling y reflexión" },
      { value: "activities", label: "🎯 Actividades guiadas", desc: "Paso a paso" },
      { value: "mixed", label: "🌈 Un poco de todo", desc: "Variedad" },
    ],
  },
  {
    id: "gender",
    title: "¿Cómo te identificas?",
    subtitle: "Esto nos ayuda a personalizar tu experiencia",
    options: [
      { value: "female", label: "Mujer" },
      { value: "male", label: "Hombre" },
      { value: "other", label: "Prefiero no decirlo" },
    ],
  },
  {
    id: "cycle",
    title: "¿Te gustaría registrar tu ciclo menstrual?",
    subtitle: "Es opcional y te ayuda a entender mejor tus emociones",
    condition: (data: Partial<OnboardingData>) => data.gender === "female",
    options: [
      { value: "yes", label: "🌙 Sí, me interesa", desc: "Contexto emocional según tu fase" },
      { value: "no", label: "No, gracias", desc: "Puedes activarlo después en ajustes" },
    ],
  },
  {
    id: "goal",
    title: "¿Qué te gustaría lograr?",
    subtitle: "Puedes cambiar esto cuando quieras",
    options: [
      { value: "feel-better", label: "🌻 Sentirme mejor", desc: "Día a día" },
      { value: "organize", label: "🗂️ Organizar mi vida", desc: "Claridad mental" },
      { value: "heal", label: "🩹 Sanar procesos", desc: "A mi ritmo" },
      { value: "habits", label: "🌱 Crear hábitos", desc: "Paso a paso" },
    ],
  },
  {
    id: "time",
    title: "¿Cuánto tiempo tienes al día?",
    subtitle: "Cada minuto cuenta",
    options: [
      { value: "3", label: "3 min", desc: "Un respiro rápido" },
      { value: "5", label: "5 min", desc: "Un momento para ti" },
      { value: "10", label: "10 min", desc: "Tiempo de calidad" },
    ],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const steps = baseSteps.filter(
    (s) => !("condition" in s && s.condition) || s.condition(data)
  );

  const current = steps[step];

  const handleSelect = (value: string) => {
    const key = current.id as keyof OnboardingData;
    const newData = { ...data, [key]: value };
    setData(newData);

    // Recalculate steps with new data to find next step
    const updatedSteps = baseSteps.filter(
      (s) => !("condition" in s && s.condition) || s.condition(newData)
    );

    if (step < updatedSteps.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Guardar en localStorage (compatibilidad)
      localStorage.setItem("sentir-onboarding", JSON.stringify(newData));
      localStorage.setItem("sentir-onboarded", "true");
      if (newData.cycle === "yes") {
        localStorage.setItem("sentir-cycle-enabled", "true");
      }
      // Guardar en Firestore si hay usuario autenticado
      if (user) {
        createUserProfile(user, {
          onboarded:      true,
          cycleEnabled:   newData.cycle === "yes",
          onboardingData: newData,
        }).catch(console.error);
      }
      navigate("/home");
    }
  };

  const handleWelcomeContinue = () => {
    setStep(1);
  };

  return (
    <div className={`min-h-screen gradient-hero flex flex-col items-center justify-center px-6 py-12 ${styles.page}`}>
      {/* Progress */}
      <div className="w-full max-w-xs flex gap-1.5 mb-12">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm text-center"
        >
          {current.id === "welcome" ? (
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Heart className="w-12 h-12 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground">{current.title}</h1>
              <p className="text-muted-foreground text-lg">{current.subtitle}</p>
              <div className="flex gap-4 mt-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm">Sin juicios</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-primary" />
                  <span className="text-sm">A tu ritmo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-coral" />
                  <span className="text-sm">Cada día</span>
                </div>
              </div>
              <button
                onClick={handleWelcomeContinue}
                className="mt-8 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
              >
                Comenzar
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl font-bold text-foreground">{current.title}</h2>
              <p className="text-muted-foreground">{current.subtitle}</p>
              <div className="w-full flex flex-col gap-3 mt-4">
                {"options" in current &&
                  current.options?.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        data[current.id as keyof OnboardingData] === opt.value
                          ? "border-primary bg-sage-light"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <span className="font-semibold text-foreground">{opt.label}</span>
                      {"desc" in opt && opt.desc && (
                        <span className="block text-sm text-muted-foreground mt-0.5">
                          {opt.desc}
                        </span>
                      )}
                    </motion.button>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;

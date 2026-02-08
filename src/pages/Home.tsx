import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Heart, Leaf } from "lucide-react";
import EmotionPicker from "@/components/EmotionPicker";
import StreakCounter from "@/components/StreakCounter";
import ActivityCard from "@/components/ActivityCard";
import BottomNav from "@/components/BottomNav";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

const Home = () => {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("sentir-last-checkin");
    const savedStreak = parseInt(localStorage.getItem("sentir-streak") || "0");

    if (lastCheck === today) {
      setCheckedIn(true);
      setSelectedEmotion(localStorage.getItem("sentir-today-emotion"));
    }
    setStreak(savedStreak);
  }, []);

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("sentir-last-checkin");
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = 1;

    if (lastCheck === yesterday) {
      newStreak = (parseInt(localStorage.getItem("sentir-streak") || "0")) + 1;
    } else if (lastCheck === today) {
      newStreak = parseInt(localStorage.getItem("sentir-streak") || "1");
    }

    localStorage.setItem("sentir-last-checkin", today);
    localStorage.setItem("sentir-today-emotion", emotion);
    localStorage.setItem("sentir-streak", String(newStreak));
    setStreak(newStreak);
    setCheckedIn(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">{getGreeting()} 👋</p>
            <h1 className="text-2xl font-bold text-foreground">¿Cómo te sientes?</h1>
          </div>
          <StreakCounter streak={streak} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EmotionPicker selected={selectedEmotion} onSelect={handleEmotionSelect} />
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6 space-y-4">
        {checkedIn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-sage-light rounded-2xl p-4 border border-primary/10"
          >
            <p className="text-sm text-foreground">
              <span className="font-semibold">Hoy te sientes {selectedEmotion?.toLowerCase()}</span>
              {" · "}
              <span className="text-muted-foreground">
                Recuerda que todas las emociones son válidas. 💚
              </span>
            </p>
          </motion.div>
        )}

        <h2 className="text-lg font-bold text-foreground pt-2">Actividades para ti</h2>

        <ActivityCard
          icon={BookOpen}
          title="Háblame de tu día"
          description="Escribe lo que sientes, sin filtro ni juicio"
          gradient="gradient-sage"
          onClick={() => navigate("/journal")}
        />
        <ActivityCard
          icon={Sparkles}
          title="Reflexión rápida"
          description="3 preguntas para cerrar tu día con claridad"
          gradient="gradient-coral"
        />
        <ActivityCard
          icon={Leaf}
          title="Respiración guiada"
          description="1 minuto para volver al presente"
          gradient="gradient-lavender"
        />
        <ActivityCard
          icon={Heart}
          title="Gratitud diaria"
          description="Nombra algo que agradeces hoy"
          gradient="gradient-sage"
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;

import styles from './Home.module.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Heart, Leaf } from "lucide-react";
import EmotionPicker from "@/components/EmotionPicker";
import StreakCounter from "@/components/StreakCounter";
import ActivityCard from "@/components/ActivityCard";
import BottomNav from "@/components/BottomNav";
import EmotionChart from "@/components/Index/EmotionChart";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";

const HISTORY_KEY = "sentir-emotion-history";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

function readHistory(): { date: string; emotion: string }[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}

function saveToHistory(date: string, emotion: string) {
  const prev    = readHistory().filter((r) => r.date !== date);
  const updated = [...prev, { date, emotion }].slice(-30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [streak, setStreak]                   = useState(0);
  const [checkedIn, setCheckedIn]             = useState(false);
  const [chartKey, setChartKey]               = useState(0); // force chart re-render

  // ── Seed demo data every login for demo@demo.com ──────────────────────────
  // Always re-seeds so mobile (where localStorage may be cleared) always shows
  // the 7-day history. Uses date-stamped key to avoid re-seeding in same day.
  useEffect(() => {
    if (user?.email !== "demo@demo.com") return;

    const day = (n: number) => new Date(Date.now() - n * 86_400_000).toDateString();
    const today = day(0);

    // Only skip if already seeded TODAY (prevents double-seed on re-renders)
    if (localStorage.getItem("sentir-demo-seeded") === today) return;

    const demoHistory = [
      { date: day(7), emotion: "Frustrado/a" },
      { date: day(6), emotion: "Bien"         },
      { date: day(5), emotion: "Bajo/a"       },
      { date: day(4), emotion: "Regular"      },
      { date: day(3), emotion: "Bien"         },
      { date: day(2), emotion: "Tranquilo/a"  },
      { date: day(1), emotion: "Bien"         },
    ];

    localStorage.setItem("sentir-streak",       "7");
    localStorage.setItem("sentir-last-checkin", day(1));
    localStorage.removeItem("sentir-today-emotion");
    localStorage.setItem("sentir-onboarded",    "true");
    localStorage.setItem(HISTORY_KEY,           JSON.stringify(demoHistory));
    localStorage.setItem("sentir-demo-seeded",  today); // stamp with today's date
    setChartKey((k) => k + 1);
  }, [user]);

  // ── Load streak + today emotion ────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toDateString();

    const applyLocal = () => {
      const lastCheck   = localStorage.getItem("sentir-last-checkin");
      const savedStreak = parseInt(localStorage.getItem("sentir-streak") || "0");
      if (lastCheck === today) {
        setCheckedIn(true);
        setSelectedEmotion(localStorage.getItem("sentir-today-emotion"));
      }
      setStreak(savedStreak);
    };

    if (!user) { applyLocal(); return; }

    getUserProfile(user.uid).then((profile) => {
      if (profile?.streak !== undefined && profile.lastCheckin) {
        localStorage.setItem("sentir-streak",       String(profile.streak));
        localStorage.setItem("sentir-last-checkin", profile.lastCheckin);
        if (profile.todayEmotion)
          localStorage.setItem("sentir-today-emotion", profile.todayEmotion);
        if (profile.emotionHistory?.length)
          localStorage.setItem(HISTORY_KEY, JSON.stringify(profile.emotionHistory));
      }
      applyLocal();
    }).catch(applyLocal);
  }, [user]);

  // ── Handle emotion selection ───────────────────────────────────────────────
  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
    const today     = new Date().toDateString();
    const lastCheck = localStorage.getItem("sentir-last-checkin");
    const yesterday = new Date(Date.now() - 86_400_000).toDateString();
    let newStreak   = 1;

    if (lastCheck === yesterday)     newStreak = parseInt(localStorage.getItem("sentir-streak") || "0") + 1;
    else if (lastCheck === today)    newStreak = parseInt(localStorage.getItem("sentir-streak") || "1");

    localStorage.setItem("sentir-last-checkin",  today);
    localStorage.setItem("sentir-today-emotion", emotion);
    localStorage.setItem("sentir-streak",        String(newStreak));
    saveToHistory(today, emotion);

    setStreak(newStreak);
    setCheckedIn(true);
    setChartKey((k) => k + 1); // refresh chart

    // Sync to Firestore
    if (user) {
      getUserProfile(user.uid).then((p) => {
        const history   = p?.emotionHistory ?? [];
        const updated   = [...history.filter((r) => r.date !== today), { date: today, emotion }];
        updateUserProfile(user.uid, {
          streak: newStreak, lastCheckin: today, todayEmotion: emotion, emotionHistory: updated,
        }).catch(console.error);
      });
    }
  };

  return (
    <div className={`min-h-screen bg-background pb-20 ${styles.page}`}>
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
              <span className="text-muted-foreground">Recuerda que todas las emociones son válidas. 💚</span>
            </p>
          </motion.div>
        )}

        {/* Emotion chart — shows when there's at least 2 days of history */}
        <EmotionChart key={chartKey} />

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
          onClick={() => navigate("/journal")}
        />
        <ActivityCard
          icon={Leaf}
          title="Respiración guiada"
          description="1 minuto para volver al presente"
          gradient="gradient-lavender"
          onClick={() => navigate("/processes")}
        />
        <ActivityCard
          icon={Heart}
          title="Gratitud diaria"
          description="Nombra algo que agradeces hoy"
          gradient="gradient-sage"
          onClick={() => navigate("/journal")}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;

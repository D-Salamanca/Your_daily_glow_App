import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakCounterProps {
  streak: number;
}

const StreakCounter = ({ streak }: StreakCounterProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 bg-secondary/60 rounded-full px-4 py-2"
    >
      <motion.div
        animate={streak > 0 ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Flame className={`w-5 h-5 ${streak > 0 ? "text-accent" : "text-muted-foreground"}`} />
      </motion.div>
      <span className="font-bold text-foreground">{streak}</span>
      <span className="text-sm text-muted-foreground">
        {streak === 1 ? "día" : "días"}
      </span>
    </motion.div>
  );
};

export default StreakCounter;

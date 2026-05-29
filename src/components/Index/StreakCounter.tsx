import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import styles from "./StreakCounter.module.css";

interface StreakCounterProps {
  streak: number;
}

const StreakCounter = ({ streak }: StreakCounterProps) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={styles.wrapper}
  >
    <motion.div
      animate={streak > 0 ? { y: [0, -3, 0] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <Flame className={`w-5 h-5 ${streak > 0 ? "text-accent" : "text-muted-foreground"}`} />
    </motion.div>
    <span className={styles.count}>{streak}</span>
    <span className={styles.unit}>{streak === 1 ? "día" : "días"}</span>
  </motion.div>
);

export default StreakCounter;

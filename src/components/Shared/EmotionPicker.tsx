import { motion } from "framer-motion";
import { EMOTIONS } from "@/helpers/emotionHelpers";
import styles from "./EmotionPicker.module.css";

interface EmotionPickerProps {
  selected: string | null;
  onSelect: (emotion: string) => void;
}

const EmotionPicker = ({ selected, onSelect }: EmotionPickerProps) => (
  <div className={styles.grid}>
    {EMOTIONS.map((emotion) => (
      <motion.button
        key={emotion.label}
        whileTap={{ scale: 0.92 }}
        onClick={() => onSelect(emotion.label)}
        className={`${styles.btn} ${emotion.bg} ${
          selected === emotion.label ? styles.btnSelected : styles.btnDefault
        }`}
      >
        <span className={styles.emoji}>{emotion.emoji}</span>
        <span className={styles.label}>{emotion.label}</span>
      </motion.button>
    ))}
  </div>
);

export default EmotionPicker;

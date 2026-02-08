import { motion } from "framer-motion";

const emotions = [
  { emoji: "😊", label: "Bien", color: "bg-sage-light" },
  { emoji: "😌", label: "Tranquilo/a", color: "bg-sky-light" },
  { emoji: "😐", label: "Regular", color: "bg-muted" },
  { emoji: "😔", label: "Bajo/a", color: "bg-lavender-light" },
  { emoji: "😢", label: "Triste", color: "bg-coral-light" },
  { emoji: "😤", label: "Frustrado/a", color: "bg-secondary" },
];

interface EmotionPickerProps {
  selected: string | null;
  onSelect: (emotion: string) => void;
}

const EmotionPicker = ({ selected, onSelect }: EmotionPickerProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {emotions.map((emotion) => (
        <motion.button
          key={emotion.label}
          whileTap={{ scale: 0.92 }}
          onClick={() => onSelect(emotion.label)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            selected === emotion.label
              ? "border-primary bg-sage-light shadow-md"
              : `border-transparent ${emotion.color} hover:border-primary/20`
          }`}
        >
          <span className="text-3xl">{emotion.emoji}</span>
          <span className="text-xs font-medium text-foreground">{emotion.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default EmotionPicker;

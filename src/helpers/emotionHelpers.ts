export interface Emotion {
  emoji: string;
  label: string;
  color: string;
  /** Tailwind background token used for cards */
  bg: string;
}

export const EMOTIONS: Emotion[] = [
  { emoji: "😊", label: "Bien",         color: "#7BAE7F", bg: "bg-sage-light"     },
  { emoji: "😌", label: "Tranquilo/a",  color: "#87CEEB", bg: "bg-sky-light"      },
  { emoji: "😐", label: "Regular",      color: "#9CA3AF", bg: "bg-muted"          },
  { emoji: "😔", label: "Bajo/a",       color: "#B39DDB", bg: "bg-lavender-light" },
  { emoji: "😢", label: "Triste",       color: "#F48FB1", bg: "bg-coral-light"    },
  { emoji: "😤", label: "Frustrado/a",  color: "#FFCC80", bg: "bg-secondary"      },
];

/** Returns the Emotion object for a given label, or undefined */
export function getEmotion(label: string): Emotion | undefined {
  return EMOTIONS.find((e) => e.label === label);
}

/** Returns the emoji for a given emotion label */
export function getEmotionEmoji(label: string): string {
  return getEmotion(label)?.emoji ?? "🙂";
}

/** Returns a short motivational message based on the selected emotion */
export function getEmotionMessage(label: string): string {
  const messages: Record<string, string> = {
    "Bien":        "¡Qué bueno saberlo! Sigue así. 🌟",
    "Tranquilo/a": "La calma es un superpoder. 🌿",
    "Regular":     "Un día normal también cuenta. 💙",
    "Bajo/a":      "Está bien no estar bien. Respira. 🌸",
    "Triste":      "Las lágrimas también son valientes. 💧",
    "Frustrado/a": "Tu enojo es válido. Suéltalo. 🌬️",
  };
  return messages[label] ?? "Recuerda que todas las emociones son válidas. 💚";
}

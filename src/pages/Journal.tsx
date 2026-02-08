import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const prompts = [
  "¿Qué fue lo mejor de tu día?",
  "¿Hay algo que te preocupa ahora mismo?",
  "¿Qué aprendiste hoy sobre ti?",
  "Si pudieras cambiar algo de hoy, ¿qué sería?",
  "¿Qué necesitas en este momento?",
];

const Journal = () => {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [currentPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);

  const handleSave = () => {
    if (!text.trim()) return;
    const entries = JSON.parse(localStorage.getItem("sentir-journal") || "[]");
    entries.push({
      text,
      date: new Date().toISOString(),
      prompt: currentPrompt,
    });
    localStorage.setItem("sentir-journal", JSON.stringify(entries));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setText("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">Háblame de ti</h1>
          <p className="text-muted-foreground mb-6">
            Este es tu espacio seguro. Escribe lo que necesites.
          </p>
        </motion.div>

        {/* Prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="gradient-lavender rounded-2xl p-4 mb-6 flex items-start gap-3"
        >
          <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Una pregunta para reflexionar
            </p>
            <p className="text-foreground font-medium">{currentPrompt}</p>
          </div>
        </motion.div>

        {/* Writing area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe aquí lo que sientes, piensas o necesitas expresar..."
            className="w-full min-h-[280px] bg-card rounded-2xl p-5 text-foreground placeholder:text-muted-foreground/60 resize-none border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all font-body text-base leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {text.length > 0 ? `${text.length} caracteres` : ""}
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!text.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                text.trim()
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Send className="w-4 h-4" />
              Guardar
            </motion.button>
          </div>
        </motion.div>

        {/* Saved feedback */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 bg-sage-light rounded-2xl p-4 text-center"
          >
            <p className="text-foreground font-medium">
              💚 Guardado. Gracias por compartir.
            </p>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Journal;

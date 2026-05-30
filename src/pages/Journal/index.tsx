import styles from './Journal.module.css';
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, Camera, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { saveJournalMessage, getJournalMessages } from "@/lib/firestore";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string };

const ANTHROPIC_API_KEY  = import.meta.env.VITE_ANTHROPIC_API_KEY  as string | undefined;
const ANTHROPIC_MODEL    = (import.meta.env.VITE_ANTHROPIC_MODEL   as string | undefined) || "claude-haiku-4-5-20251001";
const OLLAMA_MODEL       = import.meta.env.VITE_OLLAMA_MODEL       as string | undefined;
const OLLAMA_VISION_MODEL = import.meta.env.VITE_OLLAMA_VISION_MODEL as string | undefined;
const SUPABASE_CHAT_URL  = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const SYSTEM_PROMPT = `Eres Sentir, un compañero emocional cálido y empático. Tu rol es escuchar, validar emociones y acompañar al usuario en su bienestar emocional.

Reglas:
- Responde siempre en español, con calidez y empatía.
- Usa un tono cercano, como un amigo de confianza.
- Valida las emociones del usuario antes de ofrecer perspectivas.
- Haz preguntas abiertas para profundizar la reflexión.
- No diagnostiques ni des consejos médicos. Si detectas riesgo, sugiere buscar ayuda profesional.
- Mantén respuestas concisas (2-4 párrafos máximo).
- Usa emojis con moderación para dar calidez 💚.
- Si el usuario menciona pensamientos suicidas o autolesiones, responde con compasión y proporciona el número de crisis: 024.

Cuando analices una imagen de una persona, describe su estado emocional con empatía y pregunta cómo se siente.`;

const VISION_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

Estás analizando una imagen enviada por el usuario. Observa atentamente las expresiones faciales, postura corporal y contexto visual para identificar su estado emocional actual. Responde con calidez describiendo lo que percibes y haciendo una pregunta abierta.`;

function extractChunkText(parsed: any): string {
  return parsed.delta?.text
    ?? parsed.choices?.[0]?.delta?.content
    ?? "";
}

type OllamaVisionContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

function buildChatRequest(
  msgs: Msg[],
  imageDataUrl?: string
): { url: string; init: RequestInit } {

  // ── Visión con imagen ────────────────────────────────────────────────────
  if (imageDataUrl) {
    if (!OLLAMA_VISION_MODEL) {
      throw new Error(
        "Para analizar imágenes necesitas un modelo de visión. Ejecuta: ollama pull llama3.2-vision"
      );
    }
    const lastMsg = msgs[msgs.length - 1];
    const userContent: OllamaVisionContent[] = [
      { type: "image_url", image_url: { url: imageDataUrl } },
      {
        type: "text",
        text: lastMsg.content || "¿Qué estado de ánimo ves en esta imagen? Analiza mi expresión y dime cómo me ves.",
      },
    ];
    return {
      url: "/ollama/v1/chat/completions",
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_VISION_MODEL,
          messages: [
            { role: "system", content: VISION_SYSTEM_PROMPT },
            ...msgs.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userContent },
          ],
          stream: true,
        }),
      },
    };
  }

  // ── Anthropic (solo texto) ───────────────────────────────────────────────
  if (ANTHROPIC_API_KEY) {
    return {
      url: "/anthropic/v1/messages",
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          system: SYSTEM_PROMPT,
          messages: msgs.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: 1024,
          stream: true,
        }),
      },
    };
  }

  // ── Ollama texto ─────────────────────────────────────────────────────────
  if (OLLAMA_MODEL) {
    return {
      url: "/ollama/v1/chat/completions",
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...msgs.map((m) => ({ role: m.role, content: m.content })),
          ],
          stream: true,
        }),
      },
    };
  }

  // ── Supabase fallback ────────────────────────────────────────────────────
  return {
    url: SUPABASE_CHAT_URL,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: msgs.map((m) => ({ role: m.role, content: m.content })) }),
    },
  };
}

const Journal = () => {
  const { user } = useAuth();
  const [messages, setMessages]         = useState<Msg[]>([]);
  const [input, setInput]               = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar historial desde Firestore al montar
  useEffect(() => {
    if (!user) { setHistoryLoading(false); return; }
    getJournalMessages(user.uid)
      .then((msgs) =>
        setMessages(
          msgs.map((m) => ({
            role:     m.role,
            content:  m.content,
            imageUrl: m.imageUrl,
          }))
        )
      )
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const clearPendingImage = () => {
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // En Android/iOS usa el selector nativo (Cámara o Galería).
  // En web usa el input de archivo normal (sin captura forzada).
  const handleCameraClick = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const photo = await CapCamera.getPhoto({
          quality:           85,
          allowEditing:      false,
          resultType:        CameraResultType.DataUrl,
          source:            CameraSource.Prompt, // muestra diálogo: Cámara | Galería
          promptLabelHeader: "Seleccionar imagen",
          promptLabelCancel: "Cancelar",
          promptLabelPhoto:  "Galería",
          promptLabelPicture:"Cámara",
        });
        if (photo.dataUrl) setPendingImage(photo.dataUrl);
      } catch {
        // Usuario canceló — no hacer nada
      }
    } else {
      // Web: input sin capture → el navegador ofrece cámara o archivo
      fileInputRef.current?.click();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || isLoading) return;

    const imageToSend = pendingImage;
    const userMsg: Msg = {
      role: "user",
      content: text || "¿Qué estado de ánimo ves en esta imagen?",
      ...(imageToSend ? { imageUrl: imageToSend } : {}),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    clearPendingImage();
    setIsLoading(true);

    // Persistir mensaje del usuario en Firestore
    if (user) {
      saveJournalMessage(user.uid, {
        role:     userMsg.role,
        content:  userMsg.content,
        imageUrl: userMsg.imageUrl,
      }).catch(console.error);
    }

    let assistantSoFar = "";

    try {
      const allMsgs = [...messages, userMsg];
      const { url, init } = buildChatRequest(allMsgs, imageToSend ?? undefined);
      const resp = await fetch(url, init);

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Error de conexión");
      }

      const reader  = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const snapshot = assistantSoFar;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
          }
          return [...prev, { role: "assistant", content: snapshot }];
        });
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer  = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed  = JSON.parse(jsonStr);
            const content = extractChunkText(parsed);
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed  = JSON.parse(jsonStr);
            const content = extractChunkText(parsed);
            if (content) upsert(content);
          } catch { /* ignore */ }
        }
      }
      // Persistir respuesta del asistente en Firestore
      if (user && assistantSoFar) {
        saveJournalMessage(user.uid, {
          role:    "assistant",
          content: assistantSoFar,
        }).catch(console.error);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${e.message || "Hubo un error. Intenta de nuevo."}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = (input.trim().length > 0 || pendingImage !== null) && !isLoading;

  return (
    <div className={`min-h-screen bg-background flex flex-col ${styles.page}`}>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Háblame de ti</h1>
          <p className="text-muted-foreground text-sm">
            Soy tu compañero emocional. Cuéntame lo que necesites. 💚
          </p>
        </motion.div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {historyLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs">Cargando historial…</span>
          </div>
        )}

        {!historyLoading && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mt-4"
          >
            <div className="gradient-lavender rounded-2xl p-5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">¿No sabes por dónde empezar?</p>
                <p className="text-foreground text-sm">
                  Puedes contarme cómo te sientes hoy, algo que te preocupa, o simplemente saludar.
                </p>
              </div>
            </div>

            {OLLAMA_VISION_MODEL && (
              <div className="gradient-sage rounded-2xl p-4 flex items-start gap-3">
                <Camera className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Análisis emocional por imagen</p>
                  <p className="text-foreground text-sm">
                    Toca el icono de cámara y hazte una foto. Analizaré tu expresión y te diré cómo te veo. 📷
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl text-sm leading-relaxed overflow-hidden ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border text-foreground rounded-bl-md"
                }`}
              >
                {/* Imagen adjunta */}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="foto enviada"
                    className="w-full max-h-60 object-cover"
                  />
                )}

                <div className="px-4 py-3">
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-20 pt-2 bg-background border-t border-border">

        {/* Preview imagen pendiente */}
        <AnimatePresence>
          {pendingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2"
            >
              <div className="relative inline-block">
                <img
                  src={pendingImage}
                  alt="preview"
                  className="h-24 w-24 object-cover rounded-2xl border-2 border-primary/30"
                />
                <button
                  onClick={clearPendingImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black/50 rounded-lg px-1.5 py-0.5">
                  <p className="text-white text-[9px] font-medium">📷 lista</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* Botón cámara / galería */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCameraClick}
            disabled={isLoading}
            title="Foto desde cámara o galería"
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              pendingImage
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <Camera className="w-4 h-4" />
          </motion.button>

          {/* Input oculto para web — sin capture para permitir cámara Y galería */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingImage ? "Añade un mensaje o envía solo la foto…" : "Escribe lo que sientes..."}
            rows={1}
            className="flex-1 min-h-[44px] max-h-[120px] bg-card rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/60 resize-none border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm leading-relaxed"
          />

          {/* Botón enviar */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={!canSend}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              canSend ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Journal;

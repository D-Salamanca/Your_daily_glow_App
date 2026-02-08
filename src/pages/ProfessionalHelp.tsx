import { motion } from "framer-motion";
import { Phone, Globe, MessageCircle, Heart, Shield, ExternalLink } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const resources = [
  {
    name: "Línea de crisis emocional",
    description: "Atención inmediata si sientes que necesitas hablar con alguien ahora",
    phone: "024",
    icon: Phone,
    gradient: "gradient-coral",
    urgent: true,
  },
  {
    name: "Teléfono de la Esperanza",
    description: "Escucha y orientación las 24 horas, todos los días",
    phone: "717 003 717",
    icon: MessageCircle,
    gradient: "gradient-lavender",
  },
  {
    name: "Línea de atención a la conducta suicida",
    description: "Apoyo especializado y confidencial",
    phone: "024",
    icon: Heart,
    gradient: "gradient-sage",
  },
];

const directories = [
  {
    name: "Psicólogos cerca de ti",
    description: "Encuentra profesionales en tu zona",
    url: "https://www.cop.es",
    label: "Colegio Oficial de Psicólogos",
  },
  {
    name: "Terapia online",
    description: "Sesiones desde la comodidad de tu hogar",
    url: "https://www.doctoralia.es",
    label: "Doctoralia",
  },
];

const ProfessionalHelp = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 pt-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Ayuda profesional</h1>
          <p className="text-muted-foreground mb-6">
            Pedir ayuda es un acto de valentía. Aquí tienes recursos confiables.
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-sage-light rounded-2xl p-4 mb-6 border border-primary/10 flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Sentir no reemplaza la terapia profesional.</span>{" "}
            Si estás pasando por un momento difícil, te animamos a contactar con un profesional. No estás solo/a. 💙
          </p>
        </motion.div>

        {/* Urgent lines */}
        <h2 className="text-lg font-bold text-foreground mb-3">Líneas de ayuda</h2>
        <div className="space-y-3 mb-8">
          {resources.map((resource, i) => (
            <motion.a
              key={resource.name}
              href={`tel:${resource.phone.replace(/\s/g, "")}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={`block w-full p-4 rounded-2xl ${resource.gradient} border border-border/50`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center flex-shrink-0">
                  <resource.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">{resource.name}</h3>
                    {resource.urgent && (
                      <span className="text-[10px] font-bold bg-accent/30 text-accent-foreground px-2 py-0.5 rounded-full">
                        24H
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
                  <p className="text-primary font-bold mt-2 text-lg">{resource.phone}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Directories */}
        <h2 className="text-lg font-bold text-foreground mb-3">Buscar profesionales</h2>
        <div className="space-y-3 mb-8">
          {directories.map((dir, i) => (
            <motion.a
              key={dir.name}
              href={dir.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="block w-full bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{dir.name}</h3>
                    <p className="text-xs text-muted-foreground">{dir.description}</p>
                    <p className="text-xs text-primary mt-1">{dir.label}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Encouraging message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="gradient-lavender rounded-2xl p-5 text-center"
        >
          <p className="text-foreground font-medium">
            Recuerda: pedir ayuda no te hace débil.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Te hace humano/a. 🤍
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfessionalHelp;

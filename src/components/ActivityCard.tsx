import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ActivityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  onClick?: () => void;
}

const ActivityCard = ({ icon: Icon, title, description, gradient, onClick }: ActivityCardProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full p-5 rounded-2xl text-left ${gradient} border border-border/50`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};

export default ActivityCard;

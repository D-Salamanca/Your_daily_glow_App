import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  onClick?: () => void;
}

const ActivityCard = ({ icon: Icon, title, description, gradient, onClick }: ActivityCardProps) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`${styles.card} ${gradient}`}
  >
    <div className={styles.inner}>
      <div className={styles.iconWrap}>
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{description}</p>
      </div>
    </div>
  </motion.button>
);

export default ActivityCard;

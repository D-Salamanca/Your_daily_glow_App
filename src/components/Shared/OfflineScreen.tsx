import { WifiOff, Home, Target, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./OfflineScreen.module.css";

const OfflineScreen = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <div className={styles.iconWrap}>
          <WifiOff className={styles.icon} />
        </div>

        <h2 className={styles.title}>No estás online</h2>
        <p className={styles.message}>
          Esta sección necesita conexión a internet. Revisa tu red e inténtalo de nuevo.
        </p>

        <div className={styles.divider} />

        <p className={styles.hint}>Disponible sin conexión:</p>
        <div className={styles.offline}>
          <button onClick={() => navigate("/home")}      className={styles.offlineBtn}>
            <Home className="w-4 h-4" /> Inicio
          </button>
          <button onClick={() => navigate("/processes")} className={styles.offlineBtn}>
            <Target className="w-4 h-4" /> Procesos
          </button>
          <button onClick={() => navigate("/savings")}   className={styles.offlineBtn}>
            <PiggyBank className="w-4 h-4" /> Metas
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OfflineScreen;

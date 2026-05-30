import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircleHeart, Target, HandHeart, Settings, Moon, PiggyBank, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import styles from "./BottomNav.module.css";

const ONLINE_ONLY = new Set(["/journal", "/cycle", "/help", "/settings"]);

const BottomNav = () => {
  const location   = useLocation();
  const isOnline   = useOnlineStatus();
  const [cycleEnabled, setCycleEnabled] = useState(false);

  useEffect(() => {
    setCycleEnabled(localStorage.getItem("sentir-cycle-enabled") === "true");
  }, []);

  const navItems = [
    { to: "/home",      icon: Home,               label: "Inicio"   },
    { to: "/journal",   icon: MessageCircleHeart,  label: "Sentir"   },
    { to: "/processes", icon: Target,              label: "Procesos" },
    { to: "/savings",   icon: PiggyBank,           label: "Metas"    },
    ...(cycleEnabled ? [{ to: "/cycle", icon: Moon, label: "Ciclo" }] : []),
    { to: "/help",      icon: HandHeart,           label: "Ayuda"    },
    { to: "/settings",  icon: Settings,            label: "Ajustes"  },
  ];

  return (
    <nav className={styles.nav}>
      {/* Offline banner */}
      {!isOnline && (
        <div className={styles.offlineBanner}>
          <WifiOff className="w-3 h-3" />
          <span>Sin conexión — solo Inicio, Procesos y Metas</span>
        </div>
      )}

      <div className={styles.inner}>
        {navItems.map((item) => {
          const isActive    = location.pathname === item.to;
          const isRestricted = !isOnline && ONLINE_ONLY.has(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`${styles.item} ${isRestricted ? styles.itemDisabled : ""}`}
            >
              {isActive && !isRestricted && (
                <motion.div
                  layoutId="nav-indicator"
                  className={styles.indicator}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 ${styles.icon} ${
                  isRestricted
                    ? styles.iconDisabled
                    : isActive
                    ? styles.iconActive
                    : styles.iconDefault
                }`}
              />
              <span
                className={`${styles.label} ${
                  isRestricted
                    ? styles.labelDisabled
                    : isActive
                    ? styles.labelActive
                    : styles.labelDefault
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

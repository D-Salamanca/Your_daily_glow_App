import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircleHeart, Target, HandHeart, Settings, Moon, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "./BottomNav.module.css";

const BottomNav = () => {
  const location = useLocation();
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
      <div className={styles.inner}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to} className={styles.item}>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className={styles.indicator}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 ${styles.icon} ${isActive ? styles.iconActive : styles.iconDefault}`}
              />
              <span className={`${styles.label} ${isActive ? styles.labelActive : styles.labelDefault}`}>
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

import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircleHeart, Target, HandHeart, Settings, Moon, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const BottomNav = () => {
  const location = useLocation();
  const [cycleEnabled, setCycleEnabled] = useState(false);

  useEffect(() => {
    setCycleEnabled(localStorage.getItem("sentir-cycle-enabled") === "true");
  }, []);

  const navItems = [
    { to: "/home", icon: Home, label: "Inicio" },
    { to: "/journal", icon: MessageCircleHeart, label: "Sentir" },
    { to: "/processes", icon: Target, label: "Procesos" },
    { to: "/savings", icon: PiggyBank, label: "Metas" },
    ...(cycleEnabled ? [{ to: "/cycle", icon: Moon, label: "Ciclo" }] : []),
    { to: "/help", icon: HandHeart, label: "Ayuda" },
    { to: "/settings", icon: Settings, label: "Ajustes" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 relative px-4 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
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

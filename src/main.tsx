import { createRoot } from "react-dom/client";
import App from "./App.tsx";
/* Ionic core – must come before Tailwind so Tailwind overrides work */
import "@ionic/react/css/core.css";
import "@ionic/react/css/structure.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

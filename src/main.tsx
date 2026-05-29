import { createRoot } from "react-dom/client";
import App from "./App.tsx";
/* Ionic core CSS variables — structure.css omitted intentionally:
   it sets body { position: fixed; overflow: hidden } which blocks
   native browser scroll when not using IonApp + IonContent */
import "@ionic/react/css/core.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

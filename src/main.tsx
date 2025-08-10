import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/UserLocation.css";
import "./i18n";
// Removido: imports de páginas não usados aqui

if (typeof window !== "undefined") {
  // Hotjar Tracking Code for https://tuktuk-milfontes.vercel.app/
  (function () {
    const w = window as unknown as {
      hj?: ((...args: unknown[]) => void) & { q?: unknown[] };
      _hjSettings?: { hjid: number; hjsv: number };
      [k: string]: unknown;
    };
    const d = document;
    w.hj =
      w.hj ||
      function (...args: unknown[]) {
        (w.hj!.q = w.hj!.q || []).push(args);
      };
    w._hjSettings = { hjid: 6461744, hjsv: 6 };
    const s = d.createElement("script");
    s.async = true;
    s.src = `https://static.hotjar.com/c/hotjar-${w._hjSettings.hjid}.js?sv=${w._hjSettings.hjsv}`;
    d.head.appendChild(s);
  })();
}

createRoot(document.getElementById("root")!).render(<App />);

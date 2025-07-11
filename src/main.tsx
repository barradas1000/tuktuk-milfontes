import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import TermosCondicoes from "./pages/TermosCondicoes";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaCancelamento from "./pages/PoliticaCancelamento";

if (typeof window !== "undefined") {
  // Hotjar Tracking Code for https://tuktuk-milfontes.vercel.app/
  (function (h, o, t, j, a, r) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: 6461744, hjsv: 6 };
    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script");
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
}

createRoot(document.getElementById("root")!).render(<App />);

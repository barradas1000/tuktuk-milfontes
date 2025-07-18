import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import nl from "./locales/nl.json";
import it from "./locales/it.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      nl: { translation: nl },
      it: { translation: it },
    },
    fallbackLng: "pt",
    supportedLngs: ["pt", "en", "es", "fr", "de", "nl", "it"],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

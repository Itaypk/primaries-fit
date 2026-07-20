import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./i18n";
import { initAnalytics } from "./analytics";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider initialLocale="he">
      <App />
    </I18nProvider>
  </StrictMode>,
);

// No-op unless VITE_GOATCOUNTER is set at build time. See src/analytics.ts.
initAnalytics();

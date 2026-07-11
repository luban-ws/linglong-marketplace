import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LocaleProvider } from "./i18n/LocaleContext.tsx";
import "./App.css";

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root");

createRoot(el).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
);

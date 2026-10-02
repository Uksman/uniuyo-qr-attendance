import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth";
import { App } from "./App";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import "./index.css";

// Register PWA Service Worker
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <PwaInstallPrompt />
      <App />
    </AuthProvider>
  </BrowserRouter>,
);

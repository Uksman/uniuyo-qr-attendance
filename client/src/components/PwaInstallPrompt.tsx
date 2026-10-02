import { useEffect, useState } from "react";
import { InstallAppIcon } from "./Icons";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_UNTIL_KEY = "uniuyo-install-dismissed-until";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(ios);
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true);

    try {
      setIsDismissed(Number(localStorage.getItem(DISMISSED_UNTIL_KEY) || 0) > Date.now());
    } catch {
      // Keep installation available when browser storage is disabled.
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as DeferredInstallPrompt);
    }
    function handleInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstructions(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showInstructions) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setShowInstructions(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showInstructions]);

  async function installOrExplain() {
    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === "accepted") setIsInstalled(true);
      else setShowInstructions(true);
    } catch {
      setDeferredPrompt(null);
      setShowInstructions(true);
    }
  }

  function dismiss() {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {
      // The banner is still dismissed for this page session.
    }
  }

  return <>
    {!isInstalled && !isDismissed && <aside
      aria-label="Install UNIUYO Attendance"
      className="fixed bottom-20 right-3 z-[60] flex w-[calc(100vw-1.5rem)] max-w-[350px] items-center gap-2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl sm:bottom-4 sm:right-4 sm:gap-3"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00A859]">
        <InstallAppIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold text-slate-900">Install UNIUYO Attendance</p>
        <p className="text-[10px] leading-4 text-slate-500">Quick access from your Home Screen.</p>
      </div>
      <button
        type="button"
        onClick={() => void installOrExplain()}
        className="shrink-0 rounded-lg bg-[#00A859] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#053E17]"
      >
        {deferredPrompt ? "Install" : "How to"}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install message"
        className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-sm text-slate-500 shadow"
      >×</button>
    </aside>}

    {showInstructions && <div
      className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) setShowInstructions(false); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="install-help-title" className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={() => setShowInstructions(false)} aria-label="Close install instructions" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-lg text-slate-500 hover:bg-slate-100">×</button>
        <p className="mb-2 text-[10px] font-extrabold tracking-[0.16em] text-[#00A859]">UNIUYO ATTENDANCE</p>
        <h2 id="install-help-title" className="mb-4 pr-5 text-lg font-extrabold text-slate-900">{isIos ? "Add to your Home Screen" : "Install the attendance app"}</h2>
        {isIos ? <ol className="mb-5 list-decimal space-y-2 pl-5 text-sm leading-5 text-slate-600">
          <li>Open this page in Safari and tap the Share button.</li>
          <li>Choose <strong className="text-slate-800">Add to Home Screen</strong>.</li>
          <li>Tap <strong className="text-slate-800">Add</strong> to finish.</li>
        </ol> : <ol className="mb-5 list-decimal space-y-2 pl-5 text-sm leading-5 text-slate-600">
          <li>Open this page in your browser menu (⋮ or Share).</li>
          <li>Choose <strong className="text-slate-800">Install app</strong> or <strong className="text-slate-800">Add to Home screen</strong>.</li>
          <li>If the option is missing, use the deployed HTTPS site in Chrome and reload.</li>
        </ol>}
        <button type="button" onClick={() => setShowInstructions(false)} className="w-full rounded-lg bg-[#00A859] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#053E17]">Got it</button>
      </section>
    </div>}
  </>;
}

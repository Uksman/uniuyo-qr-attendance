import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanToken } from "../api";

type ScanState =
  | { kind: "idle" }
  | { kind: "success"; courseCode: string }
  | { kind: "error"; message: string };

// Web Audio API success chime for native web app feel
function playScanSuccessChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch {
    // Ignore audio context errors if muted/unsupported
  }

  // Mobile haptic feedback
  if ("vibrate" in navigator) {
    navigator.vibrate([80, 40, 80]);
  }
}

export function StudentScanPage() {
  const [state, setState] = useState<ScanState>({ kind: "idle" });
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (busyRef.current) {
            return;
          }
          busyRef.current = true;
          try {
            const result = await scanToken(decodedText);
            playScanSuccessChime();
            setState({ kind: "success", courseCode: result.courseCode });
            await scanner.stop().catch(() => undefined);
          } catch (err) {
            setState({
              kind: "error",
              message: err instanceof Error ? err.message : "Scan failed",
            });
            busyRef.current = false;
          }
        },
        () => undefined,
      )
      .catch(() => {
        setCameraError(
          "Camera access failed. Ensure camera permissions are allowed.",
        );
      });

    return () => {
      scanner
        .stop()
        .catch(() => undefined)
        .finally(() => {
          scanner.clear();
        });
    };
  }, []);

  return (
    <div className="relative overflow-hidden mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
      {/* Top UNIUYO Emerald Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00A859]" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#053E17] text-white font-bold shadow-md">
            🎓
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide">
              ATTENDANCE SCANNER
            </h1>
            <p className="text-xs font-bold text-[#00A859]">UNIUYO Mobile Web App</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-[#00A859] border border-emerald-200">
          <div className="h-2 w-2 rounded-full bg-[#00A859] animate-pulse" />
          <span>Live Camera</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600 leading-relaxed">
        Align the lecturer's attendance QR code within the frame to automatically log your attendance.
      </p>

      {cameraError && (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
          ⚠️ {cameraError}
        </div>
      )}

      {state.kind === "error" && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          ❌ {state.message}
        </div>
      )}

      {state.kind === "success" && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-900 flex items-center gap-3 shadow-lg animate-bounce">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00A859] text-white shrink-0 font-extrabold text-sm">
            ✓
          </div>
          <div>
            <p className="font-extrabold text-sm text-[#053E17]">Attendance Verified!</p>
            <p className="text-[11px] text-emerald-700">Course {state.courseCode} attendance logged successfully.</p>
          </div>
        </div>
      )}

      {/* QR Camera Reader Container */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border-2 border-slate-300 bg-black shadow-inner">
        <div id="qr-reader" className="min-h-[280px]" />
      </div>

      {state.kind === "error" && (
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-[#00A859] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00A859]/20 transition hover:bg-[#058648] active:scale-95"
          onClick={() => {
            setState({ kind: "idle" });
            busyRef.current = false;
          }}
        >
          🔄 Try Scanning Again
        </button>
      )}
    </div>
  );
}

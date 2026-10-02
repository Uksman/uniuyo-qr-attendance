import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanToken } from "../api";
import {
  ScanIcon,
  CameraIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
} from "../components/Icons";

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
    <div className="relative overflow-hidden mx-auto max-w-md rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xl">
      {/* Top UNIUYO Emerald Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00A859]" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#00A859]/10 text-[#00A859] border border-[#00A859]/20 shadow-xs shrink-0">
            <ScanIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide truncate">
              Attendance Scanner
            </h1>
            <p className="text-[11px] sm:text-xs font-bold text-[#00A859] truncate">UNIUYO Mobile Web App</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-[#00A859] border border-emerald-200 shrink-0">
          <CameraIcon className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Live Camera</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600 leading-relaxed">
        Align the lecturer's attendance QR code within the frame to automatically log your attendance.
      </p>

      {cameraError && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-semibold text-amber-800 flex items-start gap-2.5">
          <AlertTriangleIcon className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      {state.kind === "error" && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700 flex items-start gap-2.5">
          <XCircleIcon className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      {state.kind === "success" && (
        <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-xs font-extrabold text-emerald-900 flex items-center gap-3 shadow-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00A859] text-white shrink-0 shadow-sm">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-extrabold text-sm text-[#053E17]">Attendance Verified!</p>
            <p className="text-[11px] text-emerald-700 font-medium">Course {state.courseCode} attendance logged successfully.</p>
          </div>
        </div>
      )}

      {/* QR Camera Reader Container */}
      <div className="relative mt-4 overflow-hidden rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-slate-950 shadow-inner">
        <div id="qr-reader" className="min-h-[260px] sm:min-h-[280px]" />
      </div>

      {state.kind === "error" && (
        <button
          type="button"
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#00A859] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00A859]/20 transition hover:bg-[#058648] active:scale-95"
          onClick={() => {
            setState({ kind: "idle" });
            busyRef.current = false;
          }}
        >
          <RefreshIcon className="h-4 w-4" />
          <span>Try Scanning Again</span>
        </button>
      )}
    </div>
  );
}

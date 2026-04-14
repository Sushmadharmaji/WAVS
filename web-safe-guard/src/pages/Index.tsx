import { useState, useEffect, useCallback } from "react";
import ScannerInput, { ScanOptions } from "@/components/ScannerInput";
import ScanProgress from "@/components/ScanProgress";
import ScanResults from "@/components/ScanResults";
import VulnerabilityDetails from "@/components/VulnerabilityDetails";
import { SCAN_PHASES, Vulnerability } from "@/lib/scanner-data";

type ScanState = "idle" | "scanning" | "complete" | "detail";

// ---------------------------------------------------------------------------
// How long each phase runs in the UI (ms).
// We no longer wait for ALL phases to finish before hitting the backend —
// the fetch fires immediately so real results arrive as fast as possible.
// The phase animation is purely visual feedback.
// ---------------------------------------------------------------------------
const PHASE_STEP_MS = 120; // tick rate for progress increments

const Index = () => {
  const [state,        setState]        = useState<ScanState>("idle");
  const [targetUrl,    setTargetUrl]    = useState("");
  const [scanOptions,  setScanOptions]  = useState<ScanOptions>({ type: "full", depth: "normal", timeout: 60 });
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress,     setProgress]     = useState(0);
  const [results,      setResults]      = useState<Vulnerability[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  // ── Start scan ────────────────────────────────────────────────────────────

  const runScan = useCallback((url: string, options: ScanOptions) => {
    setTargetUrl(url);
    setScanOptions(options);
    setState("scanning");
    setCurrentPhase(0);
    setProgress(0);
    setResults([]);
    setBackendError(null);
  }, []);

  // ── Scan effect: phases run in parallel with the real backend fetch ───────

  useEffect(() => {
    if (state !== "scanning") return;

    let cancelled = false;

    // ── 1. Fire the real backend request immediately ──────────────────────
    const controller = new AbortController();
    const timeoutId  = window.setTimeout(
      () => controller.abort(),
      scanOptions.timeout * 1000,
    );

    fetch("http://127.0.0.1:5000/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        url:   targetUrl,
        type:  scanOptions.type,
        depth: scanOptions.depth,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        clearTimeout(timeoutId);

        if (data.errors?.length) {
          console.warn("Scanner warnings:", data.errors);
        }

        setResults(Array.isArray(data.results) ? data.results : []);

        // Snap progress to 100 % and transition to complete
        setProgress(100);
        setCurrentPhase(SCAN_PHASES.length);
        setTimeout(() => {
          if (!cancelled) setState("complete");
        }, 400);
      })
      .catch((err) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        console.error("Backend error:", err);

        const isTimeout = err.name === "AbortError";
        setBackendError(
          isTimeout
            ? `Scan timed out after ${scanOptions.timeout}s. Try a shorter timeout or a Quick scan.`
            : "Could not connect to scan backend. Make sure Flask is running:\n  cd backend && python app.py",
        );
        setState("idle");
      });

    // ── 2. Animate phases independently so the UI isn't frozen ───────────
    const totalDuration = SCAN_PHASES.reduce((s, p) => s + p.duration, 0);
    let elapsed   = 0;
    let phase     = 0;
    let phaseStep = 0;

    const tick = setInterval(() => {
      if (cancelled || phase >= SCAN_PHASES.length) return;

      const phaseDuration = SCAN_PHASES[phase].duration;
      const stepsInPhase  = Math.ceil(phaseDuration / PHASE_STEP_MS);
      phaseStep++;

      const phaseElapsed = elapsed + (phaseDuration * phaseStep) / stepsInPhase;
      // Cap animated progress at 95 % — the backend response snaps it to 100 %
      setProgress(Math.min((phaseElapsed / totalDuration) * 100, 95));

      if (phaseStep >= stepsInPhase) {
        elapsed  += phaseDuration;
        phase    += 1;
        phaseStep = 0;
        setCurrentPhase(phase);
      }
    }, PHASE_STEP_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      clearInterval(tick);
      controller.abort();
    };
  }, [state, targetUrl, scanOptions]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNewScan = () => {
    setState("idle");
    setResults([]);
    setProgress(0);
    setCurrentPhase(0);
    setBackendError(null);
  };

  const handleCancelScan = () => {
    setState("idle");
    setProgress(0);
    setCurrentPhase(0);
  };

  const handleSelectVuln = (vuln: Vulnerability) => {
    setSelectedVuln(vuln);
    setState("detail");
  };

  const handleBackToResults = () => {
    setSelectedVuln(null);
    setState("complete");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background px-4 py-12 md:py-20">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(160 100% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 45%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        {/* Backend error banner */}
        {backendError && (
          <div className="w-full max-w-3xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
            <p className="text-destructive text-sm font-mono whitespace-pre-line">
              ⚠️ {backendError}
            </p>
            <button
              onClick={() => setBackendError(null)}
              className="mt-2 text-xs text-destructive underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Idle / scanning — show input (hidden during scanning via isScanning prop) */}
        {(state === "idle" || state === "scanning") && (
          <ScannerInput
            onStartScan={runScan}
            isScanning={state === "scanning"}
          />
        )}

        {state === "scanning" && (
          <ScanProgress
            currentPhase={currentPhase}
            progress={progress}
            onCancel={handleCancelScan}
          />
        )}

        {state === "complete" && (
          <ScanResults
            targetUrl={targetUrl}
            vulnerabilities={results}
            onNewScan={handleNewScan}
            onSelectVuln={handleSelectVuln}
          />
        )}

        {state === "detail" && selectedVuln && (
          <VulnerabilityDetails
            vulnerability={selectedVuln}
            onBack={handleBackToResults}
          />
        )}
      </div>
    </div>
  );
};

export default Index;

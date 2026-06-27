"use client";

import { useState, useEffect } from "react";

type Step = "available" | "committing" | "waiting" | "registering" | "done";

const REGISTRATION_PRICE: Record<number, string> = {
  1: "0.320",
  2: "0.032",
  3: "0.016",
  4: "0.004",
};

function getPrice(name: string): string {
  const len = name.length;
  return REGISTRATION_PRICE[Math.min(len, 4)] ?? "0.001";
}

export default function RegistrationFlow({ name }: { name: string }) {
  const [step, setStep] = useState<Step>("available");
  const [countdown, setCountdown] = useState(60);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    setStep("available");
    setCountdown(60);
  }, [name]);

  useEffect(() => {
    if (step !== "waiting") return;
    if (countdown <= 0) {
      setStep("registering");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  const price = getPrice(name);
  const total = (parseFloat(price) * duration).toFixed(3);

  function handleCommit() {
    if (typeof window !== "undefined") {
      const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
      if (!ethereum) {
        alert("MetaMask not found. Please install MetaMask to connect your wallet.");
        return;
      }
    }
    setStep("committing");
    // Simulate commit tx confirmation after 2s
    setTimeout(() => {
      setStep("waiting");
      setCountdown(60);
    }, 2000);
  }

  function handleRegister() {
    setStep("registering");
    // Simulate register tx confirmation after 2s
    setTimeout(() => setStep("done"), 2000);
  }

  return (
    <div className="rounded border border-accent/30 bg-card overflow-hidden">
      {/* Name header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-mono text-foreground font-semibold">
          {name}.wei
        </span>
        <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
          Available
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Duration selector */}
        {(step === "available" || step === "done") && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duration</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDuration((d) => Math.max(1, d - 1))}
                className="w-7 h-7 rounded border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm"
                disabled={step === "done"}
              >
                -
              </button>
              <span className="font-mono text-sm w-16 text-center text-foreground">
                {duration} yr{duration > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setDuration((d) => Math.min(5, d + 1))}
                className="w-7 h-7 rounded border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm"
                disabled={step === "done"}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Price breakdown */}
        {step !== "done" && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{price} ETH/yr × {duration} yr</span>
              <span className="font-mono text-foreground">{total} ETH</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Est. gas fee</span>
              <span className="font-mono text-foreground">~0.001 ETH</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 mt-1 font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono text-accent">
                ~{(parseFloat(total) + 0.001).toFixed(3)} ETH
              </span>
            </div>
          </div>
        )}

        {/* Steps */}
        <StepIndicator step={step} />

        {/* CTA */}
        {step === "available" && (
          <button
            onClick={handleCommit}
            className="w-full bg-accent text-accent-foreground font-semibold py-2.5 rounded text-sm hover:opacity-90 transition-opacity"
          >
            Step 1: Commit
          </button>
        )}

        {step === "committing" && (
          <button
            disabled
            className="w-full bg-accent/40 text-accent-foreground font-semibold py-2.5 rounded text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Spinner />
            Confirming commit...
          </button>
        )}

        {step === "waiting" && (
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Wait for anti-frontrunning period
            </p>
            <div className="text-3xl font-mono font-bold text-accent tabular-nums">
              {String(countdown).padStart(2, "0")}s
            </div>
          </div>
        )}

        {step === "registering" && (
          <button
            onClick={handleRegister}
            className="w-full bg-accent text-accent-foreground font-semibold py-2.5 rounded text-sm hover:opacity-90 transition-opacity"
          >
            Step 2: Register
          </button>
        )}

        {step === "done" && (
          <div className="text-center space-y-2 py-2">
            <div className="text-accent text-2xl">✓</div>
            <p className="font-semibold text-foreground text-sm">
              {name}.wei is yours!
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your name is now registered as an NFT on Ethereum.
              <br />
              Manage it at{" "}
              <span className="font-mono text-accent">wei.domains</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { key: "commit", label: "Commit" },
    { key: "wait", label: "Wait 60s" },
    { key: "register", label: "Register" },
  ];

  function getStepState(key: string) {
    if (key === "commit") {
      if (step === "available") return "pending";
      if (step === "committing") return "active";
      return "done";
    }
    if (key === "wait") {
      if (step === "available" || step === "committing") return "pending";
      if (step === "waiting") return "active";
      return "done";
    }
    if (key === "register") {
      if (step === "registering") return "active";
      if (step === "done") return "done";
      return "pending";
    }
    return "pending";
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const state = getStepState(s.key);
        return (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full h-1 rounded-full transition-colors ${
                  state === "done"
                    ? "bg-accent"
                    : state === "active"
                    ? "bg-accent/60"
                    : "bg-border"
                }`}
              />
              <span
                className={`text-xs font-mono transition-colors ${
                  state === "done" || state === "active"
                    ? "text-accent"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-3 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

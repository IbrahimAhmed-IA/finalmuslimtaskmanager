import React, { useEffect, useRef, useState } from "react";

interface TutorialStep {
  selector: string; // CSS selector for the element to highlight
  message: string;
  arrow?: "top" | "bottom" | "left" | "right";
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  storageKey: string; // e.g. 'tutorial_main_completed'
  onFinish?: () => void;
}

const ARROW_SVG = {
  top: (
    <svg width="60" height="60" viewBox="0 0 60 60" className="animate-bounce" style={{transform: 'rotate(0deg)'}}>
      <polygon points="30,10 50,40 10,40" fill="#38bdf8" />
    </svg>
  ),
  bottom: (
    <svg width="60" height="60" viewBox="0 0 60 60" className="animate-bounce" style={{transform: 'rotate(180deg)'}}>
      <polygon points="30,10 50,40 10,40" fill="#38bdf8" />
    </svg>
  ),
  left: (
    <svg width="60" height="60" viewBox="0 0 60 60" className="animate-bounce" style={{transform: 'rotate(-90deg)'}}>
      <polygon points="30,10 50,40 10,40" fill="#38bdf8" />
    </svg>
  ),
  right: (
    <svg width="60" height="60" viewBox="0 0 60 60" className="animate-bounce" style={{transform: 'rotate(90deg)'}}>
      <polygon points="30,10 50,40 10,40" fill="#38bdf8" />
    </svg>
  ),
};

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, storageKey, onFinish }) => {
  const [step, setStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [show, setShow] = useState(false);

  // Only show if not completed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(storageKey)) {
        setShow(true);
      }
    }
  }, [storageKey]);

  // Highlight the current element
  useEffect(() => {
    if (!show) return;
    const sel = steps[step]?.selector;
    if (!sel) return;
    const el = document.querySelector(sel);
    if (el) {
      setTimeout(() => {
        setHighlightRect(el.getBoundingClientRect());
      }, 200); // allow for render
    }
  }, [step, show, steps]);

  // Finish tutorial
  const finish = () => {
    setShow(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, '1');
    }
    if (onFinish) onFinish();
  };

  if (!show || !steps[step]) return null;

  // Overlay and highlight
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto">
      {/* Dim background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" />
      {/* Highlighted element */}
      {highlightRect && (
        <div
          style={{
            position: "fixed",
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            borderRadius: 12,
            border: "3px solid #38bdf8",
            boxShadow: "0 0 0 6px rgba(56,189,248,0.2)",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
            zIndex: 10001,
          }}
        />
      )}
      {/* Message and arrow */}
      {highlightRect && (
        <div
          style={{
            position: "fixed",
            top: steps[step].arrow === "bottom"
              ? highlightRect.bottom + 24
              : steps[step].arrow === "top"
                ? highlightRect.top - 100
                : highlightRect.top + highlightRect.height / 2 - 30,
            left: steps[step].arrow === "right"
              ? highlightRect.right + 24
              : steps[step].arrow === "left"
                ? highlightRect.left - 320
                : highlightRect.left + highlightRect.width / 2 - 150,
            width: 300,
            zIndex: 10002,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {ARROW_SVG[steps[step].arrow || "top"]}
          <div className="rounded-xl bg-white/95 text-gray-900 shadow-xl px-6 py-4 text-base font-medium animate-fade-in border border-blue-200">
            {steps[step].message}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold"
                onClick={finish}
              >
                Skip
              </button>
              {step < steps.length - 1 ? (
                <button
                  className="px-3 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  className="px-3 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold"
                  onClick={finish}
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
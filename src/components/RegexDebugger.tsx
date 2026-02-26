import { useEffect, useMemo, useState } from 'react';
import { buildDebugSteps } from '../lib/regex';

type RegexDebuggerProps = {
  regex: RegExp | null;
  text: string;
  onStepChange?: (stepIndex: number) => void;
};

export function RegexDebugger({ regex, text, onStepChange }: RegexDebuggerProps) {
  const steps = useMemo(() => (regex ? buildDebugSteps(regex, text) : []), [regex, text]);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    setStepIndex(0);
  }, [regex?.source, regex?.flags, text]);

  useEffect(() => {
    onStepChange?.(stepIndex);
  }, [onStepChange, stepIndex]);

  useEffect(() => {
    if (!autoPlay || steps.length === 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1 >= steps.length ? 0 : prev + 1));
    }, 600);

    return () => window.clearInterval(timer);
  }, [autoPlay, steps.length]);

  const activeStep = steps[stepIndex];

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">Regex Debugger</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-600"
            onClick={() => setStepIndex((prev) => (prev - 1 < 0 ? Math.max(steps.length - 1, 0) : prev - 1))}
            disabled={steps.length === 0}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-600"
            onClick={() => setAutoPlay((prev) => !prev)}
            disabled={steps.length === 0}
          >
            {autoPlay ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-600"
            onClick={() => setStepIndex((prev) => (prev + 1 >= steps.length ? 0 : prev + 1))}
            disabled={steps.length === 0}
          >
            Next
          </button>
        </div>
      </header>

      {!regex ? <p className="text-sm text-slate-400">Enter a valid regex to inspect matching steps.</p> : null}
      {regex && steps.length === 0 ? <p className="text-sm text-slate-400">No debug steps available.</p> : null}

      {regex && steps.length > 0 && activeStep ? (
        <>
          <div className="mb-2 rounded-lg border border-slate-700 bg-slate-950/50 px-2 py-2 font-mono text-sm text-slate-100">
            {text.split('').map((char, idx) => {
              const inRange = activeStep.range ? idx >= activeStep.range[0] && idx < activeStep.range[1] : false;
              const atCursor = idx === activeStep.index;
              const classes = inRange
                ? 'bg-emerald-400/30 text-emerald-100'
                : atCursor
                  ? 'bg-amber-300/30 text-amber-100'
                  : '';

              return (
                <span key={`${idx}-${char}`} className={`rounded-sm transition ${classes}`}>
                  {char}
                </span>
              );
            })}
          </div>

          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
            <span>
              Step {stepIndex + 1}/{steps.length} at char {activeStep.index}
            </span>
            <span className={activeStep.success ? 'text-emerald-300' : 'text-rose-300'}>
              {activeStep.success ? 'match attempt success' : 'no match at cursor'}
            </span>
          </div>

          <div className="max-h-40 space-y-1 overflow-auto text-xs">
            {steps.slice(0, 30).map((step, idx) => (
              <div
                key={`${step.index}-${idx}`}
                className={`rounded px-2 py-1 ${
                  idx === stepIndex ? 'bg-slate-700 text-white' : 'bg-slate-800/70 text-slate-300'
                }`}
              >
                [{idx + 1}] idx {step.index} · {step.success ? `matched ${step.range?.[0]}-${step.range?.[1]}` : 'miss'} · “
                {step.excerpt}”
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

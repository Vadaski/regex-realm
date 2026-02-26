import { useMemo } from 'react';

type MatchHighlighterProps = {
  text: string;
  ranges: Array<[number, number]>;
  expectedMatch: boolean;
  actualMatch: boolean;
};

const statusClass = (expectedMatch: boolean, actualMatch: boolean) => {
  if (expectedMatch === actualMatch) {
    return 'border-emerald-400/60 bg-emerald-500/10';
  }
  return 'border-rose-400/60 bg-rose-500/10';
};

const tokenClass = (matched: boolean) =>
  matched
    ? 'rounded-sm bg-cyan-400/35 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.28)] transition-colors duration-300 ease-out'
    : 'text-slate-100 transition-colors duration-300 ease-out';

export function MatchHighlighter({ text, ranges, expectedMatch, actualMatch }: MatchHighlighterProps) {
  const chars = useMemo(() => {
    let cursor = 0;

    return Array.from(text).map((char, index) => {
      const start = cursor;
      const end = cursor + char.length;
      cursor = end;
      const matched = ranges.some(([rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart);
      return { char, index, matched };
    });
  }, [text, ranges]);

  return (
    <div className={`rounded-lg border p-2 transition-colors duration-300 ${statusClass(expectedMatch, actualMatch)}`}>
      <div className="mb-1 flex items-center gap-2 text-xs">
        <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-200">expected: {expectedMatch ? 'match' : 'no match'}</span>
        <span
          className={`rounded px-2 py-0.5 transition-colors duration-300 ${
            actualMatch ? 'bg-cyan-500/30 text-cyan-100' : 'bg-slate-700 text-slate-200'
          }`}
        >
          actual: {actualMatch ? 'match' : 'no match'}
        </span>
      </div>
      <code className="block whitespace-pre-wrap break-all rounded bg-slate-950/50 px-2 py-1 font-mono text-sm text-slate-100">
        {chars.length === 0 ? <span className="text-slate-500">(empty string)</span> : null}
        {chars.map((char) => (
          <span key={char.index} className={tokenClass(char.matched)}>
            {char.char}
          </span>
        ))}
      </code>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { customLevelToHash } from '../lib/share';
import { LevelDefinition, RegexCategory } from '../types';

type LevelEditorProps = {
  nextOrder: number;
  onCreate: (level: LevelDefinition) => void;
  onClose: () => void;
};

const categories: RegexCategory[] = [
  'literal',
  'character-class',
  'quantifier',
  'group',
  'lookaround',
  'backreference',
  'unicode',
  'anchor',
];

const parseSamples = (value: string) => {
  const rows = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const samples = rows.map((line) => {
    const prefix = line.charAt(0);
    const text = line.slice(1).trim();
    if (!['+', '-'].includes(prefix) || text.length === 0) {
      return null;
    }

    return {
      text,
      shouldMatch: prefix === '+',
    };
  });

  if (samples.some((sample) => sample === null)) {
    return null;
  }

  return samples.filter((sample): sample is { text: string; shouldMatch: boolean } => sample !== null);
};

export function LevelEditor({ nextOrder, onCreate, onClose }: LevelEditorProps) {
  const [title, setTitle] = useState('Custom Trial');
  const [objective, setObjective] = useState('Define your own regex challenge.');
  const [hint, setHint] = useState('Add concise hints for players.');
  const [tier, setTier] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [category, setCategory] = useState<RegexCategory>('group');
  const [starterPattern, setStarterPattern] = useState('');
  const [starterFlags, setStarterFlags] = useState('');
  const [tagsText, setTagsText] = useState('custom, community');
  const [sampleText, setSampleText] = useState('+ alpha42\n- ###\n+ beta99');
  const [notice, setNotice] = useState<string | null>(null);

  const parsedSamples = useMemo(() => parseSamples(sampleText), [sampleText]);

  const previewLevel = useMemo<LevelDefinition | null>(() => {
    if (!parsedSamples || parsedSamples.length < 2) {
      return null;
    }

    return {
      id: `custom-${Date.now()}`,
      order: nextOrder,
      tier,
      title: title.trim() || 'Custom Trial',
      objective: objective.trim() || 'Custom objective',
      hint: hint.trim() || 'No hint',
      category,
      starterPattern: starterPattern.trim(),
      starterFlags: starterFlags.trim(),
      samples: parsedSamples,
      tags: tagsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }, [parsedSamples, nextOrder, tier, title, objective, hint, category, starterPattern, starterFlags, tagsText]);

  const copyShareLink = async (level: LevelDefinition) => {
    const hash = customLevelToHash(level);
    const link = `${window.location.origin}${window.location.pathname}#${hash}`;

    window.history.replaceState({}, '', `#${hash}`);

    try {
      await navigator.clipboard.writeText(link);
      setNotice('Share link copied and hash updated.');
    } catch {
      setNotice('Hash updated. Copy the URL from your address bar.');
    }
  };

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Level Editor</h2>
          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-100 hover:bg-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-slate-300">Title</span>
              <input
                className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs text-slate-300">Objective</span>
              <textarea
                className="mt-1 min-h-16 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-xs text-slate-300">Hint</span>
              <textarea
                className="mt-1 min-h-16 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={hint}
                onChange={(event) => setHint(event.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="text-xs text-slate-300">Tier</span>
                <select
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={tier}
                  onChange={(event) => setTier(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      Tier {value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-xs text-slate-300">Category</span>
                <select
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as RegexCategory)}
                >
                  {categories.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="text-xs text-slate-300">Starter pattern</span>
                <input
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={starterPattern}
                  onChange={(event) => setStarterPattern(event.target.value)}
                />
              </label>
              <label>
                <span className="text-xs text-slate-300">Starter flags</span>
                <input
                  className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  value={starterFlags}
                  onChange={(event) => setStarterFlags(event.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-slate-300">Tags (comma separated)</span>
              <input
                className="mt-1 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-slate-300">Samples (+ should match, - should not match)</span>
              <textarea
                className="mt-1 min-h-56 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100"
                value={sampleText}
                onChange={(event) => setSampleText(event.target.value)}
              />
            </label>

            <p className="text-xs text-slate-400">
              Example format:
              <br />
              <code>+ order-42</code>
              <br />
              <code>- ###</code>
            </p>

            {parsedSamples ? (
              <div className="rounded border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                Parsed {parsedSamples.length} sample rows.
              </div>
            ) : (
              <div className="rounded border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                Invalid sample format. Each line must start with + or - followed by text.
              </div>
            )}

            {notice ? <div className="rounded bg-cyan-500/15 px-3 py-2 text-xs text-cyan-100">{notice}</div> : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => previewLevel && onCreate(previewLevel)}
                disabled={!previewLevel}
              >
                Save Level
              </button>
              <button
                type="button"
                className="rounded bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => previewLevel && copyShareLink(previewLevel)}
                disabled={!previewLevel}
              >
                Copy Share URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const sections = [
  {
    title: 'Character Classes',
    rows: [
      ['.', 'any char except newline'],
      ['[abc]', 'a, b, or c'],
      ['[^abc]', 'not a/b/c'],
      ['\\d / \\w / \\s', 'digit, word, whitespace'],
      ['\\p{L}', 'any unicode letter (use u flag)'],
    ],
  },
  {
    title: 'Quantifiers',
    rows: [
      ['*', '0 or more'],
      ['+', '1 or more'],
      ['?', '0 or 1'],
      ['{n}', 'exactly n'],
      ['{n,m}', 'between n and m'],
      ['*? +? ??', 'lazy variants'],
    ],
  },
  {
    title: 'Groups & Backreferences',
    rows: [
      ['(abc)', 'capturing group'],
      ['(?:abc)', 'non-capturing group'],
      ['(?<name>abc)', 'named group'],
      ['\\1', 'backreference to first group'],
      ['\\k<name>', 'backreference to named group'],
      ['a|b', 'alternation'],
    ],
  },
  {
    title: 'Lookarounds',
    rows: [
      ['x(?=y)', 'x followed by y'],
      ['x(?!y)', 'x not followed by y'],
      ['(?<=y)x', 'x preceded by y'],
      ['(?<!y)x', 'x not preceded by y'],
    ],
  },
  {
    title: 'Flags',
    rows: [
      ['g', 'global search'],
      ['i', 'ignore case'],
      ['m', 'multiline anchors'],
      ['s', 'dot matches newlines'],
      ['u', 'unicode mode'],
      ['y', 'sticky matching'],
    ],
  },
];

type CheatSheetModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CheatSheetModal({ open, onClose }: CheatSheetModalProps) {
  return (
    <section className={`fixed inset-0 z-50 flex justify-end ${open ? '' : 'pointer-events-none'}`}>
      <button
        type="button"
        aria-label="Close cheat sheet panel"
        className={`absolute inset-0 bg-slate-950/70 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`relative h-full w-full max-w-xl overflow-auto border-l border-slate-700 bg-slate-900/95 p-5 shadow-[-20px_0_60px_rgba(2,6,23,0.9)] backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="mb-4 flex items-center justify-between border-b border-slate-700 pb-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Regex Cheat Sheet</h2>
            <p className="text-sm text-slate-300">Slide this panel in anytime while solving a level.</p>
          </div>
          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-100 hover:bg-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="space-y-3">
          <article className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
            Tip: Start with anchors (`^`, `$`) and boundaries (`\b`) before adding complex groups.
          </article>

          <div className="grid gap-3 md:grid-cols-2">
            {sections.map((section) => (
              <article key={section.title} className="rounded-xl border border-slate-700 bg-slate-800/70 p-3">
                <h3 className="mb-2 text-sm font-semibold text-white">{section.title}</h3>
                <ul className="space-y-1 text-xs text-slate-200">
                  {section.rows.map(([token, description]) => (
                    <li key={token} className="grid grid-cols-[140px_1fr] gap-2">
                      <code className="rounded bg-slate-950/70 px-1 py-0.5 text-cyan-300">{token}</code>
                      <span>{description}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

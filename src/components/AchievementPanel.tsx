import { AchievementView } from '../types';

type AchievementPanelProps = {
  achievements: AchievementView[];
  onClose: () => void;
};

const formatDate = (value?: number) => {
  if (!value) {
    return 'locked';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
};

export function AchievementPanel({ achievements, onClose }: AchievementPanelProps) {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Achievements</h2>
          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-100 hover:bg-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => {
            const unlocked = Boolean(achievement.unlockedAt);
            return (
              <article
                key={achievement.id}
                className={`rounded-xl border p-3 ${
                  unlocked
                    ? 'border-emerald-400/60 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/70 text-slate-400'
                }`}
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span>{achievement.icon}</span>
                  <span>{achievement.title}</span>
                </h3>
                <p className="mt-1 text-xs">{achievement.description}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-300">{formatDate(achievement.unlockedAt)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

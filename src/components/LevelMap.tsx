import { LevelDefinition, TierDefinition } from '../types';

type LevelMapProps = {
  levels: LevelDefinition[];
  tiers: TierDefinition[];
  unlocked: Set<string>;
  solved: Set<string>;
  levelRatings: Record<string, number>;
  recentlyUnlockedLevelId: string | null;
  selectedLevelId: string;
  onSelect: (levelId: string) => void;
};

const levelBadgeClass = (isSolved: boolean, isUnlocked: boolean, isSelected: boolean, isRecentlyUnlocked: boolean) => {
  if (isSelected) {
    return 'ring-2 ring-cyan-300 bg-slate-700 text-white';
  }
  if (isRecentlyUnlocked) {
    return 'unlock-glow ring-2 ring-amber-300/80 bg-amber-400/20 text-amber-100';
  }
  if (isSolved) {
    return 'bg-emerald-500/30 border-emerald-300 text-emerald-100';
  }
  if (isUnlocked) {
    return 'bg-slate-700/70 border-slate-500 text-slate-100 hover:bg-slate-600';
  }
  return 'locked-tile bg-slate-900/50 border-slate-700 text-slate-500 cursor-not-allowed';
};

export function LevelMap({
  levels,
  tiers,
  unlocked,
  solved,
  levelRatings,
  recentlyUnlockedLevelId,
  selectedLevelId,
  onSelect,
}: LevelMapProps) {
  const grouped = tiers.map((tier) => ({
    tier,
    levels: levels.filter((level) => level.tier === tier.tier),
  }));

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 backdrop-blur-xl">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Realm Map</h2>
        <span className="text-xs text-slate-300">{levels.length} levels</span>
      </header>

      <div className="space-y-3">
        {grouped.map(({ tier, levels: tierLevels }) => (
          <article key={tier.tier} className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Tier {tier.tier}: {tier.name}</h3>
                <p className="text-xs text-slate-400">{tier.subtitle}</p>
              </div>
              <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${tier.accent}`} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {tierLevels.map((level) => {
                const isUnlocked = unlocked.has(level.id);
                const isSolved = solved.has(level.id);
                const isSelected = level.id === selectedLevelId;
                const isRecentlyUnlocked = recentlyUnlockedLevelId === level.id;
                const stars = levelRatings[level.id] ?? 0;
                return (
                  <button
                    key={level.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => onSelect(level.id)}
                    className={`rounded-lg border px-2 py-2 text-left text-xs transition ${levelBadgeClass(
                      isSolved,
                      isUnlocked,
                      isSelected,
                      isRecentlyUnlocked,
                    )}`}
                    title={level.title}
                  >
                    <div className="font-semibold">{level.order}</div>
                    <div className="truncate">{level.title}</div>
                    {isUnlocked ? (
                      <div className="mt-1 flex items-center gap-0.5 text-[10px] leading-none">
                        {[1, 2, 3].map((value) => (
                          <span key={value} className={value <= stars ? 'text-amber-300' : 'text-slate-600'}>
                            ★
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

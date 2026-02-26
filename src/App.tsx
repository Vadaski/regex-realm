import { useEffect, useMemo, useRef, useState } from 'react';
import { ACHIEVEMENTS } from './data/achievements';
import { CORE_LEVELS, FIRST_LEVEL_ID, TIERS, levelDifficulty } from './data/levels';
import { AchievementPanel } from './components/AchievementPanel';
import { CheatSheetModal } from './components/CheatSheetModal';
import { LevelEditor } from './components/LevelEditor';
import { LevelMap } from './components/LevelMap';
import { MatchHighlighter } from './components/MatchHighlighter';
import { RegexDebugger } from './components/RegexDebugger';
import { StateDiagramCanvas } from './components/StateDiagramCanvas';
import { customLevelFromHash } from './lib/share';
import { evaluateLevel, parseRegexInput, tokenizePattern } from './lib/regex';
import {
  createInitialState,
  loadGameState,
  saveGameState,
  unlockAchievement,
} from './lib/storage';
import { GameState, LevelDefinition } from './types';

const listToSet = (values: string[]) => new Set(values);

const dedupe = (values: string[]) => [...new Set(values)];

const tierAchievementMap: Record<2 | 3 | 4 | 5, string> = {
  2: 'apprentice-path',
  3: 'scholar-path',
  4: 'arcanist-path',
  5: 'ascendant-path',
};

const isNoBacktrackingPattern = (pattern: string) => !/(\.\*|\.\+|\.\{\d*,?\d*\})/.test(pattern);

const speedTargetForOrder = (order: number) => Math.max(18_000, 55_000 - order * 900);

const compactTargetForOrder = (order: number) => Math.max(6, 17 - Math.floor(order / 3));

const calculateStars = (
  order: number,
  elapsedMs: number,
  invalidAttemptsSinceSolve: number,
  patternLength: number,
) => {
  const cleanSolve = invalidAttemptsSinceSolve === 0;
  const fastSolve = elapsedMs <= speedTargetForOrder(order);
  const conciseSolve = patternLength > 0 && patternLength <= compactTargetForOrder(order);

  let stars = 1;
  if (cleanSolve) {
    stars += 1;
  }
  if (fastSolve || conciseSolve) {
    stars += 1;
  }

  return Math.min(3, stars);
};

type AchievementToast = {
  toastId: number;
  id: string;
  icon: string;
  title: string;
  description: string;
};

type SolveSummary = {
  levelId: string;
  stars: number;
  unlockedLevelId: string | null;
};

const withRulesApplied = (state: GameState, levels: LevelDefinition[]) => {
  let unlocked = state.unlockedAchievements;
  const unlock = (id: string) => {
    unlocked = unlockAchievement(unlocked, id);
  };

  const solvedSet = listToSet(state.solvedLevelIds);
  const unlockedSet = listToSet(state.unlockedLevelIds);
  const solvedLevels = levels.filter((level) => solvedSet.has(level.id));

  if (solvedLevels.length >= 1) {
    unlock('first-match');
  }

  ([2, 3, 4, 5] as const).forEach((tier) => {
    const reached = levels.some((level) => level.tier === tier && unlockedSet.has(level.id));
    if (reached) {
      unlock(tierAchievementMap[tier]);
    }
  });

  if (state.noBacktrackingWins >= 3) {
    unlock('no-backtracking');
  }

  if (state.shortRegexWins >= 5) {
    unlock('one-liner-master');
  }

  if (state.fastWins >= 3) {
    unlock('speed-runner');
  }

  if (state.solvedInSessionStreak >= 3) {
    unlock('streak-keeper');
  }

  if (solvedLevels.filter((level) => level.category === 'lookaround').length >= 3) {
    unlock('lookaround-wizard');
  }

  if (solvedLevels.filter((level) => level.category === 'backreference').length >= 3) {
    unlock('backreference-boss');
  }

  if (solvedLevels.filter((level) => level.category === 'unicode').length >= 3) {
    unlock('unicode-explorer');
  }

  if (solvedLevels.some((level) => level.id.startsWith('custom-'))) {
    unlock('custom-conqueror');
  }

  return {
    ...state,
    unlockedAchievements: unlocked,
  };
};

const buildCustomLevel = (draft: LevelDefinition, order: number): LevelDefinition => ({
  ...draft,
  id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  order,
});

const normalizeState = (state: GameState): GameState => {
  if (state.unlockedLevelIds.includes(FIRST_LEVEL_ID)) {
    return state;
  }

  return {
    ...state,
    unlockedLevelIds: [FIRST_LEVEL_ID, ...state.unlockedLevelIds],
  };
};

function App() {
  const [gameState, setGameState] = useState<GameState>(() => normalizeState(loadGameState()));
  const [selectedLevelId, setSelectedLevelId] = useState(FIRST_LEVEL_ID);
  const [patternInput, setPatternInput] = useState('');
  const [flagsInput, setFlagsInput] = useState('');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [successPulse, setSuccessPulse] = useState(0);
  const [recentlyUnlockedLevelId, setRecentlyUnlockedLevelId] = useState<string | null>(null);
  const [latestSolve, setLatestSolve] = useState<SolveSummary | null>(null);
  const [achievementToasts, setAchievementToasts] = useState<AchievementToast[]>([]);
  const [debugSampleIndex, setDebugSampleIndex] = useState(0);
  const [diagramPulse, setDiagramPulse] = useState(0);
  const levelStartRef = useRef(Date.now());
  const lastErrorRef = useRef<string | null>(null);
  const seenAchievementIdsRef = useRef(new Set(gameState.unlockedAchievements.map((item) => item.id)));

  const levels = useMemo(
    () => [...CORE_LEVELS, ...gameState.customLevels].sort((a, b) => a.order - b.order),
    [gameState.customLevels],
  );

  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels]);
  const unlocked = useMemo(() => listToSet(gameState.unlockedLevelIds), [gameState.unlockedLevelIds]);
  const solved = useMemo(() => listToSet(gameState.solvedLevelIds), [gameState.solvedLevelIds]);

  const selectedLevel = useMemo(
    () => levelById.get(selectedLevelId) ?? levels.find((level) => unlocked.has(level.id)) ?? levels[0],
    [levelById, levels, selectedLevelId, unlocked],
  );

  useEffect(() => {
    if (!selectedLevel) {
      return;
    }

    if (!levelById.has(selectedLevelId)) {
      setSelectedLevelId(selectedLevel.id);
    }
  }, [levelById, selectedLevel, selectedLevelId]);

  useEffect(() => {
    if (!selectedLevel) {
      return;
    }

    const savedInput = gameState.levelInputs[selectedLevel.id];
    setPatternInput(savedInput?.pattern ?? selectedLevel.starterPattern ?? '');
    setFlagsInput(savedInput?.flags ?? selectedLevel.starterFlags ?? '');
    setDebugSampleIndex(0);
    levelStartRef.current = Date.now();
  }, [selectedLevel?.id]);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    const consumeHashLevel = () => {
      const parsed = customLevelFromHash(window.location.hash);
      if (!parsed) {
        return;
      }

      setGameState((prev) => {
        const exists = prev.customLevels.some(
          (level) =>
            level.title === parsed.title &&
            JSON.stringify(level.samples) === JSON.stringify(parsed.samples) &&
            level.objective === parsed.objective,
        );

        if (exists) {
          return prev;
        }

        const order = [...CORE_LEVELS, ...prev.customLevels].reduce((max, level) => Math.max(max, level.order), 0) + 1;
        const customLevel = buildCustomLevel(parsed, order);

        const nextState: GameState = {
          ...prev,
          customLevels: [...prev.customLevels, customLevel],
          unlockedLevelIds: dedupe([...prev.unlockedLevelIds, customLevel.id]),
        };

        return withRulesApplied(nextState, [...CORE_LEVELS, ...nextState.customLevels]);
      });
    };

    consumeHashLevel();
    window.addEventListener('hashchange', consumeHashLevel);

    return () => window.removeEventListener('hashchange', consumeHashLevel);
  }, []);

  useEffect(() => {
    if (!selectedLevel) {
      return;
    }

    setGameState((prev) => {
      const current = prev.levelInputs[selectedLevel.id];
      if (current?.pattern === patternInput && current?.flags === flagsInput) {
        return prev;
      }

      return {
        ...prev,
        levelInputs: {
          ...prev.levelInputs,
          [selectedLevel.id]: { pattern: patternInput, flags: flagsInput },
        },
      };
    });
  }, [patternInput, flagsInput, selectedLevel?.id]);

  const parsedRegex = useMemo(() => parseRegexInput(patternInput, flagsInput), [patternInput, flagsInput]);

  const evaluation = useMemo(() => {
    if (!selectedLevel || !parsedRegex.regex) {
      return null;
    }

    return evaluateLevel(selectedLevel, parsedRegex.regex);
  }, [selectedLevel, parsedRegex.regex]);

  const activeSampleText = selectedLevel?.samples[debugSampleIndex]?.text ?? '';

  const activeTokenIndex = useMemo(() => {
    if (!parsedRegex.source) {
      return 0;
    }

    const tokenCount = Math.max(tokenizePattern(parsedRegex.source).length, 1);
    return diagramPulse % tokenCount;
  }, [diagramPulse, parsedRegex.source]);

  useEffect(() => {
    const hasInput = patternInput.trim().length > 0;
    if (!hasInput || !parsedRegex.error || parsedRegex.error === lastErrorRef.current) {
      lastErrorRef.current = parsedRegex.error;
      return;
    }

    setGameState((prev) => ({
      ...prev,
      invalidAttemptsSinceSolve: prev.invalidAttemptsSinceSolve + 1,
      solvedInSessionStreak: 0,
    }));

    lastErrorRef.current = parsedRegex.error;
  }, [parsedRegex.error, patternInput]);

  const achievementById = useMemo(
    () => new Map(ACHIEVEMENTS.map((achievement) => [achievement.id, achievement])),
    [],
  );

  useEffect(() => {
    const currentIds = new Set(gameState.unlockedAchievements.map((item) => item.id));
    const seenIds = seenAchievementIdsRef.current;

    if (currentIds.size < seenIds.size) {
      seenAchievementIdsRef.current = currentIds;
      return;
    }

    const freshUnlocks = gameState.unlockedAchievements.filter((item) => !seenIds.has(item.id));
    if (freshUnlocks.length === 0) {
      return;
    }

    const toasts: AchievementToast[] = [];
    freshUnlocks.forEach((item, index) => {
      seenIds.add(item.id);
      const achievement = achievementById.get(item.id);
      if (!achievement) {
        return;
      }

      toasts.push({
        toastId: Date.now() + index,
        id: achievement.id,
        icon: achievement.icon,
        title: achievement.title,
        description: achievement.description,
      });
    });

    if (toasts.length === 0) {
      return;
    }

    setAchievementToasts((prev) => [...prev, ...toasts].slice(-4));
    toasts.forEach((toast) => {
      window.setTimeout(() => {
        setAchievementToasts((prev) => prev.filter((item) => item.toastId !== toast.toastId));
      }, 4200);
    });
  }, [achievementById, gameState.unlockedAchievements]);

  useEffect(() => {
    if (!recentlyUnlockedLevelId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRecentlyUnlockedLevelId((value) => (value === recentlyUnlockedLevelId ? null : value));
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [recentlyUnlockedLevelId]);

  useEffect(() => {
    if (!latestSolve) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLatestSolve((value) => (value?.levelId === latestSolve.levelId ? null : value));
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [latestSolve]);

  useEffect(() => {
    if (!selectedLevel || !evaluation?.solved || !parsedRegex.regex) {
      return;
    }

    if (solved.has(selectedLevel.id)) {
      return;
    }

    const solvedLevelId = selectedLevel.id;
    const source = parsedRegex.source;
    const order = levels.map((level) => level.id);
    const elapsedMs = Date.now() - levelStartRef.current;
    const starsAwarded = calculateStars(
      selectedLevel.order,
      elapsedMs,
      gameState.invalidAttemptsSinceSolve,
      source.length,
    );
    const currentIndex = order.indexOf(solvedLevelId);
    const candidateUnlockedId =
      currentIndex >= 0 && currentIndex < order.length - 1 ? (order[currentIndex + 1] ?? null) : null;
    const justUnlockedLevelId =
      candidateUnlockedId && !unlocked.has(candidateUnlockedId) ? candidateUnlockedId : null;

    setGameState((prev) => {
      if (prev.solvedLevelIds.includes(solvedLevelId)) {
        return prev;
      }

      const solvedLevelIds = dedupe([...prev.solvedLevelIds, solvedLevelId]);
      const unlockedLevelIds = [...prev.unlockedLevelIds];
      const index = order.indexOf(solvedLevelId);

      if (index >= 0 && index < order.length - 1) {
        const nextLevelId = order[index + 1];
        if (nextLevelId) {
          unlockedLevelIds.push(nextLevelId);
        }
      }

      const streak = prev.invalidAttemptsSinceSolve === 0 ? prev.solvedInSessionStreak + 1 : 1;
      const noBacktrackingWin = isNoBacktrackingPattern(source);
      const shortWin = source.length > 0 && source.length <= 8;
      const fastWin = Date.now() - levelStartRef.current <= 20_000;

      const nextState: GameState = {
        ...prev,
        solvedLevelIds,
        unlockedLevelIds: dedupe(unlockedLevelIds),
        levelRatings: {
          ...prev.levelRatings,
          [solvedLevelId]: Math.max(prev.levelRatings[solvedLevelId] ?? 0, starsAwarded),
        },
        invalidAttemptsSinceSolve: 0,
        solvedInSessionStreak: streak,
        shortRegexWins: prev.shortRegexWins + (shortWin ? 1 : 0),
        noBacktrackingWins: prev.noBacktrackingWins + (noBacktrackingWin ? 1 : 0),
        fastWins: prev.fastWins + (fastWin ? 1 : 0),
      };

      return withRulesApplied(nextState, levels);
    });

    setLatestSolve({
      levelId: solvedLevelId,
      stars: starsAwarded,
      unlockedLevelId: justUnlockedLevelId,
    });
    setRecentlyUnlockedLevelId(justUnlockedLevelId);
    setSuccessPulse((value) => value + 1);
  }, [
    evaluation?.solved,
    gameState.invalidAttemptsSinceSolve,
    levels,
    parsedRegex.regex,
    parsedRegex.source,
    selectedLevel,
    solved,
    unlocked,
  ]);

  const achievementViews = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlockedAt: gameState.unlockedAchievements.find((item) => item.id === achievement.id)?.unlockedAt,
    }));
  }, [gameState.unlockedAchievements]);

  const solvedCount = gameState.solvedLevelIds.length;
  const unlockedCount = gameState.unlockedLevelIds.length;

  const nextLevelId = useMemo(() => {
    if (!selectedLevel) {
      return null;
    }

    const sortedIds = levels.map((level) => level.id);
    const index = sortedIds.indexOf(selectedLevel.id);
    if (index < 0 || index + 1 >= sortedIds.length) {
      return null;
    }

    return sortedIds[index + 1];
  }, [levels, selectedLevel]);

  const selectedLevelStars = selectedLevel ? (gameState.levelRatings[selectedLevel.id] ?? 0) : 0;
  const selectedDifficulty = selectedLevel ? levelDifficulty(selectedLevel.order) : 1;

  const onCreateLevel = (levelDraft: LevelDefinition) => {
    setGameState((prev) => {
      const order = [...CORE_LEVELS, ...prev.customLevels].reduce((max, level) => Math.max(max, level.order), 0) + 1;
      const customLevel = buildCustomLevel(levelDraft, order);

      const next: GameState = {
        ...prev,
        customLevels: [...prev.customLevels, customLevel],
        unlockedLevelIds: dedupe([...prev.unlockedLevelIds, customLevel.id]),
        unlockedAchievements: unlockAchievement(prev.unlockedAchievements, 'level-architect'),
      };

      setSelectedLevelId(customLevel.id);
      return withRulesApplied(next, [...CORE_LEVELS, ...next.customLevels]);
    });

    setShowEditor(false);
  };

  const resetProgress = () => {
    const initial = createInitialState();
    setGameState(initial);
    setSelectedLevelId(FIRST_LEVEL_ID);
    setPatternInput('');
    setFlagsInput('');
    setLatestSolve(null);
    setRecentlyUnlockedLevelId(null);
    setAchievementToasts([]);
    seenAchievementIdsRef.current = new Set();
  };

  if (!selectedLevel) {
    return <main className="min-h-screen bg-slate-950 p-6 text-slate-100">No levels available.</main>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#164e63_0%,_#020617_55%)] px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Regex Realm</h1>
              <p className="text-sm text-slate-300">Gamified regex learning with real-time visual debugging</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-800 px-3 py-1 text-xs text-slate-200">
                Solved {solvedCount}/{levels.length}
              </span>
              <span className="rounded bg-slate-800 px-3 py-1 text-xs text-slate-200">Unlocked {unlockedCount}</span>
              <button
                type="button"
                className="rounded bg-cyan-600 px-3 py-1 text-sm font-semibold text-white hover:bg-cyan-500"
                onClick={() => setShowCheatSheet((value) => !value)}
              >
                {showCheatSheet ? 'Hide Cheat Sheet' : 'Cheat Sheet'}
              </button>
              <button
                type="button"
                className="rounded bg-violet-600 px-3 py-1 text-sm font-semibold text-white hover:bg-violet-500"
                onClick={() => setShowEditor(true)}
              >
                Level Editor
              </button>
              <button
                type="button"
                className="rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-500"
                onClick={() => setShowAchievements(true)}
              >
                Achievements
              </button>
              <button
                type="button"
                className="rounded bg-slate-700 px-3 py-1 text-sm text-slate-100 hover:bg-slate-600"
                onClick={resetProgress}
              >
                Reset
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <LevelMap
            levels={levels}
            tiers={TIERS}
            unlocked={unlocked}
            solved={solved}
            levelRatings={gameState.levelRatings}
            recentlyUnlockedLevelId={recentlyUnlockedLevelId}
            selectedLevelId={selectedLevel.id}
            onSelect={(levelId) => setSelectedLevelId(levelId)}
          />

          <section className="space-y-4">
            <article className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 p-4 backdrop-blur-xl">
              {successPulse > 0 ? <div key={successPulse} className="success-wave" /> : null}

              <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-cyan-300">Tier {selectedLevel.tier}</p>
                  <h2 className="text-xl font-bold text-white">Level {selectedLevel.order}: {selectedLevel.title}</h2>
                  <p className="text-sm text-slate-300">{selectedLevel.objective}</p>
                  <p className="mt-1 text-xs text-slate-400">Hint: {selectedLevel.hint}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200">Difficulty {selectedDifficulty}/10</span>
                    <span className="rounded bg-slate-800 px-2 py-1 text-xs text-amber-200">
                      {[1, 2, 3].map((value) => (value <= selectedLevelStars ? '★' : '☆')).join('')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-200">{selectedLevel.category}</span>
                    {evaluation?.solved ? (
                      <span className="rounded bg-emerald-500/25 px-2 py-1 text-xs font-semibold text-emerald-200">Solved</span>
                    ) : (
                      <span className="rounded bg-amber-500/25 px-2 py-1 text-xs font-semibold text-amber-100">In Progress</span>
                    )}
                  </div>
                </div>
              </header>

              {latestSolve?.levelId === selectedLevel.id ? (
                <div className="mb-4 rounded-xl border border-amber-300/45 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  <div className="font-semibold">Level cleared: {'★'.repeat(latestSolve.stars)}</div>
                  <div className="text-xs text-amber-100/90">
                    {latestSolve.unlockedLevelId
                      ? `New level unlocked: ${latestSolve.unlockedLevelId}`
                      : 'Replay anytime to keep practicing speed and pattern clarity.'}
                  </div>
                </div>
              ) : null}

              <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-1 block text-xs text-slate-300">Regex Pattern</label>
                  <input
                    value={patternInput}
                    onChange={(event) => setPatternInput(event.target.value)}
                    placeholder={selectedLevel.starterPattern || 'Enter regex pattern'}
                    className="w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs text-slate-300">Flags</label>
                  <input
                    value={flagsInput}
                    onChange={(event) => setFlagsInput(event.target.value)}
                    placeholder={selectedLevel.starterFlags || 'gim'}
                    className="w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-cyan-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {parsedRegex.error ? (
                <p className="mb-3 rounded border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  Invalid regex: {parsedRegex.error}
                </p>
              ) : null}

              <div className="space-y-2">
                {selectedLevel.samples.map((sample, index) => {
                  const row = evaluation?.rows[index];
                  return (
                    <button
                      key={`${sample.text}-${index}`}
                      type="button"
                      onClick={() => setDebugSampleIndex(index)}
                      className={`w-full text-left transition ${
                        debugSampleIndex === index ? 'scale-[1.01]' : ''
                      }`}
                    >
                      <MatchHighlighter
                        text={sample.text}
                        expectedMatch={sample.shouldMatch}
                        actualMatch={row?.matched ?? false}
                        ranges={row?.ranges ?? []}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {evaluation?.solved ? (
                  <p className="rounded bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-200">
                    Success: this regex satisfies all challenge strings.
                  </p>
                ) : (
                  <p className="rounded bg-slate-800 px-3 py-1 text-sm text-slate-300">
                    Keep iterating. Matches update in real time.
                  </p>
                )}

                {nextLevelId && unlocked.has(nextLevelId) ? (
                  <button
                    type="button"
                    className="rounded bg-cyan-600 px-3 py-1 text-sm font-semibold text-white hover:bg-cyan-500"
                    onClick={() => setSelectedLevelId(nextLevelId)}
                  >
                    Next Level
                  </button>
                ) : null}
              </div>
            </article>

            <StateDiagramCanvas
              pattern={parsedRegex.source}
              flags={parsedRegex.flags}
              activeTokenIndex={activeTokenIndex}
            />

            <RegexDebugger
              regex={parsedRegex.regex}
              text={activeSampleText}
              onStepChange={(idx) => setDiagramPulse(idx)}
            />
          </section>
        </div>
      </div>

      <section className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(360px,calc(100%-2rem))] flex-col gap-2">
        {achievementToasts.map((toast) => (
          <article
            key={toast.toastId}
            className="toast-pop pointer-events-auto rounded-xl border border-amber-300/55 bg-slate-900/95 p-3 shadow-[0_10px_25px_rgba(2,6,23,0.55)]"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">{toast.icon}</span>
              <div>
                <p className="text-sm font-semibold text-amber-100">{toast.title}</p>
                <p className="text-xs text-slate-200">{toast.description}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <button
        type="button"
        className="fixed bottom-5 right-5 z-40 rounded-full border border-cyan-300/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_25px_rgba(14,116,144,0.35)] backdrop-blur transition hover:bg-cyan-500/35"
        onClick={() => setShowCheatSheet((value) => !value)}
      >
        {showCheatSheet ? 'Close Cheat Sheet' : 'Regex Cheat Sheet'}
      </button>

      {showAchievements ? (
        <AchievementPanel achievements={achievementViews} onClose={() => setShowAchievements(false)} />
      ) : null}
      <CheatSheetModal open={showCheatSheet} onClose={() => setShowCheatSheet(false)} />
      {showEditor ? (
        <LevelEditor
          nextOrder={levels.reduce((max, level) => Math.max(max, level.order), 0) + 1}
          onCreate={onCreateLevel}
          onClose={() => setShowEditor(false)}
        />
      ) : null}
    </main>
  );
}

export default App;

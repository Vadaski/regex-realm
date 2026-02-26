import { FIRST_LEVEL_ID } from '../data/levels';
import { GameState, LevelDefinition, UnlockRecord } from '../types';

const STORAGE_KEY = 'regex-realm-state-v1';

const now = () => Date.now();

const uniqueById = (records: UnlockRecord[]) => {
  const map = new Map<string, UnlockRecord>();
  records.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return [...map.values()];
};

export const createInitialState = (): GameState => ({
  unlockedLevelIds: [FIRST_LEVEL_ID],
  solvedLevelIds: [],
  levelRatings: {},
  levelInputs: {},
  unlockedAchievements: [],
  customLevels: [],
  invalidAttemptsSinceSolve: 0,
  solvedInSessionStreak: 0,
  shortRegexWins: 0,
  noBacktrackingWins: 0,
  fastWins: 0,
});

const toCustomLevels = (value: unknown): LevelDefinition[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is LevelDefinition => {
      const candidate = item as Partial<LevelDefinition>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.order === 'number' &&
        typeof candidate.tier === 'number' &&
        typeof candidate.title === 'string' &&
        typeof candidate.objective === 'string' &&
        typeof candidate.hint === 'string' &&
        typeof candidate.category === 'string' &&
        Array.isArray(candidate.samples) &&
        Array.isArray(candidate.tags)
      );
    })
    .map((level) => ({
      ...level,
      samples: level.samples.filter((sample) => typeof sample.text === 'string' && typeof sample.shouldMatch === 'boolean'),
      tags: level.tags.filter((tag) => typeof tag === 'string'),
    }));
};

export const loadGameState = (): GameState => {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;

    return {
      unlockedLevelIds: Array.isArray(parsed.unlockedLevelIds)
        ? parsed.unlockedLevelIds.filter((id): id is string => typeof id === 'string')
        : [FIRST_LEVEL_ID],
      solvedLevelIds: Array.isArray(parsed.solvedLevelIds)
        ? parsed.solvedLevelIds.filter((id): id is string => typeof id === 'string')
        : [],
      levelRatings:
        typeof parsed.levelRatings === 'object' && parsed.levelRatings
          ? Object.fromEntries(
              Object.entries(parsed.levelRatings).filter(
                ([levelId, stars]) =>
                  typeof levelId === 'string' &&
                  typeof stars === 'number' &&
                  Number.isFinite(stars) &&
                  stars >= 1 &&
                  stars <= 3,
              ),
            )
          : {},
      levelInputs: typeof parsed.levelInputs === 'object' && parsed.levelInputs
        ? Object.fromEntries(
            Object.entries(parsed.levelInputs).filter(
              ([levelId, payload]) =>
                typeof levelId === 'string' &&
                payload !== null &&
                typeof payload === 'object' &&
                typeof (payload as { pattern?: unknown }).pattern === 'string' &&
                typeof (payload as { flags?: unknown }).flags === 'string',
            ),
          ) as GameState['levelInputs']
        : {},
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? uniqueById(
            parsed.unlockedAchievements.filter(
              (item): item is UnlockRecord =>
                typeof item?.id === 'string' && typeof item?.unlockedAt === 'number',
            ),
          )
        : [],
      customLevels: toCustomLevels(parsed.customLevels),
      invalidAttemptsSinceSolve:
        typeof parsed.invalidAttemptsSinceSolve === 'number' ? parsed.invalidAttemptsSinceSolve : 0,
      solvedInSessionStreak: typeof parsed.solvedInSessionStreak === 'number' ? parsed.solvedInSessionStreak : 0,
      shortRegexWins: typeof parsed.shortRegexWins === 'number' ? parsed.shortRegexWins : 0,
      noBacktrackingWins: typeof parsed.noBacktrackingWins === 'number' ? parsed.noBacktrackingWins : 0,
      fastWins: typeof parsed.fastWins === 'number' ? parsed.fastWins : 0,
    };
  } catch {
    return createInitialState();
  }
};

export const saveGameState = (state: GameState) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const resetGameState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export const unlockAchievement = (achievements: UnlockRecord[], id: string): UnlockRecord[] => {
  if (achievements.some((item) => item.id === id)) {
    return achievements;
  }

  return [...achievements, { id, unlockedAt: now() }];
};

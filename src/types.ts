export type RegexTier = 1 | 2 | 3 | 4 | 5;

export type RegexCategory =
  | 'literal'
  | 'character-class'
  | 'quantifier'
  | 'group'
  | 'lookaround'
  | 'backreference'
  | 'unicode'
  | 'anchor';

export interface LevelSample {
  text: string;
  shouldMatch: boolean;
  note?: string;
}

export interface LevelDefinition {
  id: string;
  order: number;
  tier: RegexTier;
  title: string;
  objective: string;
  hint: string;
  category: RegexCategory;
  starterPattern?: string;
  starterFlags?: string;
  samples: LevelSample[];
  tags: string[];
}

export interface TierDefinition {
  tier: RegexTier;
  name: string;
  subtitle: string;
  accent: string;
}

export interface LevelInputState {
  pattern: string;
  flags: string;
}

export interface UnlockRecord {
  id: string;
  unlockedAt: number;
}

export interface GameState {
  unlockedLevelIds: string[];
  solvedLevelIds: string[];
  levelRatings: Record<string, number>;
  levelInputs: Record<string, LevelInputState>;
  unlockedAchievements: UnlockRecord[];
  customLevels: LevelDefinition[];
  invalidAttemptsSinceSolve: number;
  solvedInSessionStreak: number;
  shortRegexWins: number;
  noBacktrackingWins: number;
  fastWins: number;
}

export interface AchievementDefinition {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AchievementView extends AchievementDefinition {
  unlockedAt?: number;
}

export interface SampleEvaluation {
  sample: LevelSample;
  matched: boolean;
  correct: boolean;
  ranges: Array<[number, number]>;
}

export interface LevelEvaluation {
  solved: boolean;
  rows: SampleEvaluation[];
}

export interface RegexParseResult {
  regex: RegExp | null;
  source: string;
  flags: string;
  error: string | null;
}

export interface DebugStep {
  index: number;
  success: boolean;
  range: [number, number] | null;
  excerpt: string;
}

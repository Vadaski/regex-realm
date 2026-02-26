import { AchievementDefinition } from '../types';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-match',
    icon: '🎯',
    title: 'First Match',
    description: 'Solve your first level.',
  },
  {
    id: 'apprentice-path',
    icon: '🗺️',
    title: 'Tier Unlocked: Seeker',
    description: 'Unlock tier 2.',
  },
  {
    id: 'scholar-path',
    icon: '📘',
    title: 'Tier Unlocked: Scholar',
    description: 'Unlock tier 3.',
  },
  {
    id: 'arcanist-path',
    icon: '🧪',
    title: 'Tier Unlocked: Arcanist',
    description: 'Unlock tier 4.',
  },
  {
    id: 'ascendant-path',
    icon: '👑',
    title: 'Tier Unlocked: Ascendant',
    description: 'Unlock tier 5.',
  },
  {
    id: 'no-backtracking',
    icon: '🛡️',
    title: 'No Backtracking',
    description: 'Win 3 levels without using dot-star patterns.',
  },
  {
    id: 'one-liner-master',
    icon: '✍️',
    title: 'One-liner Master',
    description: 'Win 5 levels with pattern length <= 8.',
  },
  {
    id: 'speed-runner',
    icon: '⚡',
    title: 'Speed Runner',
    description: 'Clear 3 levels in under 20 seconds each.',
  },
  {
    id: 'lookaround-wizard',
    icon: '🔮',
    title: 'Lookaround Wizard',
    description: 'Solve 3 lookaround levels.',
  },
  {
    id: 'backreference-boss',
    icon: '🧷',
    title: 'Backreference Boss',
    description: 'Solve 3 backreference levels.',
  },
  {
    id: 'unicode-explorer',
    icon: '🌍',
    title: 'Unicode Explorer',
    description: 'Solve 3 unicode levels.',
  },
  {
    id: 'streak-keeper',
    icon: '🔥',
    title: 'Streak Keeper',
    description: 'Solve 3 levels in a row without invalid regex errors.',
  },
  {
    id: 'level-architect',
    icon: '🧱',
    title: 'Level Architect',
    description: 'Create a custom level in the editor.',
  },
  {
    id: 'custom-conqueror',
    icon: '🚀',
    title: 'Custom Conqueror',
    description: 'Solve a custom community level.',
  },
];

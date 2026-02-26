import { LevelDefinition, TierDefinition } from '../types';

export const TIERS: TierDefinition[] = [
  { tier: 1, name: 'Sprout', subtitle: 'Literal and anchors', accent: 'from-emerald-400 to-teal-400' },
  { tier: 2, name: 'Seeker', subtitle: 'Classes and quantifiers', accent: 'from-cyan-400 to-sky-500' },
  { tier: 3, name: 'Scholar', subtitle: 'Groups and alternation', accent: 'from-indigo-400 to-blue-500' },
  { tier: 4, name: 'Arcanist', subtitle: 'Lookarounds and backrefs', accent: 'from-fuchsia-400 to-pink-500' },
  { tier: 5, name: 'Ascendant', subtitle: 'Unicode and advanced flow', accent: 'from-amber-400 to-orange-500' },
];

export const CORE_LEVELS: LevelDefinition[] = [
  {
    id: 'sprout-01',
    order: 1,
    tier: 1,
    title: 'Literal Spark',
    objective: 'Match the word "cat" anywhere in the string.',
    hint: 'Start with the simplest possible literal.',
    category: 'literal',
    starterPattern: 'cat',
    samples: [
      { text: 'cat', shouldMatch: true },
      { text: 'concatenate', shouldMatch: true },
      { text: 'dog', shouldMatch: false },
    ],
    tags: ['literal'],
  },
  {
    id: 'sprout-02',
    order: 2,
    tier: 1,
    title: 'Start Sentinel',
    objective: 'Match "hello" only when it appears at the beginning.',
    hint: 'Use the start anchor.',
    category: 'anchor',
    starterPattern: '^hello',
    samples: [
      { text: 'hello there', shouldMatch: true },
      { text: 'well hello', shouldMatch: false },
      { text: 'hello', shouldMatch: true },
    ],
    tags: ['anchor'],
  },
  {
    id: 'sprout-03',
    order: 3,
    tier: 1,
    title: 'End Sentinel',
    objective: 'Match "world" only at the end of the string.',
    hint: 'Use the end anchor.',
    category: 'anchor',
    starterPattern: 'world$',
    samples: [
      { text: 'hello world', shouldMatch: true },
      { text: 'worldwide', shouldMatch: false },
      { text: 'my world', shouldMatch: true },
    ],
    tags: ['anchor'],
  },
  {
    id: 'sprout-04',
    order: 4,
    tier: 1,
    title: 'Dot Hopper',
    objective: 'Match three-letter words shaped like c?t.',
    hint: 'Dot matches any single character except line breaks.',
    category: 'literal',
    starterPattern: 'c.t',
    samples: [
      { text: 'cat', shouldMatch: true },
      { text: 'cot', shouldMatch: true },
      { text: 'cart', shouldMatch: false },
    ],
    tags: ['dot'],
  },
  {
    id: 'sprout-05',
    order: 5,
    tier: 1,
    title: 'Vowel Radar',
    objective: 'Match any vowel character.',
    hint: 'Use a character class.',
    category: 'character-class',
    starterPattern: '[aeiou]',
    samples: [
      { text: 'sky', shouldMatch: false },
      { text: 'apple', shouldMatch: true },
      { text: 'rhythm', shouldMatch: false },
    ],
    tags: ['class'],
  },
  {
    id: 'sprout-06',
    order: 6,
    tier: 1,
    title: 'Digit Beacon',
    objective: 'Match one or more digits.',
    hint: 'Use \\d with a quantifier.',
    category: 'quantifier',
    starterPattern: '\\d+',
    samples: [
      { text: 'Room 42', shouldMatch: true },
      { text: 'No digits', shouldMatch: false },
      { text: '007', shouldMatch: true },
    ],
    tags: ['digit', 'quantifier'],
  },
  {
    id: 'seeker-07',
    order: 7,
    tier: 2,
    title: 'Optional Armour',
    objective: 'Match both "color" and "colour".',
    hint: 'Use ? for optional letters.',
    category: 'quantifier',
    starterPattern: 'colou?r',
    samples: [
      { text: 'color', shouldMatch: true },
      { text: 'colour', shouldMatch: true },
      { text: 'colouur', shouldMatch: false },
    ],
    tags: ['optional'],
  },
  {
    id: 'seeker-08',
    order: 8,
    tier: 2,
    title: 'Triple Key',
    objective: 'Match exactly three lowercase letters.',
    hint: 'Use {3}.',
    category: 'quantifier',
    starterPattern: '^[a-z]{3}$',
    samples: [
      { text: 'abc', shouldMatch: true },
      { text: 'ab', shouldMatch: false },
      { text: 'abcd', shouldMatch: false },
    ],
    tags: ['range', 'quantifier'],
  },
  {
    id: 'seeker-09',
    order: 9,
    tier: 2,
    title: 'Access Code',
    objective: 'Match codes like AB12 (2 uppercase letters + 2 digits).',
    hint: 'Combine classes with exact counts.',
    category: 'character-class',
    starterPattern: '^[A-Z]{2}\\d{2}$',
    samples: [
      { text: 'AB12', shouldMatch: true },
      { text: 'ab12', shouldMatch: false },
      { text: 'ABC1', shouldMatch: false },
    ],
    tags: ['class', 'quantifier'],
  },
  {
    id: 'seeker-10',
    order: 10,
    tier: 2,
    title: 'Word Boundary Runes',
    objective: 'Match whole words that are exactly 4 letters.',
    hint: 'Use \\b and \\w with a fixed quantifier.',
    category: 'anchor',
    starterPattern: '\\b\\w{4}\\b',
    samples: [
      { text: 'blue', shouldMatch: true },
      { text: 'blues', shouldMatch: false },
      { text: 'go to mars', shouldMatch: true },
    ],
    tags: ['boundary'],
  },
  {
    id: 'seeker-11',
    order: 11,
    tier: 2,
    title: 'Consonant Core',
    objective: 'Match strings made only of consonants (no spaces).',
    hint: 'Negated classes are useful.',
    category: 'character-class',
    starterPattern: '^[^aeiou\\s]+$',
    samples: [
      { text: 'rhythm', shouldMatch: true },
      { text: 'team', shouldMatch: false },
      { text: 'sky', shouldMatch: true },
    ],
    tags: ['negated-class'],
  },
  {
    id: 'seeker-12',
    order: 12,
    tier: 2,
    title: 'Whitespace Pulse',
    objective: 'Match one or more whitespace characters.',
    hint: 'Use \\s+ to consume runs of spaces/tabs/newlines.',
    category: 'quantifier',
    starterPattern: '\\s+',
    samples: [
      { text: 'a b', shouldMatch: true },
      { text: 'tabs\tand spaces', shouldMatch: true },
      { text: 'nospace', shouldMatch: false },
    ],
    tags: ['whitespace'],
  },
  {
    id: 'scholar-13',
    order: 13,
    tier: 3,
    title: 'Creature Choice',
    objective: 'Match either cat or dog.',
    hint: 'Alternation uses | inside groups.',
    category: 'group',
    starterPattern: '^(cat|dog)$',
    samples: [
      { text: 'cat', shouldMatch: true },
      { text: 'dog', shouldMatch: true },
      { text: 'cow', shouldMatch: false },
    ],
    tags: ['alternation'],
  },
  {
    id: 'scholar-14',
    order: 14,
    tier: 3,
    title: 'Decision Engine',
    objective: 'Match exactly yes, no, or maybe.',
    hint: 'Anchor the expression around your group.',
    category: 'group',
    starterPattern: '^(yes|no|maybe)$',
    samples: [
      { text: 'yes', shouldMatch: true },
      { text: 'no', shouldMatch: true },
      { text: 'not sure', shouldMatch: false },
    ],
    tags: ['alternation', 'anchors'],
  },
  {
    id: 'scholar-15',
    order: 15,
    tier: 3,
    title: 'Date Sigil',
    objective: 'Match dates in DD/MM/YYYY format.',
    hint: 'Use grouped numeric chunks.',
    category: 'group',
    starterPattern: '^(\\d{2})/(\\d{2})/(\\d{4})$',
    samples: [
      { text: '31/12/2025', shouldMatch: true },
      { text: '1/12/2025', shouldMatch: false },
      { text: '31-12-2025', shouldMatch: false },
    ],
    tags: ['capture-group'],
  },
  {
    id: 'scholar-16',
    order: 16,
    tier: 3,
    title: 'Laugh Loop',
    objective: 'Match exactly three repeats of "ha".',
    hint: 'A non-capturing group keeps the pattern clean.',
    category: 'group',
    starterPattern: '^(?:ha){3}$',
    samples: [
      { text: 'hahaha', shouldMatch: true },
      { text: 'haha', shouldMatch: false },
      { text: 'hahahaha', shouldMatch: false },
    ],
    tags: ['non-capturing-group'],
  },
  {
    id: 'scholar-17',
    order: 17,
    tier: 3,
    title: 'Honorific Parser',
    objective: 'Match titles like "Dr. Ada" or "Ms. Lin".',
    hint: 'Group the valid titles and follow with a name.',
    category: 'group',
    starterPattern: '^(Mr|Ms|Dr)\\.\\s[A-Z][a-z]+$',
    samples: [
      { text: 'Dr. Ada', shouldMatch: true },
      { text: 'Mx. Ada', shouldMatch: false },
      { text: 'Ms Lin', shouldMatch: false },
    ],
    tags: ['group', 'class'],
  },
  {
    id: 'scholar-18',
    order: 18,
    tier: 3,
    title: 'Named Channel',
    objective: 'Match phone fragments like 415-7788 using named groups.',
    hint: 'JavaScript supports (?<name>...).',
    category: 'group',
    starterPattern: '^(?<area>\\d{3})-(?<line>\\d{4})$',
    samples: [
      { text: '415-7788', shouldMatch: true },
      { text: '41-7788', shouldMatch: false },
      { text: '4157788', shouldMatch: false },
    ],
    tags: ['named-group'],
  },
  {
    id: 'arcanist-19',
    order: 19,
    tier: 4,
    title: 'Colon Oracle',
    objective: 'Match the word immediately before a colon.',
    hint: 'Positive lookahead keeps the colon out of the match.',
    category: 'lookaround',
    starterPattern: '\\w+(?=:)',
    samples: [
      { text: 'token:123', shouldMatch: true },
      { text: 'token-123', shouldMatch: false },
      { text: 'id:value', shouldMatch: true },
    ],
    tags: ['lookahead'],
  },
  {
    id: 'arcanist-20',
    order: 20,
    tier: 4,
    title: 'Forbidden Tail',
    objective: 'Match "foo" only when it is not followed by "bar".',
    hint: 'Negative lookahead is your shield.',
    category: 'lookaround',
    starterPattern: 'foo(?!bar)',
    samples: [
      { text: 'foozap', shouldMatch: true },
      { text: 'foobar', shouldMatch: false },
      { text: 'xfoo', shouldMatch: true },
    ],
    tags: ['negative-lookahead'],
  },
  {
    id: 'arcanist-21',
    order: 21,
    tier: 4,
    title: 'Hash Reveal',
    objective: 'Match words that come right after #.',
    hint: 'Use positive lookbehind.',
    category: 'lookaround',
    starterPattern: '(?<=#)\\w+',
    samples: [
      { text: '#release', shouldMatch: true },
      { text: 'release', shouldMatch: false },
      { text: 'tag #v2', shouldMatch: true },
    ],
    tags: ['lookbehind'],
  },
  {
    id: 'arcanist-22',
    order: 22,
    tier: 4,
    title: 'Free Price Filter',
    objective: 'Match numbers not immediately prefixed with $.',
    hint: 'Negative lookbehind can exclude currency values.',
    category: 'lookaround',
    starterPattern: '(?<!\\$)\\b\\d+\\b',
    samples: [
      { text: 'count 42', shouldMatch: true },
      { text: 'price $42', shouldMatch: false },
      { text: '42 and $5', shouldMatch: true },
    ],
    tags: ['negative-lookbehind'],
  },
  {
    id: 'arcanist-23',
    order: 23,
    tier: 4,
    title: 'Echo Word',
    objective: 'Match duplicated consecutive words.',
    hint: 'Capture once, then reuse with \\1.',
    category: 'backreference',
    starterPattern: '\\b(\\w+)\\s+\\1\\b',
    samples: [
      { text: 'go go now', shouldMatch: true },
      { text: 'go now', shouldMatch: false },
      { text: 'yes yes', shouldMatch: true },
    ],
    tags: ['backreference'],
  },
  {
    id: 'arcanist-24',
    order: 24,
    tier: 4,
    title: 'Balanced Tag',
    objective: 'Match simple opening/closing tags with same name.',
    hint: 'Backreference the tag name in the closing token.',
    category: 'backreference',
    starterPattern: '^<(\\w+)>[^<]+</\\1>$',
    samples: [
      { text: '<b>bold</b>', shouldMatch: true },
      { text: '<b>bold</i>', shouldMatch: false },
      { text: '<tag>x</tag>', shouldMatch: true },
    ],
    tags: ['backreference', 'group'],
  },
  {
    id: 'arcanist-25',
    order: 25,
    tier: 4,
    title: 'Admin Key',
    objective: 'Match passwords with at least one uppercase and one digit, length >= 6.',
    hint: 'Combine multiple lookaheads, then validate the whole string.',
    category: 'lookaround',
    starterPattern: '^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{6,}$',
    samples: [
      { text: 'Alpha9', shouldMatch: true },
      { text: 'alpha9', shouldMatch: false },
      { text: 'ALPHA', shouldMatch: false },
    ],
    tags: ['lookahead', 'quantifier'],
  },
  {
    id: 'ascendant-26',
    order: 26,
    tier: 5,
    title: 'Letter Universe',
    objective: 'Match strings containing only unicode letters.',
    hint: 'Use \\p{L} with the u flag.',
    category: 'unicode',
    starterPattern: '^\\p{L}+$',
    starterFlags: 'u',
    samples: [
      { text: 'Cafe', shouldMatch: true },
      { text: '東京', shouldMatch: true },
      { text: 'abc123', shouldMatch: false },
    ],
    tags: ['unicode-property'],
  },
  {
    id: 'ascendant-27',
    order: 27,
    tier: 5,
    title: 'Han Script Gate',
    objective: 'Match text made only of Han script characters.',
    hint: 'Try \\p{Script=Han} with u.',
    category: 'unicode',
    starterPattern: '^\\p{Script=Han}+$',
    starterFlags: 'u',
    samples: [
      { text: '漢字', shouldMatch: true },
      { text: '東京A', shouldMatch: false },
      { text: 'Kanaかな', shouldMatch: false },
    ],
    tags: ['unicode-script'],
  },
  {
    id: 'ascendant-28',
    order: 28,
    tier: 5,
    title: 'Emoji Pulse',
    objective: 'Detect at least one emoji in a string.',
    hint: 'Use unicode property escapes for pictographs.',
    category: 'unicode',
    starterPattern: '\\p{Extended_Pictographic}',
    starterFlags: 'u',
    samples: [
      { text: 'Ship it 🚀', shouldMatch: true },
      { text: 'No emoji here', shouldMatch: false },
      { text: '🔥fire', shouldMatch: true },
    ],
    tags: ['emoji', 'unicode'],
  },
  {
    id: 'ascendant-29',
    order: 29,
    tier: 5,
    title: 'Currency Glyph',
    objective: 'Match currency symbol followed by digits.',
    hint: 'Use \\p{Sc} for unicode currency symbols.',
    category: 'unicode',
    starterPattern: '^\\p{Sc}\\d+$',
    starterFlags: 'u',
    samples: [
      { text: '$99', shouldMatch: true },
      { text: '€150', shouldMatch: true },
      { text: 'USD100', shouldMatch: false },
    ],
    tags: ['unicode-currency'],
  },
  {
    id: 'ascendant-30',
    order: 30,
    tier: 5,
    title: 'Error Scanner',
    objective: 'Match lines that start with ERROR: in a multiline log.',
    hint: 'Anchors + m flag allow per-line matching.',
    category: 'anchor',
    starterPattern: '^ERROR:.*$',
    starterFlags: 'm',
    samples: [
      { text: 'INFO: ok\nERROR: failed\nWARN: retry', shouldMatch: true },
      { text: 'INFO: ok\nWARN: retry', shouldMatch: false },
      { text: 'ERROR: single line', shouldMatch: true },
    ],
    tags: ['multiline'],
  },
  {
    id: 'ascendant-31',
    order: 31,
    tier: 5,
    title: 'Mirror Link',
    objective: 'Match repeated word joined by - or _, using named backreference.',
    hint: 'Capture word and separator, then reference the named word.',
    category: 'backreference',
    starterPattern: '^(?<word>\\w+)([-_])\\k<word>$',
    samples: [
      { text: 'echo-echo', shouldMatch: true },
      { text: 'echo_echo', shouldMatch: true },
      { text: 'echo-echoo', shouldMatch: false },
    ],
    tags: ['named-backreference'],
  },
  {
    id: 'ascendant-32',
    order: 32,
    tier: 5,
    title: 'Role Extractor',
    objective: 'Match username in query fragments like user=neo&role=admin only for admins.',
    hint: 'Lookbehind + lookahead can isolate exactly the desired segment.',
    category: 'lookaround',
    starterPattern: '(?<=\\buser=)\\w+(?=&role=admin\\b)',
    samples: [
      { text: 'user=neo&role=admin', shouldMatch: true },
      { text: 'user=neo&role=guest', shouldMatch: false },
      { text: 'x=1&user=trinity&role=admin&y=2', shouldMatch: true },
    ],
    tags: ['lookbehind', 'lookahead'],
  },
];

export const FIRST_LEVEL_ID = CORE_LEVELS[0]!.id;

export const levelDifficulty = (order: number) => Math.min(10, Math.max(1, Math.ceil(order / 4)));

const starterRegexForValidation = (level: LevelDefinition) => {
  if (!level.starterPattern || level.starterPattern.trim().length === 0) {
    throw new Error(`Level ${level.id} is missing a starterPattern.`);
  }

  const safeFlags = (level.starterFlags ?? '').replace(/[gy]/g, '');
  return new RegExp(level.starterPattern, safeFlags);
};

const validateCoreLevels = () => {
  if (CORE_LEVELS.length < 30) {
    throw new Error(`Expected at least 30 core levels, found ${CORE_LEVELS.length}.`);
  }

  const ordered = [...CORE_LEVELS].sort((a, b) => a.order - b.order);
  let previousDifficulty = 0;

  ordered.forEach((level, index) => {
    const expectedOrder = index + 1;
    if (level.order !== expectedOrder) {
      throw new Error(`Level order gap detected at ${level.id}. Expected order ${expectedOrder}.`);
    }

    if (level.objective.trim().length < 10 || level.hint.trim().length < 6) {
      throw new Error(`Level ${level.id} must include a clear objective and hint.`);
    }

    if (level.samples.length < 3) {
      throw new Error(`Level ${level.id} must have at least 3 samples.`);
    }

    const hasMatchSample = level.samples.some((sample) => sample.shouldMatch);
    const hasNoMatchSample = level.samples.some((sample) => !sample.shouldMatch);
    if (!hasMatchSample || !hasNoMatchSample) {
      throw new Error(`Level ${level.id} must include positive and negative samples.`);
    }

    const regex = starterRegexForValidation(level);
    level.samples.forEach((sample) => {
      const matched = regex.test(sample.text);
      regex.lastIndex = 0;
      if (matched !== sample.shouldMatch) {
        throw new Error(`Starter regex for ${level.id} fails sample "${sample.text}".`);
      }
    });

    const difficulty = levelDifficulty(level.order);
    if (difficulty < previousDifficulty) {
      throw new Error(`Difficulty curve regressed at ${level.id}.`);
    }
    previousDifficulty = difficulty;
  });
};

validateCoreLevels();

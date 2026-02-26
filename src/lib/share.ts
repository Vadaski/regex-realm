import { LevelDefinition, RegexCategory } from '../types';

const HASH_KEY = 'custom';

const encodeBase64Url = (value: string) =>
  btoa(unescape(encodeURIComponent(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return decodeURIComponent(escape(atob(padded)));
};

const normalizeCategory = (value: string): RegexCategory => {
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

  return categories.includes(value as RegexCategory) ? (value as RegexCategory) : 'literal';
};

const isValidCustomLevel = (payload: unknown): payload is LevelDefinition => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Partial<LevelDefinition>;
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
};

export const customLevelToHash = (level: LevelDefinition): string => {
  const payload = {
    ...level,
    category: normalizeCategory(level.category),
  };

  return `${HASH_KEY}=${encodeBase64Url(JSON.stringify(payload))}`;
};

export const customLevelFromHash = (hash: string): LevelDefinition | null => {
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  const encoded = params.get(HASH_KEY);

  if (!encoded) {
    return null;
  }

  try {
    const raw = decodeBase64Url(encoded);
    const parsed = JSON.parse(raw);
    if (!isValidCustomLevel(parsed)) {
      return null;
    }

    return {
      ...parsed,
      category: normalizeCategory(parsed.category),
      tags: parsed.tags.filter((tag) => typeof tag === 'string'),
      samples: parsed.samples.filter(
        (sample) => typeof sample.text === 'string' && typeof sample.shouldMatch === 'boolean',
      ),
    };
  } catch {
    return null;
  }
};

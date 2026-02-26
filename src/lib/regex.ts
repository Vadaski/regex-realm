import { DebugStep, LevelDefinition, LevelEvaluation, RegexParseResult } from '../types';

const FLAG_PATTERN = /^[dgimsuvy]*$/;

const dedupeFlags = (flags: string) => {
  const unique: string[] = [];
  flags.split('').forEach((flag) => {
    if (!unique.includes(flag)) {
      unique.push(flag);
    }
  });
  return unique.join('');
};

const parseLiteralRegex = (input: string): { source: string; flags: string } | null => {
  if (!input.startsWith('/') || input.length < 2) {
    return null;
  }

  let escaped = false;
  for (let i = 1; i < input.length; i += 1) {
    const char = input.charAt(i);
    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '/') {
      return {
        source: input.slice(1, i),
        flags: input.slice(i + 1),
      };
    }
  }

  return null;
};

export const parseRegexInput = (rawPattern: string, rawFlags = ''): RegexParseResult => {
  const patternText = rawPattern.trim();
  const flagsText = rawFlags.trim();

  if (!patternText) {
    return {
      regex: null,
      source: '',
      flags: flagsText,
      error: null,
    };
  }

  const literal = parseLiteralRegex(patternText);
  const source = literal ? literal.source : patternText;
  const mergedFlags = dedupeFlags(flagsText || literal?.flags || '');

  if (!FLAG_PATTERN.test(mergedFlags)) {
    return {
      regex: null,
      source,
      flags: mergedFlags,
      error: `Invalid flags: ${mergedFlags}`,
    };
  }

  try {
    return {
      regex: new RegExp(source, mergedFlags),
      source,
      flags: mergedFlags,
      error: null,
    };
  } catch (error) {
    return {
      regex: null,
      source,
      flags: mergedFlags,
      error: error instanceof Error ? error.message : 'Invalid regular expression',
    };
  }
};

const toTestingRegex = (regex: RegExp) => new RegExp(regex.source, regex.flags.replace(/[gy]/g, ''));

export const getMatchRanges = (regex: RegExp, text: string): Array<[number, number]> => {
  const flags = dedupeFlags(regex.flags.replace(/y/g, '') + 'g');
  const globalRegex = new RegExp(regex.source, flags);
  const ranges: Array<[number, number]> = [];

  let match = globalRegex.exec(text);
  while (match) {
    const start = match.index;
    const size = match[0].length;
    const end = start + size;

    ranges.push([start, end]);

    if (size === 0) {
      globalRegex.lastIndex += 1;
    }

    match = globalRegex.exec(text);
  }

  return ranges;
};

export const evaluateLevel = (level: LevelDefinition, regex: RegExp): LevelEvaluation => {
  const tester = toTestingRegex(regex);

  const rows = level.samples.map((sample) => {
    const matched = tester.test(sample.text);
    tester.lastIndex = 0;

    return {
      sample,
      matched,
      correct: matched === sample.shouldMatch,
      ranges: matched ? getMatchRanges(regex, sample.text) : [],
    };
  });

  return {
    solved: rows.every((row) => row.correct),
    rows,
  };
};

export const charMaskFromRanges = (text: string, ranges: Array<[number, number]>) =>
  text.split('').map((_, index) =>
    ranges.some(([start, end]) => {
      if (start === end) {
        return index === start;
      }
      return index >= start && index < end;
    }),
  );

export const buildDebugSteps = (regex: RegExp, text: string, cap = 42): DebugStep[] => {
  const flags = dedupeFlags(regex.flags.replace(/[gy]/g, ''));
  const anchored = new RegExp(`^(?:${regex.source})`, flags);
  const steps: DebugStep[] = [];

  let cursor = 0;
  while (cursor <= text.length && steps.length < cap) {
    const segment = text.slice(cursor);
    const match = anchored.exec(segment);

    if (!match) {
      steps.push({
        index: cursor,
        success: false,
        range: null,
        excerpt: text.slice(Math.max(0, cursor - 2), Math.min(text.length, cursor + 8)),
      });
      cursor += 1;
      continue;
    }

    const size = Math.max(1, match[0].length);
    steps.push({
      index: cursor,
      success: true,
      range: [cursor, cursor + size],
      excerpt: text.slice(Math.max(0, cursor - 2), Math.min(text.length, cursor + size + 4)),
    });

    cursor += size;
  }

  return steps;
};

export type DiagramToken = {
  label: string;
  tokenType: 'anchor' | 'class' | 'group' | 'lookaround' | 'quantifier' | 'literal';
};

export const tokenizePattern = (source: string): DiagramToken[] => {
  const tokens: DiagramToken[] = [];

  for (let i = 0; i < source.length; i += 1) {
    const char = source.charAt(i);

    if (char === '\\' && i + 1 < source.length) {
      tokens.push({ label: source.slice(i, i + 2), tokenType: 'class' });
      i += 1;
      continue;
    }

    if (char === '[') {
      let end = i + 1;
      let escaped = false;
      while (end < source.length) {
        const current = source.charAt(end);
        if (escaped) {
          escaped = false;
        } else if (current === '\\') {
          escaped = true;
        } else if (current === ']') {
          break;
        }
        end += 1;
      }
      tokens.push({ label: source.slice(i, Math.min(end + 1, source.length)), tokenType: 'class' });
      i = end;
      continue;
    }

    if (char === '{') {
      const end = source.indexOf('}', i + 1);
      if (end !== -1) {
        tokens.push({ label: source.slice(i, end + 1), tokenType: 'quantifier' });
        i = end;
        continue;
      }
    }

    if ('*+?'.includes(char)) {
      tokens.push({ label: char, tokenType: 'quantifier' });
      continue;
    }

    if ('^$'.includes(char)) {
      tokens.push({ label: char, tokenType: 'anchor' });
      continue;
    }

    if (char === '(') {
      const lookahead = source.slice(i, i + 4);
      const lookbehind = source.slice(i, i + 5);
      if (lookbehind === '(?<=') {
        tokens.push({ label: '(?<=', tokenType: 'lookaround' });
        i += 3;
        continue;
      }
      if (lookbehind === '(?<!') {
        tokens.push({ label: '(?<!', tokenType: 'lookaround' });
        i += 3;
        continue;
      }
      if (lookahead === '(?=') {
        tokens.push({ label: '(?=', tokenType: 'lookaround' });
        i += 2;
        continue;
      }
      if (lookahead === '(?!') {
        tokens.push({ label: '(?!', tokenType: 'lookaround' });
        i += 2;
        continue;
      }
      if (source.slice(i, i + 3) === '(?:') {
        tokens.push({ label: '(?:', tokenType: 'group' });
        i += 2;
        continue;
      }
      if (source.slice(i, i + 3) === '(?<') {
        tokens.push({ label: '(?<', tokenType: 'group' });
        i += 2;
        continue;
      }

      tokens.push({ label: '(', tokenType: 'group' });
      continue;
    }

    if (char === ')') {
      tokens.push({ label: ')', tokenType: 'group' });
      continue;
    }

    tokens.push({ label: char, tokenType: 'literal' });
  }

  return tokens;
};

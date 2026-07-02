import { BudgetRange } from '../../../types/serviceRequest';

const RANGE_PATTERNS = [
  /\b(?:budget\s*(?:is|of)?\s*)?(?:between|from)\s*(\d{2,5})(?:[.,]\d+)?\s*(?:to|and|-)\s*(\d{2,5})(?:[.,]\d+)?\s*(?:tnd|dt|dinar|dinars)?\b/i,
  /\b(?:budget\s*(?:is|of)?\s*)?(\d{2,5})(?:[.,]\d+)?\s*(?:to|and|-)\s*(\d{2,5})(?:[.,]\d+)?\s*(?:tnd|dt|dinar|dinars)\b/i,
];

const SINGLE_PATTERNS = [
  /\b(?:budget\s*(?:is|of)?\s*|around\s*|about\s*|approximately\s*|roughly\s*)(\d{2,5})(?:[.,]\d+)?\s*(?:tnd|dt|dinar|dinars)?\b/i,
  /\b(\d{2,5})(?:[.,]\d+)?\s*(?:tnd|dt|dinar|dinars)\b/i,
];

const BUDGET_CONTEXT_PATTERN = /\b(budget|price|cost|pay|paying|spend|spending)\b/i;
const CURRENCY_CONTEXT_PATTERN = /\b(tnd|dt|dinar|dinars)\b/i;
const NUMBER_PATTERN = /\b\d{2,5}(?:[.,]\d+)?\b/g;
const TOKEN_PATTERN = /\d+(?:[.,]\d+)?|[a-z]+(?:-[a-z]+)*/g;
const BUDGET_SEGMENT_PATTERNS = [
  /\b(?:budget|price|cost|pay|paying|spend|spending)\b[^.?!;\n]*/gi,
  /[^.?!;\n]{0,40}\b(?:tnd|dt|dinar|dinars)\b[^.?!;\n]{0,40}/gi,
];

const SMALL_NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS_NUMBER_WORDS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALE_NUMBER_WORDS: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
};

function getCandidateSegments(text: string) {
  const segments = new Set<string>([text]);

  for (const pattern of BUDGET_SEGMENT_PATTERNS) {
    const matches = text.match(pattern) ?? [];
    for (const match of matches) {
      const candidate = match.trim();
      if (candidate) {
        segments.add(candidate);
      }
    }
  }

  return Array.from(segments);
}

function parseWordNumber(tokens: string[], startIndex: number) {
  let total = 0;
  let current = 0;
  let consumed = 0;
  let sawNumberWord = false;

  for (let index = startIndex; index < tokens.length; index += 1) {
    const token = tokens[index];
    const parts = token.split('-');

    let advancedOnToken = false;
    for (const part of parts) {
      if (part === 'and' && sawNumberWord) {
        advancedOnToken = true;
        continue;
      }

      if (part in SMALL_NUMBER_WORDS) {
        current += SMALL_NUMBER_WORDS[part];
        sawNumberWord = true;
        advancedOnToken = true;
        continue;
      }

      if (part in TENS_NUMBER_WORDS) {
        current += TENS_NUMBER_WORDS[part];
        sawNumberWord = true;
        advancedOnToken = true;
        continue;
      }

      if (part in SCALE_NUMBER_WORDS) {
        const scale = SCALE_NUMBER_WORDS[part];
        if (scale === 100) {
          current = Math.max(current, 1) * scale;
        } else {
          total += Math.max(current, 1) * scale;
          current = 0;
        }
        sawNumberWord = true;
        advancedOnToken = true;
        continue;
      }

      advancedOnToken = false;
      break;
    }

    if (!advancedOnToken) {
      break;
    }

    consumed += 1;
  }

  if (!sawNumberWord || consumed === 0) {
    return null;
  }

  return {
    value: total + current,
    consumed,
  };
}

function extractAmountsFromSegment(segment: string) {
  const tokens = Array.from(segment.matchAll(TOKEN_PATTERN)).map((match) => match[0]);
  const amounts: number[] = [];

  for (let index = 0; index < tokens.length; ) {
    const token = tokens[index];
    if (/^\d/.test(token)) {
      amounts.push(Number(token.replace(',', '.')));
      index += 1;
      continue;
    }

    const parsedWordNumber = parseWordNumber(tokens, index);
    if (!parsedWordNumber) {
      index += 1;
      continue;
    }

    amounts.push(parsedWordNumber.value);
    index += parsedWordNumber.consumed;
  }

  return amounts.filter((amount) => Number.isFinite(amount) && amount > 0);
}

function buildBudgetRange(minimum: number, maximum: number): BudgetRange | null {
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
    return null;
  }

  const min = Math.max(0, Math.round(minimum));
  const max = Math.max(0, Math.round(maximum));
  if (min === 0 && max === 0) {
    return null;
  }

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
    currency: 'TND',
  };
}

export function extractBudgetRange(text: string): BudgetRange | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const candidateSegments = getCandidateSegments(normalized);

  for (const segment of candidateSegments) {
    for (const pattern of RANGE_PATTERNS) {
      const match = segment.match(pattern);
      if (!match) {
        continue;
      }

      return buildBudgetRange(Number(match[1]), Number(match[2]));
    }

    for (const pattern of SINGLE_PATTERNS) {
      const match = segment.match(pattern);
      if (!match) {
        continue;
      }

      const amount = Number(match[1]);
      return buildBudgetRange(amount, amount);
    }

    const hasBudgetContext = BUDGET_CONTEXT_PATTERN.test(segment);
    const hasCurrencyContext = CURRENCY_CONTEXT_PATTERN.test(segment);
    const digitAmounts = Array.from(segment.matchAll(NUMBER_PATTERN));

    if (digitAmounts.length >= 2 && (hasBudgetContext || hasCurrencyContext)) {
      for (let index = 0; index < digitAmounts.length - 1; index += 1) {
        const current = digitAmounts[index];
        const next = digitAmounts[index + 1];
        const currentIndex = current.index ?? 0;
        const nextIndex = next.index ?? 0;
        const between = segment.slice(currentIndex + current[0].length, nextIndex).trim();

        if (between.length <= 12 || /\b(to|and|or|up to|until|-)\b/.test(between)) {
          return buildBudgetRange(Number(current[0]), Number(next[0]));
        }
      }
    }

    const spokenAmounts = extractAmountsFromSegment(segment);
    if (spokenAmounts.length >= 2 && (hasBudgetContext || hasCurrencyContext)) {
      return buildBudgetRange(spokenAmounts[0], spokenAmounts[1]);
    }

    if (spokenAmounts.length >= 1 && (hasBudgetContext || hasCurrencyContext)) {
      return buildBudgetRange(spokenAmounts[0], spokenAmounts[0]);
    }
  }

  return null;
}

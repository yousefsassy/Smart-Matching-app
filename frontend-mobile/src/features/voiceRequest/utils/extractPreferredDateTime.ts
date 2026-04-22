const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

export interface ExtractedPreferredDateTime {
  preferredDateTime: string | null;
  hasExplicitDate: boolean;
  hasExplicitTime: boolean;
}

function createBaseDate() {
  const now = new Date();
  now.setSeconds(0, 0);
  return now;
}

function applyRelativeDate(target: Date, normalized: string) {
  let hasExplicitDate = false;

  if (normalized.includes('tomorrow')) {
    target.setDate(target.getDate() + 1);
    hasExplicitDate = true;
  } else if (normalized.includes('today')) {
    hasExplicitDate = true;
  }

  return hasExplicitDate;
}

function applyNumericDate(target: Date, normalized: string) {
  const explicitDateMatch = normalized.match(
    /\b(?:on\s+)?(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/
  );

  if (!explicitDateMatch) {
    return false;
  }

  const month = Number(explicitDateMatch[1]) - 1;
  const day = Number(explicitDateMatch[2]);
  const yearValue = explicitDateMatch[3]
    ? Number(explicitDateMatch[3].length === 2 ? `20${explicitDateMatch[3]}` : explicitDateMatch[3])
    : target.getFullYear();

  target.setFullYear(yearValue, month, day);
  return true;
}

function applyMonthNameDate(target: Date, normalized: string) {
  const monthFirstMatch = normalized.match(
    /\b(?:on\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/
  );
  const dayFirstMatch = normalized.match(
    /\b(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+of\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:,?\s*(\d{4}))?\b/
  );

  if (!monthFirstMatch && !dayFirstMatch) {
    return false;
  }

  const now = new Date();
  const monthLabel = monthFirstMatch ? monthFirstMatch[1] : dayFirstMatch?.[2] ?? '';
  const dayValue = Number(monthFirstMatch ? monthFirstMatch[2] : dayFirstMatch?.[1] ?? '');
  const explicitYear = monthFirstMatch ? monthFirstMatch[3] : dayFirstMatch?.[3];
  const monthIndex = MONTH_NAMES.indexOf(monthLabel as (typeof MONTH_NAMES)[number]);

  if (monthIndex < 0 || !Number.isFinite(dayValue)) {
    return false;
  }

  let yearValue = explicitYear ? Number(explicitYear) : target.getFullYear();

  if (!explicitYear) {
    const candidate = new Date(target);
    candidate.setFullYear(yearValue, monthIndex, dayValue);
    if (candidate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
      yearValue += 1;
    }
  }

  target.setFullYear(yearValue, monthIndex, dayValue);
  return true;
}

function applyExplicitTime(target: Date, normalized: string) {
  const timeMatch =
    normalized.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/) ??
    normalized.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/) ??
    normalized.match(/\b(\d{1,2})\s*(am|pm)\b/);

  if (!timeMatch) {
    return false;
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2] ?? '0');
  const meridiem = timeMatch[3];

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  if (!meridiem && normalized.includes(' at ') && hours < 7) {
    hours += 12;
  }

  if (hours > 23 || minutes > 59) {
    return false;
  }

  target.setHours(hours, minutes, 0, 0);
  return true;
}

export function extractPreferredDateTime(text: string): ExtractedPreferredDateTime {
  const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return {
      preferredDateTime: null,
      hasExplicitDate: false,
      hasExplicitTime: false,
    };
  }

  const target = createBaseDate();
  const hasExplicitDate =
    applyRelativeDate(target, normalized) ||
    applyNumericDate(target, normalized) ||
    applyMonthNameDate(target, normalized);
  const hasExplicitTime = applyExplicitTime(target, normalized);

  if (!hasExplicitDate && !hasExplicitTime) {
    return {
      preferredDateTime: null,
      hasExplicitDate: false,
      hasExplicitTime: false,
    };
  }

  if (!hasExplicitTime) {
    target.setHours(0, 0, 0, 0);
  }

  if (Number.isNaN(target.getTime())) {
    return {
      preferredDateTime: null,
      hasExplicitDate: false,
      hasExplicitTime: false,
    };
  }

  return {
    preferredDateTime: target.toISOString(),
    hasExplicitDate,
    hasExplicitTime,
  };
}

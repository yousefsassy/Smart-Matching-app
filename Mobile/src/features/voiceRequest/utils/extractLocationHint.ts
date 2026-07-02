export function extractLocationHint(text: string): string | null {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return null;
  }

  const patterns = [
    /\b(?:located|based)\s+in\s+([a-zA-ZÀ-ÿ' -]{2,})/i,
    /\b(?:close|next)\s+to\s+([a-zA-ZÀ-ÿ' -]{2,})/i,
    /\b(?:in|at|near|around)\s+([a-zA-ZÀ-ÿ' -]{2,})/i,
    /\b(?:by|beside)\s+([a-zA-ZÀ-ÿ' -]{2,})/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const candidate = match?.[1]?.trim();
    if (!candidate) {
      continue;
    }

    const cleanedCandidate = candidate
      .replace(/\b(tomorrow|today|tonight|this afternoon|this evening|next week)\b.*$/i, '')
      .replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(am|pm)?\b.*$/i, '')
      .replace(/\b(for|because|with|and|but|please)\b.*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedCandidate.length >= 2) {
      return cleanedCandidate;
    }
  }

  return null;
}

function round(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function roundedJsonNumberReplacer(key, value) {
  if (typeof value !== 'number') {
    return value;
  }
  if (!Number.isFinite(value)) {
    throw new Error(`${key || '<root>'} must be finite before JSON serialization`);
  }
  return round(value);
}

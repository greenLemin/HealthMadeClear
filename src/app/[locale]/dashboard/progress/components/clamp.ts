/** Display bounds only. Do not treat clampPercent(average) === 100 as proof the average is correct — 1600 also clamps to 100. */
export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

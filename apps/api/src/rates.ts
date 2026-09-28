import type { CachedRates } from "@koin/shared";

/**
 * The provider rounds small rates to ~3 significant digits (e.g. VND→EUR = 0.000034 instead of
 * 0.0000338), while rates ≥ 1 keep 2 decimals (EUR→VND = 29584.77). For every pair we use the
 * direction whose rate is ≥ 1 and invert it for the other base, so both bases are precise and
 * exact inverses of each other.
 */
export function refineRates(base: string, all: Map<string, CachedRates>): Record<string, number> {
  const own = all.get(base)?.rates ?? {};
  const refined: Record<string, number> = {};

  for (const [code, rate] of Object.entries(own)) {
    const reverse = all.get(code)?.rates[base];
    refined[code] = rate < 1 && reverse !== undefined && reverse >= 1 ? 1 / reverse : rate;
  }

  return refined;
}

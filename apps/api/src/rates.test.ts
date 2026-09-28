import { describe, expect, test } from "bun:test";
import type { CachedRates } from "@koin/shared";
import { refineRates } from "./rates";

const snapshot = (base: string, rates: Record<string, number>): CachedRates => ({
  base,
  rates,
  lastUpdated: 0,
});

const all = new Map([
  ["EUR", snapshot("EUR", { EUR: 1, VND: 29584.77, USD: 1.14 })],
  ["VND", snapshot("VND", { VND: 1, EUR: 0.000034, USD: 0.000039 })],
  ["USD", snapshot("USD", { USD: 1, EUR: 0.878, VND: 25952.11 })],
]);

describe("refineRates", () => {
  test("replaces rounded small rates with the inverse of the precise direction", () => {
    const vnd = refineRates("VND", all);
    expect(vnd.EUR).toBe(1 / 29584.77);
    expect(vnd.USD).toBe(1 / 25952.11);
  });

  test("keeps rates that are already ≥ 1", () => {
    expect(refineRates("EUR", all).VND).toBe(29584.77);
  });

  test("makes both directions exact inverses", () => {
    const eur = refineRates("EUR", all);
    const usd = refineRates("USD", all);
    expect(usd.EUR).toBe(1 / eur.USD);
  });

  test("keeps the provider rate when the reverse base is missing", () => {
    const partial = new Map([["VND", snapshot("VND", { EUR: 0.000034 })]]);
    expect(refineRates("VND", partial).EUR).toBe(0.000034);
  });
});

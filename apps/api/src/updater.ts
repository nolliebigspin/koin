import type { CachedRates, RatesResponse } from "@koin/shared";
import { CURRENCIES, UPDATE_INTERVAL_MS } from "./config";
import redis from "./redis";

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

type UpdateResult = { base: string; success: boolean; error?: string };

async function fetchAndCacheRates(base: string): Promise<UpdateResult> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);

    if (!response.ok) {
      return { base, success: false, error: `HTTP ${response.status}` };
    }

    const data: RatesResponse = await response.json();

    const cached: CachedRates = {
      base: data.base,
      rates: data.rates,
      lastUpdated: data.time_last_updated * 1000,
    };

    await redis.set(`rates:${base}`, JSON.stringify(cached));
    return { base, success: true };
  } catch (err) {
    return { base, success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateAllRates(): Promise<void> {
  const results: UpdateResult[] = [];

  for (let i = 0; i < CURRENCIES.length; i += BATCH_SIZE) {
    const batch = CURRENCIES.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(fetchAndCacheRates));
    results.push(...batchResults);

    if (i + BATCH_SIZE < CURRENCIES.length) {
      await Bun.sleep(BATCH_DELAY_MS);
    }
  }

  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    const errorDetails = failed.map((f) => `${f.base} (${f.error})`).join(", ");
    console.error(
      `⚠️  Failed to update all currencies. Success: ${results.length - failed.length}/${results.length}. Errors: ${errorDetails}`
    );
  } else {
    console.log(`✅  Successfully updated all ${results.length} currencies.`);
  }
}

export function startScheduler(): void {
  updateAllRates();
  setInterval(updateAllRates, UPDATE_INTERVAL_MS);
}

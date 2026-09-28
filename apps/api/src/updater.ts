import type { CachedRates, RatesResponse } from "@koin/shared";
import { CURRENCIES, UPDATE_INTERVAL_MS } from "./config";
import { notifyDiscord } from "./discord";
import { refineRates } from "./rates";
import redis from "./redis";

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

type UpdateResult = { base: string; success: boolean; error?: string };

async function fetchRates(base: string): Promise<CachedRates> {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data: RatesResponse = await response.json();

  return {
    base: data.base,
    rates: data.rates,
    lastUpdated: data.time_last_updated * 1000,
  };
}

async function fetchRatesSafe(
  base: string
): Promise<{ base: string; data?: CachedRates; error?: string }> {
  try {
    return { base, data: await fetchRates(base) };
  } catch (err) {
    return { base, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateAllRates(): Promise<void> {
  const results: UpdateResult[] = [];
  const fetched = new Map<string, CachedRates>();

  for (let i = 0; i < CURRENCIES.length; i += BATCH_SIZE) {
    const batch = CURRENCIES.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(fetchRatesSafe));

    for (const { base, data, error } of batchResults) {
      if (data) fetched.set(base, data);
      else results.push({ base, success: false, error });
    }

    if (i + BATCH_SIZE < CURRENCIES.length) {
      await Bun.sleep(BATCH_DELAY_MS);
    }
  }

  // Store only after all bases are fetched, so each base can use the precise reverse rates.
  for (const [base, data] of fetched) {
    try {
      const cached: CachedRates = { ...data, rates: refineRates(base, fetched) };
      await redis.set(`rates:${base}`, JSON.stringify(cached));
      results.push({ base, success: true });
    } catch (err) {
      results.push({
        base,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    const errorDetails = failed.map((f) => `${f.base} (${f.error})`).join(", ");
    const message = `⚠️  Failed to update all currencies. Success: ${results.length - failed.length}/${results.length}. Errors: ${errorDetails}`;
    console.error(message);
    await notifyDiscord(message);
  } else {
    console.log(`✅  Successfully updated all ${results.length} currencies.`);
  }
}

export function startScheduler(): void {
  updateAllRates();
  setInterval(updateAllRates, UPDATE_INTERVAL_MS);
}

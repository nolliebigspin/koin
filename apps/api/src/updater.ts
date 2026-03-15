import type { CachedRates, RatesResponse } from "@koin/shared";
import { CURRENCIES, UPDATE_INTERVAL_MS } from "./config";
import redis from "./redis";

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

async function fetchAndCacheRates(base: string): Promise<void> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);

    if (!response.ok) {
      console.error(`Failed to fetch rates for ${base}: ${response.status}`);
      return;
    }

    const data: RatesResponse = await response.json();

    const cached: CachedRates = {
      base: data.base,
      rates: data.rates,
      lastUpdated: data.time_last_updated * 1000,
    };

    await redis.set(`rates:${base}`, JSON.stringify(cached));
    console.log(`Updated rates for ${base}`);
  } catch (err) {
    console.error(`Error fetching rates for ${base}:`, err);
  }
}

export async function updateAllRates(): Promise<void> {
  console.log(`Updating rates for ${CURRENCIES.length} currencies...`);

  for (let i = 0; i < CURRENCIES.length; i += BATCH_SIZE) {
    const batch = CURRENCIES.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(fetchAndCacheRates));

    if (i + BATCH_SIZE < CURRENCIES.length) {
      await Bun.sleep(BATCH_DELAY_MS);
    }
  }

  console.log("All rates updated.");
}

export function startScheduler(): void {
  updateAllRates();
  setInterval(updateAllRates, UPDATE_INTERVAL_MS);
}

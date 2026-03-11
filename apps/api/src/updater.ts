import { CURRENCIES, UPDATE_INTERVAL_MS } from "./config";
import redis from "./redis";

type RatesResponse = {
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
};

type CachedRates = {
  base: string;
  rates: Record<string, number>;
  lastUpdated: number;
};

async function fetchAndCacheRates(base: string): Promise<void> {
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
}

export async function updateAllRates(): Promise<void> {
  console.log(`Updating rates for ${CURRENCIES.length} currencies...`);

  for (const currency of CURRENCIES) {
    await fetchAndCacheRates(currency);
  }

  console.log("All rates updated.");
}

export function startScheduler(): void {
  updateAllRates();
  setInterval(updateAllRates, UPDATE_INTERVAL_MS);
}

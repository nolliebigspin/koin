import type { CachedRates } from "@koin/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { StorageKeys, storage } from "@/src/lib/storage";

const DAY_MS = 24 * 60 * 60 * 1000;

function getCachedRates(): CachedRates | null {
  const raw = storage.getString(StorageKeys.CACHED_RATES);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedRates;
  } catch {
    return null;
  }
}

function setCachedRates(data: CachedRates): void {
  storage.set(StorageKeys.CACHED_RATES, JSON.stringify(data));
}

/** Derives rates for another base from a cached snapshot, so swapping works offline. */
function rebaseRates(
  cached: CachedRates | null,
  base: string | undefined
): CachedRates | undefined {
  if (!cached || !base) return undefined;
  if (cached.base === base) return cached;

  const baseRate = cached.rates[base];
  if (!baseRate) return undefined;

  const rates: Record<string, number> = {};
  for (const [code, rate] of Object.entries(cached.rates)) {
    rates[code] = rate / baseRate;
  }
  return { base, rates, lastUpdated: cached.lastUpdated };
}

/** Rates are published once a day, so data stays fresh until the next UTC midnight. */
function msUntilNextUtcDay(lastUpdated: number, dataUpdatedAt: number): number {
  const nextDay = (Math.floor(lastUpdated / DAY_MS) + 1) * DAY_MS;
  return Math.max(0, nextDay - dataUpdatedAt);
}

async function fetchRates(baseCurrency: string): Promise<CachedRates> {
  const response = await fetch(`https://koin.awinter.dev/rates/${baseCurrency}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status}`);
  }

  const cached: CachedRates = await response.json();

  setCachedRates(cached);
  return cached;
}

/**
 * Keeps ONE rates snapshot (whatever base it was fetched for) and rebases it to the requested
 * base. Swapping never refetches, and both directions always use the same numbers, so swapping
 * back and forth can't drift.
 */
export function useRates(baseCurrency: string | undefined) {
  const query = useQuery({
    queryKey: ["rates"],
    queryFn: () => fetchRates(baseCurrency as string),
    enabled: !!baseCurrency,
    staleTime: (q) => {
      const { data, dataUpdatedAt } = q.state;
      return data ? msUntilNextUtcDay(data.lastUpdated, dataUpdatedAt) : 0;
    },
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    initialData: () => getCachedRates() ?? undefined,
    initialDataUpdatedAt: () => getCachedRates()?.lastUpdated ?? 0,
  });

  const rates = useMemo(
    () => rebaseRates(query.data ?? null, baseCurrency)?.rates ?? null,
    [query.data, baseCurrency]
  );

  return {
    rates,
    isLoading: query.isFetching && !query.data,
  };
}

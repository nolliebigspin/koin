import { useQuery } from "@tanstack/react-query";
import { StorageKeys, storage } from "@/src/lib/storage";

type RatesResponse = {
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
};

type CachedRates = {
  rates: Record<string, number>;
  lastUpdated: number;
  base: string;
};

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

async function fetchRates(baseCurrency: string): Promise<CachedRates> {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status}`);
  }

  const data: RatesResponse = await response.json();

  const cached: CachedRates = {
    rates: data.rates,
    lastUpdated: data.time_last_updated * 1000,
    base: data.base,
  };

  setCachedRates(cached);
  return cached;
}

export function useRates(baseCurrency: string | undefined) {
  const query = useQuery({
    queryKey: ["rates", baseCurrency],
    queryFn: () => fetchRates(baseCurrency as string),
    enabled: !!baseCurrency,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    initialData: () => {
      const cached = getCachedRates();
      return cached?.base === baseCurrency ? cached : undefined;
    },
    initialDataUpdatedAt: () => {
      const cached = getCachedRates();
      return cached != null && cached.base === baseCurrency ? cached.lastUpdated : 0;
    },
  });

  return {
    rates: query.data?.rates ?? null,
    isLoading: query.isFetching && !query.data,
    isError: query.isError,
    isStale: query.isStale || query.isError,
    refetch: query.refetch,
    lastUpdated: query.data?.lastUpdated ?? null,
  };
}

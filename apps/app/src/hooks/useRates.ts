import type { CachedRates } from "@koin/shared";
import { useQuery } from "@tanstack/react-query";
import { StorageKeys, storage } from "@/src/lib/storage";

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
  const response = await fetch(`https://koin.awinter.dev/rates/${baseCurrency}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status}`);
  }

  const cached: CachedRates = await response.json();

  setCachedRates(cached);
  return cached;
}

export function useRates(baseCurrency: string | undefined) {
  const query = useQuery({
    queryKey: ["rates", baseCurrency],
    queryFn: () => fetchRates(baseCurrency as string),
    enabled: !!baseCurrency,
    staleTime: 60 * 60 * 1000,
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
  };
}

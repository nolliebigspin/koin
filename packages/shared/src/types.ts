export type RatesResponse = {
  base: string;
  date: string;
  time_last_updated: number;
  rates: Record<string, number>;
};

export type CachedRates = {
  base: string;
  rates: Record<string, number>;
  lastUpdated: number;
};

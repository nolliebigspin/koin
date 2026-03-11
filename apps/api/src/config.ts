export { CURRENCIES } from "@koin/shared";

export const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const API_PORT = Number(process.env.PORT) || 4001;
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

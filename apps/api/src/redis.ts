import { REDIS_URL } from "./config";

const redis = new Bun.RedisClient(REDIS_URL);

export default redis;

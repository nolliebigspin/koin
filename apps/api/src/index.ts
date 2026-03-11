import { API_PORT } from "./config";
import redis from "./redis";
import { startScheduler } from "./updater";

startScheduler();

Bun.serve({
  port: API_PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const match = url.pathname.match(/^\/rates\/([A-Z]{3})$/);

    if (!match) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const base = match[1];
    const cached = await redis.get(`rates:${base}`);

    if (!cached) {
      return Response.json({ error: `No cached rates for ${base}` }, { status: 404 });
    }

    return Response.json(JSON.parse(cached));
  },
});

console.log(`API server running on port ${API_PORT}`);

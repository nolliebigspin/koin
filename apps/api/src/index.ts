import { API_PORT } from "./config";
import redis from "./redis";
import { startScheduler } from "./updater";

startScheduler();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
};

Bun.serve({
  port: API_PORT,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const match = url.pathname.match(/^\/rates\/([A-Z]{3})$/);

    if (!match) {
      return Response.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
    }

    const base = match[1];
    const cached = await redis.get(`rates:${base}`);

    if (!cached) {
      return Response.json(
        { error: `No cached rates for ${base}` },
        { status: 404, headers: corsHeaders }
      );
    }

    return Response.json(JSON.parse(cached), { headers: corsHeaders });
  },
});

console.log(`API server running on port ${API_PORT}`);

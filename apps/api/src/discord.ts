import { DISCORD_WEBHOOK_URL } from "./config";

export async function notifyDiscord(content: string): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) return;

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      console.error(`Failed to send Discord webhook: HTTP ${response.status}`);
    }
  } catch (err) {
    console.error("Failed to send Discord webhook:", err instanceof Error ? err.message : err);
  }
}

import { describe, expect, test } from "bun:test";
import { requireLiveOpenAiConfig } from "../../scripts/live-openai-config.js";
import { runRealtimeWebSocketSmoke } from "../../scripts/live-openai-websocket-smoke.js";

describe("OpenAI Realtime WebSocket live smoke", () => {
  test("connects, updates the session, receives an event, and closes", async () => {
    const config = requireLiveOpenAiConfig(process.env);
    const result = await runRealtimeWebSocketSmoke(config);

    expect(result.connected).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events.some(event => event.type === "session.created" || event.type === "session.updated")).toBe(true);
  }, 30000);
});

import { describe, expect, test } from "bun:test";
import { requireLiveOpenAiConfig } from "../../scripts/live-openai-config.js";
import {
  isRealtimeSessionReadyEvent,
  runRealtimeWebSocketSmoke
} from "../../scripts/live-openai-websocket-smoke.js";

describe("OpenAI Realtime WebSocket live smoke", () => {
  const maybeTest = process.env.OPENAI_REALTIME_LIVE_TEST === "1" ? test : test.skip;

  maybeTest("connects, updates the session, receives an event, and closes", async () => {
    const config = requireLiveOpenAiConfig(process.env);
    const result = await runRealtimeWebSocketSmoke(config);

    expect(result.connected).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events.some(isRealtimeSessionReadyEvent)).toBe(true);
  }, 30000);
});

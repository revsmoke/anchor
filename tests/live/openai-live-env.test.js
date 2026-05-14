import { describe, expect, test } from "bun:test";
import { requireLiveOpenAiConfig } from "../../scripts/live-openai-config.js";

describe("OpenAI live test env", () => {
  const maybeTest = process.env.OPENAI_REALTIME_LIVE_TEST === "1" ? test : test.skip;

  maybeTest("is explicitly enabled and has a server-side API key", () => {
    const config = requireLiveOpenAiConfig(process.env);

    expect(config.enabled).toBe(true);
    expect(config.openaiApiKey.length).toBeGreaterThan(10);
    expect(config.realtimeModel).toBeTruthy();
    expect(config.openaiRealtimeCallsUrl).toBe("https://api.openai.com/v1/realtime/calls");
  });
});

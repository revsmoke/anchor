import { describe, expect, test } from "bun:test";
import { getServerConfig } from "../../server/config.js";
import { createRealtimeClient } from "../../server/services/realtime.js";
import { runRealtimeWebSocketSmoke } from "../../scripts/live-openai-websocket-smoke.js";

describe("live OpenAI test config", () => {
  test("enables explicit network mode without production env", () => {
    const config = getServerConfig({
      APP_ENV: "test",
      OPENAI_REALTIME_LIVE_TEST: "1",
      OPENAI_API_KEY: "sk-test-value"
    });

    expect(config.forceRealtimeNetwork).toBe(true);
    expect(config.appEnv).toBe("test");
    expect(config.openaiApiKey).toBe("sk-test-value");
  });

  test("does not force network in normal tests", () => {
    const config = getServerConfig({
      APP_ENV: "test",
      OPENAI_API_KEY: "sk-test-value"
    });

    expect(config.forceRealtimeNetwork).toBe(false);
  });
});

describe("Realtime client live network behavior", () => {
  test("posts SDP and session config with backend authorization", async () => {
    const requests = [];
    const responseHeaders = new Headers({
      location: "https://api.openai.com/v1/realtime/calls/rtc_live_test_123"
    });
    const client = createRealtimeClient({
      appEnv: "test",
      forceRealtimeNetwork: true,
      openaiApiKey: "sk-live-test-secret",
      openaiRealtimeCallsUrl: "https://api.openai.com/v1/realtime/calls"
    }, async (url, options) => {
      requests.push({ url, options });
      return new Response("v=0\r\ns=answer\r\n", {
        status: 200,
        headers: responseHeaders
      });
    });

    const result = await client.createCall({
      sdpOffer: "v=0\r\ns=offer\r\n",
      session: { type: "realtime", model: "gpt-realtime" }
    });

    expect(result.sdpAnswer).toContain("v=0");
    expect(result.openAiCallId).toBe("rtc_live_test_123");
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://api.openai.com/v1/realtime/calls");
    expect(requests[0].options.headers.authorization).toBe("Bearer sk-live-test-secret");
    expect(requests[0].options.body).toBeInstanceOf(FormData);
    const body = requests[0].options.body;
    expect(String(body.get("sdp"))).toContain("offer");
    expect(JSON.parse(String(body.get("session"))).type).toBe("realtime");
  });

  test("hangup checks OpenAI response status in live mode", async () => {
    const client = createRealtimeClient({
      appEnv: "test",
      forceRealtimeNetwork: true,
      openaiApiKey: "sk-live-test-secret",
      openaiRealtimeCallsUrl: "https://api.openai.com/v1/realtime/calls"
    }, async () => new Response("nope", { status: 500 }));

    await expect(client.hangup("rtc_live_test_123")).rejects.toThrow("Realtime call hangup failed.");
  });

  test("hangup can force network cleanup for per-request live calls in local mode", async () => {
    const requests = [];
    const client = createRealtimeClient({
      appEnv: "test",
      forceRealtimeNetwork: false,
      openaiApiKey: "sk-live-test-secret",
      openaiRealtimeCallsUrl: "https://api.openai.com/v1/realtime/calls"
    }, async (url, options) => {
      requests.push({ url, options });
      return new Response("", { status: 200 });
    });

    await client.hangup("rtc_live_test_123", { forceNetwork: true });

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://api.openai.com/v1/realtime/calls/rtc_live_test_123/hangup");
    expect(requests[0].options.headers.authorization).toBe("Bearer sk-live-test-secret");
  });
});

describe("Realtime WebSocket smoke helper", () => {
  test("rejects immediately when the WebSocket constructor fails", async () => {
    class ThrowingWebSocket {
      constructor() {
        throw new Error("constructor failed");
      }
    }

    await expect(runRealtimeWebSocketSmoke({
      openaiApiKey: "sk-live-test-secret",
      realtimeModel: "gpt-realtime"
    }, ThrowingWebSocket)).rejects.toThrow("constructor failed");
  });
});

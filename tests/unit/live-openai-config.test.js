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
  function createFakeWebSocketHarness({ onConstruct } = {}) {
    const instances = [];

    class FakeWebSocket {
      constructor(url, options) {
        onConstruct?.(url, options);
        this.url = url;
        this.options = options;
        this.listeners = new Map();
        this.sent = [];
        this.closeCalls = 0;
        instances.push(this);
      }

      addEventListener(type, listener) {
        const listeners = this.listeners.get(type) || [];
        listeners.push(listener);
        this.listeners.set(type, listeners);
      }

      send(payload) {
        this.sent.push(payload);
      }

      close() {
        this.closeCalls += 1;
      }

      emit(type, event = {}) {
        for (const listener of this.listeners.get(type) || []) {
          listener(event);
        }
      }
    }

    return { FakeWebSocket, instances };
  }

  function createDeferredObserver(promise) {
    const observer = {
      status: "pending",
      value: undefined,
      reason: undefined
    };

    promise.then(
      value => {
        observer.status = "resolved";
        observer.value = value;
      },
      reason => {
        observer.status = "rejected";
        observer.reason = reason;
      }
    );

    return observer;
  }

  async function flushMicrotasks() {
    await Promise.resolve();
    await Promise.resolve();
  }

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

  test("rejects when the socket closes before readiness", async () => {
    const { FakeWebSocket, instances } = createFakeWebSocketHarness();
    const smoke = runRealtimeWebSocketSmoke({
      openaiApiKey: "sk-live-test-secret",
      realtimeModel: "gpt-realtime"
    }, FakeWebSocket);

    instances[0].emit("close", { code: 1006, reason: "network reset" });

    await expect(smoke).rejects.toThrow("Realtime WebSocket closed before ready (code 1006): network reset");
  });

  test("does not double-settle when the socket closes after readiness", async () => {
    const { FakeWebSocket, instances } = createFakeWebSocketHarness();
    const smoke = runRealtimeWebSocketSmoke({
      openaiApiKey: "sk-live-test-secret",
      realtimeModel: "gpt-realtime"
    }, FakeWebSocket);
    const observer = createDeferredObserver(smoke);

    instances[0].emit("message", {
      data: JSON.stringify({ type: "session.created", session: { id: "sess_123" } })
    });
    instances[0].emit("close", { code: 1000, reason: "normal" });
    await flushMicrotasks();

    expect(observer.status).toBe("resolved");
    expect(observer.value.connected).toBe(true);
    expect(observer.value.events).toEqual([
      { type: "session.created", session: { id: "sess_123" } }
    ]);
  });

  test("rejects once when the WebSocket emits an error", async () => {
    const { FakeWebSocket, instances } = createFakeWebSocketHarness();
    const smoke = runRealtimeWebSocketSmoke({
      openaiApiKey: "sk-live-test-secret",
      realtimeModel: "gpt-realtime"
    }, FakeWebSocket);
    const observer = createDeferredObserver(smoke);

    instances[0].emit("error", new Error("low-level failure"));
    instances[0].emit("message", {
      data: JSON.stringify({ type: "session.created" })
    });
    await flushMicrotasks();

    expect(observer.status).toBe("rejected");
    expect(observer.reason.message).toBe("Realtime WebSocket connection failed.");
  });

  test("timeout rejects without waiting for the default live timeout", async () => {
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    const observedDelays = [];

    globalThis.setTimeout = (callback, delay) => {
      observedDelays.push(delay);
      queueMicrotask(callback);
      return Symbol("timeout");
    };
    globalThis.clearTimeout = () => {};

    try {
      const { FakeWebSocket } = createFakeWebSocketHarness();
      await expect(runRealtimeWebSocketSmoke({
        openaiApiKey: "sk-live-test-secret",
        realtimeModel: "gpt-realtime"
      }, FakeWebSocket, { timeoutMs: 5 })).rejects.toThrow("Realtime WebSocket smoke timed out.");
      expect(observedDelays).toEqual([5]);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
    }
  });

  test("malformed JSON rejects with the parse error", async () => {
    const { FakeWebSocket, instances } = createFakeWebSocketHarness();
    const smoke = runRealtimeWebSocketSmoke({
      openaiApiKey: "sk-live-test-secret",
      realtimeModel: "gpt-realtime"
    }, FakeWebSocket);

    instances[0].emit("message", { data: "{not json" });

    await expect(smoke).rejects.toThrow(SyntaxError);
  });

  test("API error messages reject with the API message", async () => {
    const { FakeWebSocket, instances } = createFakeWebSocketHarness();
    const smoke = runRealtimeWebSocketSmoke({
      openaiApiKey: "sk-live-test-secret",
      realtimeModel: "gpt-realtime"
    }, FakeWebSocket);

    instances[0].emit("message", {
      data: JSON.stringify({
        type: "error",
        error: { message: "model is unavailable" }
      })
    });

    await expect(smoke).rejects.toThrow("model is unavailable");
  });
});

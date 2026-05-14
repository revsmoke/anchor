import { describe, expect, test } from "bun:test";
import { createApp } from "../../server/app.js";

const seededSnapshot = {
  productName: "Anchor",
  snapshotDate: "2026-04-25",
  morningAnchorSummary: "Morning anchor: check in, choose one focus, cope ahead."
};

function request(path) {
  return new Request(`http://localhost${path}`);
}

describe("Pass 0 routes", () => {
  test("GET /api/health reports API and database readiness", async () => {
    const app = createApp({
      db: {
        checkHealth: async () => true
      }
    });

    const response = await app.fetch(request("/api/health"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        status: "ok",
        database: "ok"
      }
    });
  });

  test("GET /api/config/public returns safe browser configuration", async () => {
    const app = createApp({
      db: {
        checkHealth: async () => true
      },
      config: {
        appEnv: "test",
        openaiApiKey: "",
        realtimeModel: "gpt-realtime"
      }
    });

    const response = await app.fetch(request("/api/config/public"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        appName: "Anchor",
        environment: "test",
        supportLocale: "US",
        crisisResources: {
          emergency: "911",
          suicideCrisisLifeline: "988"
        },
        voice: {
          liveRealtimeAvailable: false,
          realtimeModel: "gpt-realtime"
        }
      }
    });
  });

  test("GET /api/config/public does not enable live voice for placeholder OpenAI config", async () => {
    const app = createApp({
      db: {
        checkHealth: async () => true
      },
      config: {
        appEnv: "test",
        openaiApiKey: "replace-me",
        realtimeModel: "replace-me"
      }
    });

    const response = await app.fetch(request("/api/config/public"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.voice.liveRealtimeAvailable).toBe(false);
    expect(payload.data.voice.realtimeModel).toBe("replace-me");
  });

  test("POST /api/voice/client-secret is registered before the route fallback", async () => {
    const app = createApp({
      db: {
        checkHealth: async () => true
      }
    });

    const response = await app.fetch(new Request("http://localhost/api/voice/client-secret", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({})
    }));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("unauthorized");
    expect(payload.error.code).not.toBe("not_found");
  });

  test("GET /api/today/snapshot returns the seeded PostgreSQL snapshot", async () => {
    const app = createApp({
      db: {
        getTodaySnapshot: async () => seededSnapshot
      }
    });

    const response = await app.fetch(request("/api/today/snapshot"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: seededSnapshot
    });
  });

  test("GET /api/today/snapshot returns a safe error when the database query fails", async () => {
    const app = createApp({
      db: {
        getTodaySnapshot: async () => {
          throw new Error("connection refused with internal details");
        }
      }
    });

    const response = await app.fetch(request("/api/today/snapshot"));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("snapshot_unavailable");
    expect(payload.error.message).toBe("Today snapshot is unavailable.");
    expect(payload.error.requestId).toStartWith("req_");
  });
});

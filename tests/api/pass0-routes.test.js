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
          liveRealtimeAvailable: Boolean(process.env.OPENAI_API_KEY),
          realtimeModel: "gpt-realtime"
        }
      }
    });
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

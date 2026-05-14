import { describe, expect, test } from "bun:test";
import { createApp } from "../../server/app.js";
import { getServerConfig } from "../../server/config.js";
import { createDb } from "../../server/db.js";
import { createArtifactStore } from "../../server/services/export-service.js";
import { LIVE_TEST_USER, seedLiveTestData } from "../../scripts/live-test-seed-data.js";

function jsonRequest(path, body, cookie = "", method = "POST") {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify(body)
  });
}

async function parse(response) {
  const payload = await response.json();
  expect(payload.ok).toBe(true);
  return payload.data;
}

function cookieFrom(response) {
  return response.headers.get("set-cookie")?.split(";")[0] ?? "";
}

describe("seeded Anchor API full-function live test data", () => {
  test("seeds a repeatable prototype user and exercises all non-browser feature routes", async () => {
    const config = getServerConfig({
      ...process.env,
      APP_ENV: "test",
      OPENAI_REALTIME_LIVE_TEST: "1",
      EXPORT_DIR: ".anchor-data/live-test-exports"
    });
    const db = createDb(config.databaseUrl);
    const artifactStore = createArtifactStore(config);

    try {
      const seeded = await seedLiveTestData({ databaseUrl: config.databaseUrl });
      expect(seeded.email).toBe(LIVE_TEST_USER.email);
      expect(seeded.counts.diaryEntries).toBeGreaterThanOrEqual(2);
      expect(seeded.counts.offlineMutations).toBeGreaterThanOrEqual(4);

      const app = createApp({ db, config, artifactStore });
      const loginResponse = await app.fetch(jsonRequest("/api/auth/login", {
        email: LIVE_TEST_USER.email,
        password: LIVE_TEST_USER.password
      }));
      const cookie = cookieFrom(loginResponse);
      expect(cookie).toContain("anchor_session=");
      await parse(loginResponse);

      const me = await parse(await app.fetch(new Request("http://localhost/api/me", {
        headers: { cookie }
      })));
      expect(me.user.email).toBe(LIVE_TEST_USER.email);
      expect(me.consents.map(consent => consent.type).sort()).toEqual([
        "crisis_limits",
        "privacy_choices",
        "voice_audio"
      ]);

      const checkIn = await parse(await app.fetch(jsonRequest("/api/check-ins", {
        createdAt: new Date().toISOString(),
        anchorContext: "morning",
        primaryEmotionScore: 2,
        primaryUrgeScore: 1,
        energyState: "medium",
        suggestedNextActionStatus: "accepted",
        note: "Generated live API check-in.",
        locationContext: "home"
      }, cookie)));
      expect(checkIn.riskTier).toBe("normal");

      const diary = await parse(await app.fetch(jsonRequest("/api/diary/2026-04-29", {
        entryDate: "2026-04-29",
        anchorCompletion: { morning: "complete", midday: "missed", evening: "complete" },
        emotionRatings: { anxietyFear: 2, sadness: 1, anger: 1, shame: 0, guilt: 1, numbness: 0, joyCalm: 3 },
        urgeRatings: { selfHarm: 0, suicidality: 0, substanceUse: 0, bingeRestrictPurge: 0, isolateAvoid: 2, quitGiveUp: 1, lashOut: 0 },
        targetOccurrences: [{ targetKey: "isolate_avoid", occurrence: "urge_only" }],
        skillsUsed: ["paced_breathing", "stop"],
        overallDayDifficulty: 2,
        optionalFields: {
          sleepDurationMinutes: 430,
          sleepQuality: 3,
          medicationAdherence: "taken",
          notes: "Generated note to verify redaction."
        }
      }, cookie, "PUT")));
      expect(diary.entry.optionalFields.notes).toContain("Generated note");

      const skills = await parse(await app.fetch(new Request("http://localhost/api/skills", {
        headers: { cookie }
      })));
      expect(skills.skills.length).toBeGreaterThan(0);

      const skillSession = await parse(await app.fetch(jsonRequest("/api/skills/paced_breathing/sessions", {
        startedAt: new Date(Date.now() - 60000).toISOString(),
        completedAt: new Date().toISOString(),
        helpfulnessRating: 4,
        sourceContext: "library"
      }, cookie)));
      expect(skillSession.followUpPrompt).toContain("paced breathing");

      const coach = await parse(await app.fetch(jsonRequest("/api/coach/messages", {
        mode: "planning",
        message: "Generated live test: help me choose one small next action.",
        contextRefs: {}
      }, cookie)));
      expect(coach.reply.text).toContain("one must-do");

      const chain = await parse(await app.fetch(jsonRequest("/api/chain-analyses", {
        promptingEvent: "Generated live test prompting event.",
        sourceDiaryEntryId: diary.entry.id
      }, cookie)));
      const completedChain = await parse(await app.fetch(jsonRequest(`/api/chain-analyses/${chain.chainAnalysis.id}`, {
        vulnerabilities: ["poor sleep"],
        links: ["avoidance urge"],
        consequences: ["missed anchor"],
        alternatives: ["text support", "paced breathing"],
        status: "complete"
      }, cookie, "PATCH")));
      expect(completedChain.completionState).toBe("complete");

      const packet = await parse(await app.fetch(jsonRequest("/api/session-packets", {
        dateRange: { start: "2026-04-20", end: "2026-04-29" },
        includedSections: ["diary", "skills", "chains"],
        redactions: { notes: true },
        shareMode: "download"
      }, cookie)));
      expect(packet.downloadUrl).toContain("/api/exports/");

      const download = await app.fetch(new Request(`http://localhost${packet.downloadUrl}`, {
        headers: { cookie }
      }));
      expect(download.ok).toBe(true);
      const artifact = await download.text();
      expect(artifact).toContain("session_packet");
      expect(artifact).not.toContain("Generated note to verify redaction.");

      const privacyExport = await parse(await app.fetch(jsonRequest("/api/privacy/export", {
        format: "json",
        dateRange: { start: "2026-04-20", end: "2026-04-29" }
      }, cookie)));
      expect(privacyExport.downloadUrl).toContain("/api/exports/");

      const offline = await parse(await app.fetch(jsonRequest("/api/sync/offline-queue", {
        clientId: "live-api-client",
        mutations: [
          {
            clientMutationId: `live-api-${Date.now()}`,
            entityType: "quick_check_in",
            operation: "create",
            occurredAt: new Date().toISOString(),
            payload: { mood: 2 }
          },
          {
            clientMutationId: `live-api-routine-${Date.now()}`,
            entityType: "routine_completion",
            operation: "create",
            occurredAt: new Date().toISOString(),
            payload: { anchor: "midday" }
          },
          {
            clientMutationId: `live-api-chain-${Date.now()}`,
            entityType: "chain_analysis",
            operation: "update",
            occurredAt: new Date().toISOString(),
            payload: { status: "draft" }
          }
        ]
      }, cookie)));
      expect(offline.accepted).toHaveLength(3);

      const deleteSignup = await app.fetch(jsonRequest("/api/auth/signup", {
        email: `delete-live-${Date.now()}@anchor.test`,
        password: LIVE_TEST_USER.password,
        timezone: "America/Detroit",
        locale: "en-US"
      }));
      const deleteCookie = cookieFrom(deleteSignup);
      await parse(deleteSignup);
      const deleteRequest = await parse(await app.fetch(jsonRequest("/api/privacy/delete-request", {
        confirmation: "DELETE",
        scope: "all"
      }, deleteCookie)));
      const deleteResult = await parse(await app.fetch(jsonRequest(`/api/privacy/delete-requests/${deleteRequest.deleteRequestId}/execute`, {
        confirmation: "DELETE"
      }, deleteCookie)));
      expect(deleteResult.status).toBe("completed");
    } finally {
      await db.close();
    }
  }, 60000);
});

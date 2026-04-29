import { describe, expect, test } from "bun:test";
import { createApp } from "../../server/app.js";

function request(path, options = {}) {
  return new Request(`http://localhost${path}`, options);
}

function jsonRequest(path, body, method = "POST", headers = {}) {
  return request(path, {
    method,
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

function createMemoryDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const chains = new Map();
  const voiceSessions = new Map();
  const packets = new Map();
  const settings = new Map();
  const exports = [];
  const deletions = [];
  const offlineMutations = new Set();

  return {
    async checkHealth() {
      return true;
    },

    async getTodaySnapshot() {
      return {
        productName: "Anchor",
        snapshotDate: "2026-04-28",
        morningAnchorSummary: "Morning anchor: check in, choose one focus, and cope ahead."
      };
    },

    async createUser({ email, passwordHash, timezone, locale }) {
      const user = {
        id: `user_${users.size + 1}`,
        email,
        passwordHash,
        timezone,
        locale,
        status: "active"
      };
      users.set(email, user);
      return user;
    },

    async getUserByEmail(email) {
      return users.get(email) ?? null;
    },

    async createSession(userId) {
      const session = {
        id: `session_${sessions.size + 1}`,
        token: `token_${sessions.size + 1}`,
        userId
      };
      sessions.set(session.token, session);
      return session;
    },

    async getSessionUser(token) {
      const session = sessions.get(token);
      if (!session) return null;
      return [...users.values()].find(user => user.id === session.userId) ?? null;
    },

    async deleteSession(token) {
      sessions.delete(token);
    },

    async saveConsentRecords(userId, records) {
      const saved = records.map(record => ({ ...record, userId }));
      consents.set(userId, saved);
      return saved;
    },

    async getConsentsForUser(userId) {
      return consents.get(userId) ?? [];
    },

    async createChainAnalysis(userId, chain) {
      const saved = {
        id: `chain_${chains.size + 1}`,
        userId,
        status: "draft",
        promptingEvent: chain.promptingEvent,
        sourceDiaryEntryId: chain.sourceDiaryEntryId,
        vulnerabilities: [],
        links: [],
        consequences: [],
        alternatives: [],
        preventionPlan: null,
        completionState: "draft"
      };
      chains.set(saved.id, saved);
      return saved;
    },

    async updateChainAnalysis(userId, chainId, patch) {
      const current = chains.get(chainId);
      if (!current || current.userId !== userId) return null;
      const next = {
        ...current,
        ...patch,
        status: patch.status ?? current.status
      };
      next.completionState = next.status === "complete" ? "complete" : "draft";
      next.preventionPlan = next.status === "complete"
        ? "Use STOP before the next high-risk link."
        : next.preventionPlan;
      chains.set(chainId, next);
      return next;
    },

    async createVoiceSession(userId, voiceSession) {
      const saved = {
        id: `voice_${voiceSessions.size + 1}`,
        userId,
        mode: voiceSession.mode,
        doNotSave: voiceSession.doNotSave,
        transcriptPreviewEnabled: true,
        status: "active"
      };
      voiceSessions.set(saved.id, saved);
      return saved;
    },

    async endVoiceSession(userId, voiceSessionId, ending) {
      const current = voiceSessions.get(voiceSessionId);
      if (!current || current.userId !== userId) return null;
      const ended = {
        ...current,
        status: "ended",
        endedAt: ending.endedAt,
        transcriptOptIn: ending.transcriptOptIn
      };
      voiceSessions.set(voiceSessionId, ended);
      return ended;
    },

    async getInsights(userId) {
      return {
        cards: [
          { id: "card_1", title: "Structure supports mood", evidenceRefs: ["diary:2026-04-28"] }
        ],
        structureScore: 72,
        trendSeries: [{ date: "2026-04-28", value: 72 }]
      };
    },

    async getWeeklyReview(userId, weekStart) {
      return {
        id: `weekly_${weekStart}`,
        userId,
        weekStart,
        wins: ["Completed skills practice"],
        misses: ["One missed anchor"],
        recommendations: ["Keep morning anchor small"],
        sourceEvidence: ["skill_session:1", "diary:2026-04-28"]
      };
    },

    async createSessionPacket(userId, packet) {
      const saved = {
        id: `packet_${packets.size + 1}`,
        userId,
        dateRange: packet.dateRange,
        includedSections: packet.includedSections,
        redactions: packet.redactions,
        shareMode: packet.shareMode,
        status: "ready"
      };
      packets.set(saved.id, saved);
      return saved;
    },

    async getSessionPacket(userId, packetId) {
      const packet = packets.get(packetId);
      return packet?.userId === userId ? packet : null;
    },

    async saveUserSettings(userId, nextSettings) {
      const saved = {
        transcriptRetentionDays: nextSettings.transcriptRetentionDays,
        traceRetentionDays: nextSettings.traceRetentionDays,
        audioConsent: nextSettings.audioConsent,
        shareConsent: nextSettings.shareConsent,
        notificationOptIn: nextSettings.notificationOptIn ?? false,
        quietHoursStart: nextSettings.quietHoursStart ?? "22:00",
        quietHoursEnd: nextSettings.quietHoursEnd ?? "07:00"
      };
      settings.set(userId, saved);
      return saved;
    },

    async createPrivacyExport(userId, exportRequest) {
      const saved = {
        id: `export_${exports.length + 1}`,
        userId,
        format: exportRequest.format,
        dateRange: exportRequest.dateRange,
        status: "queued"
      };
      exports.push(saved);
      return saved;
    },

    async createDeleteRequest(userId, deleteRequest) {
      const saved = {
        id: `delete_${deletions.length + 1}`,
        userId,
        scope: deleteRequest.scope,
        scheduledDeletionAt: "2026-05-05T00:00:00.000Z"
      };
      deletions.push(saved);
      return saved;
    },

    async applyOfflineMutations(userId, clientId, mutations) {
      const accepted = [];
      const rejected = [];
      for (const mutation of mutations) {
        if (offlineMutations.has(mutation.clientMutationId)) {
          rejected.push({ clientMutationId: mutation.clientMutationId, reason: "duplicate" });
        } else {
          offlineMutations.add(mutation.clientMutationId);
          accepted.push({ clientMutationId: mutation.clientMutationId, entityType: mutation.entityType });
        }
      }
      return { accepted, rejected, needsReview: [] };
    }
  };
}

async function signedInConsentedApp() {
  const app = createApp({ db: createMemoryDb() });
  const signup = await app.fetch(jsonRequest("/api/auth/signup", {
    email: "user@example.com",
    password: "passphrase-123",
    timezone: "America/Detroit",
    locale: "en-US"
  }));
  const cookie = signup.headers.get("set-cookie").split(";")[0];

  await app.fetch(jsonRequest("/api/onboarding/consent", {
    consents: [
      { type: "crisis_limits", granted: true },
      { type: "privacy_choices", granted: true },
      { type: "voice_audio", granted: true }
    ]
  }, "POST", { cookie }));

  return { app, cookie };
}

describe("Pass 8 chain analysis routes", () => {
  test("creates and completes a structured chain analysis", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const createResponse = await app.fetch(jsonRequest("/api/chain-analyses", {
      sourceDiaryEntryId: "diary_1",
      promptingEvent: "Avoided the afternoon anchor."
    }, "POST", { cookie }));
    const created = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created.data.chainAnalysis.promptingEvent).toBe("Avoided the afternoon anchor.");
    expect(created.data.chainAnalysis.completionState).toBe("draft");

    const updateResponse = await app.fetch(jsonRequest(`/api/chain-analyses/${created.data.chainAnalysis.id}`, {
      vulnerabilities: ["low sleep"],
      links: ["urge to isolate"],
      consequences: ["missed anchor"],
      alternatives: ["text support person"],
      status: "complete"
    }, "PATCH", { cookie }));
    const updated = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updated.data.completionState).toBe("complete");
    expect(updated.data.preventionPlan).toBe("Use STOP before the next high-risk link.");
  });
});

describe("Pass 9 live voice coach routes", () => {
  test("creates client secret without leaking server API key and ends voice session", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/voice/client-secret", {
      mode: "skill",
      doNotSave: true,
      contextRefs: {}
    }, "POST", { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.clientSecret.value).toBe("local_voice_client_secret");
    expect(JSON.stringify(payload.data)).not.toContain("OPENAI_API_KEY");
    expect(payload.data.realtimeConfig.transcriptPreviewEnabled).toBe(true);

    const endResponse = await app.fetch(jsonRequest(`/api/voice/sessions/${payload.data.voiceSessionId}/end`, {
      endedAt: "2026-04-28T12:00:00.000Z",
      savedSummary: "Practiced one paced breathing cycle.",
      transcriptOptIn: false
    }, "POST", { cookie }));
    const ended = await endResponse.json();

    expect(endResponse.status).toBe(200);
    expect(ended.data.voiceSession.status).toBe("ended");
    expect(ended.data.artifact).toBe(null);
  });
});

describe("Pass 10 insights and weekly review routes", () => {
  test("returns insight cards and weekly review with evidence refs", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const insightsResponse = await app.fetch(request("/api/insights?range=7d", {
      headers: { cookie }
    }));
    const insights = await insightsResponse.json();

    expect(insightsResponse.status).toBe(200);
    expect(insights.data.structureScore).toBe(72);
    expect(insights.data.cards[0].evidenceRefs).toEqual(["diary:2026-04-28"]);

    const reviewResponse = await app.fetch(request("/api/weekly-review/2026-04-20", {
      headers: { cookie }
    }));
    const review = await reviewResponse.json();

    expect(reviewResponse.status).toBe(200);
    expect(review.data.review.weekStart).toBe("2026-04-20");
    expect(review.data.sourceEvidence).toContain("skill_session:1");
  });
});

describe("Pass 11 session prep export routes", () => {
  test("creates and retrieves a redacted session packet", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const createResponse = await app.fetch(jsonRequest("/api/session-packets", {
      dateRange: { start: "2026-04-20", end: "2026-04-28" },
      includedSections: ["diary", "skills", "chains"],
      redactions: { notes: true },
      shareMode: "download"
    }, "POST", { cookie }));
    const created = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created.data.packet.status).toBe("ready");
    expect(created.data.downloadUrl).toContain("/api/exports/");

    const getResponse = await app.fetch(request(`/api/session-packets/${created.data.packet.id}`, {
      headers: { cookie }
    }));
    const fetched = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(fetched.data.packet.redactions.notes).toBe(true);
  });
});

describe("Pass 12 privacy and retention routes", () => {
  test("saves retention settings and queues export/delete requests", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const settingsResponse = await app.fetch(jsonRequest("/api/me/settings", {
      transcriptRetentionDays: 0,
      traceRetentionDays: 30,
      audioConsent: false,
      shareConsent: false
    }, "PATCH", { cookie }));
    const settings = await settingsResponse.json();

    expect(settingsResponse.status).toBe(200);
    expect(settings.data.settings.transcriptRetentionDays).toBe(0);

    const exportResponse = await app.fetch(jsonRequest("/api/privacy/export", {
      format: "json",
      dateRange: { start: "2026-04-20", end: "2026-04-28" }
    }, "POST", { cookie }));
    const exportPayload = await exportResponse.json();
    expect(exportPayload.data.status).toBe("queued");

    const deleteResponse = await app.fetch(jsonRequest("/api/privacy/delete-request", {
      scope: "all",
      confirmation: "DELETE"
    }, "POST", { cookie }));
    const deletePayload = await deleteResponse.json();
    expect(deletePayload.data.scheduledDeletionAt).toBe("2026-05-05T00:00:00.000Z");
  });
});

describe("Pass 13 offline capture and PWA routes", () => {
  test("accepts idempotent offline mutations and notification settings", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const settingsResponse = await app.fetch(jsonRequest("/api/me/settings", {
      transcriptRetentionDays: 0,
      traceRetentionDays: 30,
      audioConsent: false,
      shareConsent: false,
      notificationOptIn: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00"
    }, "PATCH", { cookie }));
    const settings = await settingsResponse.json();
    expect(settings.data.settings.notificationOptIn).toBe(true);

    const syncResponse = await app.fetch(jsonRequest("/api/sync/offline-queue", {
      clientId: "device-1",
      mutations: [
        {
          clientMutationId: "mutation-1",
          entityType: "quick_check_in",
          operation: "create",
          occurredAt: "2026-04-28T12:00:00.000Z",
          payload: { mood: 3 }
        }
      ]
    }, "POST", { cookie }));
    const sync = await syncResponse.json();

    expect(syncResponse.status).toBe(200);
    expect(sync.data.accepted).toEqual([{ clientMutationId: "mutation-1", entityType: "quick_check_in" }]);
    expect(sync.data.needsReview).toEqual([]);
  });
});

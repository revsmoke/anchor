import { describe, expect, test } from "bun:test";
import { createApp } from "../../server/app.js";
import { getServerConfig } from "../../server/config.js";
import { runPrivateBetaReadiness } from "../../server/readiness.js";

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

function createHardeningMemoryDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const voiceSessions = new Map();
  const packets = new Map();
  const exports = new Map();
  const deletions = new Map();
  const auditEvents = [];
  const offlineMutations = new Set();
  const deletedUsers = new Set();

  return {
    deletedUsers,
    auditEvents,

    async checkHealth() {
      return true;
    },

    async getRequiredTableNames() {
      return [
        "users",
        "sessions",
        "consent_records",
        "voice_sessions",
        "session_packets",
        "privacy_exports",
        "delete_requests",
        "export_artifacts",
        "audit_events",
        "offline_mutations"
      ];
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
      if (!session || deletedUsers.has(session.userId)) return null;
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

    async createVoiceSession(userId, voiceSession) {
      const saved = {
        id: `voice_${voiceSessions.size + 1}`,
        userId,
        mode: voiceSession.mode,
        doNotSave: voiceSession.doNotSave,
        transcriptPreviewEnabled: true,
        openAiCallId: voiceSession.openAiCallId,
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

    async getSessionExportData() {
      return {
        diaryEntries: [
          {
            entryDate: "2026-04-28",
            optionalFields: { notes: "private note that must be redacted" },
            overallDayDifficulty: 2
          }
        ],
        skillSessions: [{ skillId: "paced_breathing", helpfulnessRating: 4 }],
        chainAnalyses: [{ promptingEvent: "Avoided anchor", preventionPlan: "Use STOP." }]
      };
    },

    async createExportArtifact(userId, artifact) {
      const saved = {
        id: `artifact_${exports.size + 1}`,
        userId,
        ...artifact,
        status: "ready"
      };
      exports.set(saved.id, saved);
      return saved;
    },

    async getExportArtifact(userId, artifactId) {
      const artifact = exports.get(artifactId);
      return artifact?.userId === userId ? artifact : null;
    },

    async markSessionPacketArtifact(userId, packetId, artifactId) {
      const packet = packets.get(packetId);
      if (packet?.userId === userId) packet.artifactId = artifactId;
      return packet;
    },

    async createPrivacyExport(userId, exportRequest) {
      const saved = {
        id: `export_${exports.size + 1}`,
        userId,
        format: exportRequest.format,
        dateRange: exportRequest.dateRange,
        status: "queued"
      };
      return saved;
    },

    async getPrivacyExportData(userId) {
      return {
        userId,
        voiceSessions: [...voiceSessions.values()].filter(session => session.userId === userId),
        sessionPackets: [...packets.values()].filter(packet => packet.userId === userId)
      };
    },

    async createDeleteRequest(userId, deleteRequest) {
      const saved = {
        id: `delete_${deletions.size + 1}`,
        userId,
        scope: deleteRequest.scope,
        scheduledDeletionAt: "2026-05-05T00:00:00.000Z",
        status: "scheduled"
      };
      deletions.set(saved.id, saved);
      return saved;
    },

    async executeDeleteRequest(userId, deleteRequestId) {
      const request = deletions.get(deleteRequestId);
      if (!request || request.userId !== userId) return null;
      deletedUsers.add(userId);
      for (const [artifactId, artifact] of exports.entries()) {
        if (artifact.userId === userId) exports.delete(artifactId);
      }
      const completed = {
        ...request,
        status: "completed",
        completedAt: "2026-05-05T00:00:00.000Z"
      };
      deletions.set(deleteRequestId, completed);
      return completed;
    },

    async saveUserSettings(userId, settings) {
      return { userId, ...settings };
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
    },

    async saveAuditEvent(userId, event) {
      const saved = {
        id: `audit_${auditEvents.length + 1}`,
        userId,
        ...event
      };
      auditEvents.push(saved);
      return saved;
    }
  };
}

async function signedInConsentedApp(options = {}) {
  const db = options.db ?? createHardeningMemoryDb();
  const app = createApp({
    db,
    config: options.config,
    realtimeClient: options.realtimeClient,
    artifactStore: options.artifactStore
  });
  const signup = await app.fetch(jsonRequest("/api/auth/signup", {
    email: "hardening@example.com",
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

  return { app, db, cookie };
}

describe("Production hardening: security and config", () => {
  test("production config rejects missing private-beta secrets", () => {
    expect(() => getServerConfig({
      APP_ENV: "production",
      DATABASE_URL: "postgres://example/db"
    })).toThrow("Missing required production environment variables");
  });

  test("production cookies are secure and cookie-authenticated mutations require CSRF", async () => {
    const db = createHardeningMemoryDb();
    const config = {
      appEnv: "production",
      databaseUrl: "postgres://example/db",
      openaiApiKey: "sk-test",
      realtimeModel: "gpt-realtime",
      textModel: "gpt-4.1-mini",
      traceRetentionDays: 30,
      csrfProtection: true,
      secureCookies: true
    };
    const app = createApp({ db, config });
    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "prod@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));
    const sessionCookie = signup.headers.get("set-cookie").split(";")[0];

    expect(signup.headers.get("set-cookie")).toContain("Secure");
    expect(signup.headers.get("x-request-id")).toStartWith("req_");

    const blocked = await app.fetch(jsonRequest("/api/onboarding/consent", {
      consents: [
        { type: "crisis_limits", granted: true },
        { type: "privacy_choices", granted: true },
        { type: "voice_audio", granted: true }
      ]
    }, "POST", { cookie: sessionCookie }));
    expect(blocked.status).toBe(403);

    const csrf = await app.fetch(request("/api/csrf", { headers: { cookie: sessionCookie } }));
    const csrfPayload = await csrf.json();
    const csrfCookie = csrf.headers.get("set-cookie").split(";")[0];
    const allowed = await app.fetch(jsonRequest("/api/onboarding/consent", {
      consents: [
        { type: "crisis_limits", granted: true },
        { type: "privacy_choices", granted: true },
        { type: "voice_audio", granted: true }
      ]
    }, "POST", {
      cookie: `${sessionCookie}; ${csrfCookie}`,
      "x-csrf-token": csrfPayload.data.csrfToken
    }));
    expect(allowed.status).toBe(200);
  });
});

describe("Production hardening: voice", () => {
  test("creates server-mediated WebRTC session and hangs up by OpenAI call id", async () => {
    const calls = [];
    const hangups = [];
    const realtimeClient = {
      async createCall(input) {
        calls.push(input);
        return {
          sdpAnswer: "v=0\r\no=- 2 2 IN IP4 127.0.0.1\r\ns=Anchor Answer\r\n",
          openAiCallId: "call_123"
        };
      },
      async hangup(openAiCallId) {
        hangups.push(openAiCallId);
        return true;
      }
    };
    const { app, cookie } = await signedInConsentedApp({
      realtimeClient,
      config: {
        appEnv: "test",
        openaiApiKey: "sk-test",
        realtimeModel: "gpt-realtime",
        textModel: "gpt-4.1-mini",
        traceRetentionDays: 30
      }
    });

    const response = await app.fetch(jsonRequest("/api/voice/client-secret", {
      mode: "skill",
      doNotSave: true,
      contextRefs: {},
      sdpOffer: "v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=Anchor Offer\r\n"
    }, "POST", { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.sdpAnswer).toContain("Anchor Answer");
    expect(payload.data.openAiCallId).toBe("call_123");
    expect(JSON.stringify(payload.data)).not.toContain("OPENAI_API_KEY");
    expect(calls[0].session.model).toBe("gpt-realtime");

    const endResponse = await app.fetch(jsonRequest(`/api/voice/sessions/${payload.data.voiceSessionId}/end`, {
      endedAt: "2026-04-28T12:00:00.000Z",
      savedSummary: "Practiced one paced breathing cycle.",
      transcriptOptIn: false
    }, "POST", { cookie }));
    expect(endResponse.status).toBe(200);
    expect(hangups).toEqual(["call_123"]);
  });
});

describe("Production hardening: exports, deletion, audit, readiness", () => {
  test("generates redacted JSON session packet artifact and authenticated download", async () => {
    const artifacts = new Map();
    const artifactStore = {
      async writeJson({ artifactId, payload }) {
        artifacts.set(artifactId, payload);
        return {
          storageKey: `memory://${artifactId}.json`,
          byteSize: JSON.stringify(payload).length
        };
      },
      async readJson(storageKey) {
        return artifacts.get(storageKey.replace("memory://", "").replace(".json", ""));
      },
      async delete(storageKey) {
        artifacts.delete(storageKey.replace("memory://", "").replace(".json", ""));
      }
    };
    const { app, cookie } = await signedInConsentedApp({ artifactStore });

    const createResponse = await app.fetch(jsonRequest("/api/session-packets", {
      dateRange: { start: "2026-04-20", end: "2026-04-28" },
      includedSections: ["diary", "skills", "chains"],
      redactions: { notes: true },
      shareMode: "download"
    }, "POST", { cookie }));
    const created = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created.data.downloadUrl).toContain("/api/exports/artifact_1/download");

    const download = await app.fetch(request(created.data.downloadUrl, { headers: { cookie } }));
    const artifact = await download.json();

    expect(download.status).toBe(200);
    expect(JSON.stringify(artifact)).not.toContain("private note that must be redacted");
    expect(artifact.packet.includedSections).toEqual(["diary", "skills", "chains"]);
  });

  test("executes privacy deletion and records audit event", async () => {
    const db = createHardeningMemoryDb();
    const { app, cookie } = await signedInConsentedApp({ db });

    const requestResponse = await app.fetch(jsonRequest("/api/privacy/delete-request", {
      scope: "all",
      confirmation: "DELETE"
    }, "POST", { cookie }));
    const requested = await requestResponse.json();

    const executeResponse = await app.fetch(jsonRequest(`/api/privacy/delete-requests/${requested.data.deleteRequestId}/execute`, {
      confirmation: "DELETE"
    }, "POST", { cookie }));
    const executed = await executeResponse.json();

    expect(executeResponse.status).toBe(200);
    expect(executed.data.status).toBe("completed");
    expect(db.deletedUsers.has("user_1")).toBe(true);
    expect(db.auditEvents.some(event => event.eventType === "privacy_delete_completed")).toBe(true);
  });

  test("private-beta readiness checks required config, db, and health", async () => {
    const db = createHardeningMemoryDb();
    const result = await runPrivateBetaReadiness({
      db,
      config: {
        appEnv: "production",
        appOrigin: "https://anchor.example",
        databaseUrl: "postgres://example/db",
        sessionSecret: "private-beta-session-secret",
        openaiApiKey: "sk-test",
        realtimeModel: "gpt-realtime",
        textModel: "gpt-4.1-mini",
        traceRetentionDays: 30
      }
    });

    expect(result.ok).toBe(true);
    expect(result.checks.map(check => check.name)).toContain("required_tables");
  });
});

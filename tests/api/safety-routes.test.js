import { describe, expect, test } from "bun:test";
import { createApp } from "../../server/app.js";

function request(path, options = {}) {
  return new Request(`http://localhost${path}`, options);
}

function jsonRequest(method, path, body, headers = {}) {
  return request(path, {
    method,
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

function createMemorySafetyDb({ activeEpisode = null } = {}) {
  const safetyPlan = {
    userId: "user_1",
    warningSigns: [],
    steps: [],
    contacts: [],
    crisisResources: [
      { label: "Call 911", value: "911" },
      { label: "Call or text 988", value: "988" }
    ]
  };
  const safetyEvents = [];
  const safetyEpisodes = activeEpisode ? [{ ...activeEpisode }] : [];
  const voiceSessions = new Map([[
    "voice_session_1",
    { id: "voice_session_1", userId: "user_1", openAiCallId: "local_realtime_call", status: "active" }
  ]]);

  return {
    async getSessionUser(token) {
      if (token !== "token_1") return null;
      return { id: "user_1", email: "u@example.com", timezone: "America/Detroit", locale: "en-US", status: "active" };
    },
    async getConsentsForUser() {
      return [
        { type: "crisis_limits", granted: true },
        { type: "privacy_choices", granted: true },
        { type: "voice_audio", granted: true }
      ];
    },
    async deleteSession(token) {
      return token === "token_1";
    },
    async getSafetyPlan(userId) {
      return { ...safetyPlan, userId };
    },
    async saveSafetyPlan(userId, plan) {
      Object.assign(safetyPlan, { userId, ...plan });
      return { ...safetyPlan };
    },
    async listSafetyEvents(userId) {
      return safetyEvents.filter(event => event.userId === userId);
    },
    async saveSafetyEvent(userId, event) {
      const saved = {
        id: `safety_event_${safetyEvents.length + 1}`,
        userId,
        detectedAt: "2026-05-14T12:00:00.000Z",
        resolutionStatus: "open",
        resolutionNote: "",
        resolvedAt: null,
        ...event
      };
      if (event.riskTier === "acute") {
        const episode = {
          id: `safety_episode_${safetyEpisodes.length + 1}`,
          userId,
          status: "active",
          openedAt: saved.detectedAt,
          resolvedAt: null,
          sourceEventId: saved.id
        };
        safetyEpisodes.push(episode);
        saved.safetyEpisodeId = episode.id;
        saved.safetyEpisode = episode;
      }
      safetyEvents.push(saved);
      return saved;
    },
    async resolveSafetyEvent(userId, eventId, resolution) {
      const event = safetyEvents.find(candidate => candidate.userId === userId && candidate.id === eventId);
      if (!event) return null;
      event.resolutionStatus = resolution.resolutionStatus;
      event.resolutionNote = resolution.resolutionNote;
      event.resolvedAt = resolution.resolvedAt;
      const episode = safetyEpisodes.find(candidate => candidate.id === event.safetyEpisodeId);
      if (episode) {
        episode.status = "resolved";
        episode.resolvedAt = resolution.resolvedAt;
        event.safetyEpisode = episode;
      }
      return event;
    },
    async getActiveSafetyEpisode(userId) {
      return safetyEpisodes.find(episode => episode.userId === userId && episode.status === "active") ?? null;
    },
    async resetTodayPlan() {
      return {
        dailyPlan: { id: "plan_1", date: "2026-05-14", nextBestStep: "Reset today." },
        anchors: [],
        nextBestStep: "Reset today."
      };
    },
    async saveTodayFocusPlan(userId, focusPlan) {
      return { id: "focus_1", userId, planDate: "2026-05-14", ...focusPlan };
    },
    async endVoiceSession(userId, voiceSessionId, endPayload) {
      const session = voiceSessions.get(voiceSessionId);
      if (!session || session.userId !== userId) return null;
      const ended = { ...session, ...endPayload, status: "ended" };
      voiceSessions.set(voiceSessionId, ended);
      return ended;
    }
  };
}

describe("safety plan and event routes", () => {
  test("safety plan routes require auth and support read/create/update", async () => {
    const app = createApp({ db: createMemorySafetyDb() });
    const cookie = "anchor_session=token_1";

    const unauthorized = await app.fetch(request("/api/safety-plan"));
    expect(unauthorized.status).toBe(401);

    const created = await app.fetch(jsonRequest("POST", "/api/safety-plan", {
      warningSigns: ["urge spike"],
      steps: ["paced breathing"],
      contacts: [{ name: "Taylor", relationship: "friend", phone: "555-0100" }],
      crisisResources: [{ label: "Call or text 988", value: "988" }]
    }, { cookie }));
    expect(created.status).toBe(201);
    expect((await created.json()).data.safetyPlan).toMatchObject({
      warningSigns: ["urge spike"],
      steps: ["paced breathing"],
      contacts: [{ name: "Taylor", relationship: "friend", phone: "555-0100" }]
    });

    const updated = await app.fetch(jsonRequest("PUT", "/api/safety-plan", {
      warningSigns: ["shutting down"],
      steps: ["text Taylor"],
      contacts: [{ name: "Taylor", relationship: "friend", phone: "555-0100" }],
      crisisResources: [{ label: "Call 911", value: "911" }]
    }, { cookie }));
    expect(updated.status).toBe(200);

    const read = await app.fetch(request("/api/safety-plan", { headers: { cookie } }));
    expect((await read.json()).data.safetyPlan).toMatchObject({
      warningSigns: ["shutting down"],
      steps: ["text Taylor"],
      crisisResources: [{ label: "Call 911", value: "911" }]
    });
  });

  test("safety event routes log, list, and resolve acute events with a persisted episode", async () => {
    const app = createApp({ db: createMemorySafetyDb() });
    const cookie = "anchor_session=token_1";

    const created = await app.fetch(jsonRequest("POST", "/api/safety-events", {
      riskTier: "acute",
      triggerType: "voice_tool",
      outcome: "acute_lock",
      context: { source: "test" }
    }, { cookie }));
    const createdBody = await created.json();

    expect(created.status).toBe(201);
    expect(createdBody.data.safetyEvent).toMatchObject({
      id: "safety_event_1",
      riskTier: "acute",
      outcome: "acute_lock",
      resolutionStatus: "open",
      safetyEpisodeId: "safety_episode_1"
    });
    expect(createdBody.data.safetyEpisode).toMatchObject({
      id: "safety_episode_1",
      status: "active",
      sourceEventId: "safety_event_1"
    });

    const list = await app.fetch(request("/api/safety-events", { headers: { cookie } }));
    expect((await list.json()).data.safetyEvents).toHaveLength(1);

    const resolved = await app.fetch(jsonRequest("PUT", "/api/safety-events/safety_event_1/resolution", {
      resolutionStatus: "resolved",
      resolutionNote: "User reached support.",
      resolvedAt: "2026-05-14T12:05:00.000Z"
    }, { cookie }));
    const resolvedBody = await resolved.json();

    expect(resolved.status).toBe(200);
    expect(resolvedBody.data.safetyEvent).toMatchObject({
      id: "safety_event_1",
      resolutionStatus: "resolved",
      resolutionNote: "User reached support.",
      resolvedAt: "2026-05-14T12:05:00.000Z"
    });
    expect(resolvedBody.data.safetyEpisode).toMatchObject({
      id: "safety_episode_1",
      status: "resolved",
      resolvedAt: "2026-05-14T12:05:00.000Z"
    });
  });

  test("acute safety episode locks normal writes while preserving the recovery allowlist", async () => {
    const app = createApp({
      db: createMemorySafetyDb({
        activeEpisode: {
          id: "safety_episode_active",
          userId: "user_1",
          status: "active",
          openedAt: "2026-05-14T12:00:00.000Z",
          sourceEventId: "safety_event_1"
        }
      }),
      realtimeClient: {
        async hangup() {
          return true;
        }
      }
    });
    const cookie = "anchor_session=token_1";

    const blockedReset = await app.fetch(jsonRequest("POST", "/api/today/reset", {
      mode: "minimum_viable_day",
      mustDos: ["call support"],
      defer: [],
      regulationAction: "paced breathing"
    }, { cookie }));
    expect(blockedReset.status).toBe(423);
    expect((await blockedReset.json()).error.code).toBe("acute_safety_lock");

    const blockedFocus = await app.fetch(jsonRequest("POST", "/api/today/focus-plan", {
      focusText: "email",
      anticipatedHardMoment: "later",
      plannedSkill: "paced breathing"
    }, { cookie }));
    expect(blockedFocus.status).toBe(423);

    const plan = await app.fetch(request("/api/safety-plan", { headers: { cookie } }));
    expect(plan.status).toBe(200);

    const appended = await app.fetch(jsonRequest("POST", "/api/safety-events", {
      riskTier: "acute",
      triggerType: "voice_tool",
      outcome: "acute_lock",
      context: { source: "test" }
    }, { cookie }));
    expect(appended.status).toBe(201);

    const resolved = await app.fetch(jsonRequest("PUT", "/api/safety-events/safety_event_1/resolution", {
      resolutionStatus: "resolved",
      resolutionNote: "User reached support.",
      resolvedAt: "2026-05-14T12:05:00.000Z"
    }, { cookie }));
    expect(resolved.status).toBe(200);

    const voiceEnded = await app.fetch(jsonRequest("POST", "/api/voice/sessions/voice_session_1/end", {
      endedAt: "2026-05-14T12:06:00.000Z",
      transcriptOptIn: false,
      savedSummary: ""
    }, { cookie }));
    expect(voiceEnded.status).toBe(200);

    const logout = await app.fetch(jsonRequest("POST", "/api/auth/logout", {}, { cookie }));
    expect(logout.status).toBe(200);
  });
});

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

function createMemoryCoachDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const agentRuns = [];
  const safetyEvents = [];

  return {
    async checkHealth() {
      return true;
    },

    async getTodaySnapshot() {
      return {
        productName: "Anchor",
        snapshotDate: "2026-04-26",
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

    async saveAgentRun(userId, run) {
      const saved = {
        id: `agent_run_${agentRuns.length + 1}`,
        userId,
        ...run
      };
      agentRuns.push(saved);
      return saved;
    },

    async saveSafetyEvent(userId, event) {
      const saved = {
        id: `safety_event_${safetyEvents.length + 1}`,
        userId,
        ...event
      };
      safetyEvents.push(saved);
      return saved;
    }
  };
}

async function signedInConsentedApp() {
  const app = createApp({ db: createMemoryCoachDb() });
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

describe("Pass 7 text coach with safety gate", () => {
  test("POST /api/coach/messages returns normal structured coaching with trace", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/coach/messages", {
      message: "I missed the morning and feel behind.",
      mode: "reset",
      contextRefs: {
        dailyPlanId: "plan_1",
        latestCheckInId: "check_in_1"
      }
    }, "POST", { cookie }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        reply: {
          text: "Let's reduce the day to one must-do.",
          nextAction: {
            type: "day_reset",
            label: "Choose one must-do"
          }
        },
        agentRun: {
          id: "agent_run_1",
          userId: "user_1",
          agentName: "Anchor Orchestrator",
          specialistsUsed: ["Structure Coach"],
          riskTier: "normal",
          mode: "reset",
          inputFingerprint: "len:37",
          safetyDecision: {
            triggerType: "coach_message",
            outcome: "normal_coaching"
          },
          contextRefs: {
            dailyPlanId: "plan_1",
            latestCheckInId: "check_in_1"
          }
        },
        riskTier: "normal",
        nextAction: {
          type: "day_reset",
          label: "Choose one must-do"
        }
      }
    });
  });

  test("POST /api/coach/messages returns Safety Mode instead of coaching for elevated text", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/coach/messages", {
      message: "I am not sure I can stay safe tonight.",
      mode: "skill",
      contextRefs: {}
    }, "POST", { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.reply).toBeUndefined();
    expect(payload.data.riskTier).toBe("elevated");
    expect(payload.data.safetyMode).toEqual({
      title: "Safety Mode",
      message: "Are you safe right now?",
      groundingSkill: "Paced Breathing",
      crisisResources: ["911", "988"],
      normalCoachingLocked: false
    });
    expect(payload.data.agentRun.agentName).toBe("Safety Guardian");
    expect(payload.data.agentRun.specialistsUsed).toEqual(["Safety Guardian"]);
    expect(payload.data.agentRun.inputFingerprint).toBe("len:38");
    expect(payload.data.safetyEvent.outcome).toBe("safety_mode");
  });

  test("POST /api/coach/messages locks normal coaching for acute text", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/coach/messages", {
      message: "I have a plan to kill myself tonight and cannot stay safe.",
      mode: "freeform",
      contextRefs: {}
    }, "POST", { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.reply).toBeUndefined();
    expect(payload.data.riskTier).toBe("acute");
    expect(payload.data.safetyMode).toEqual({
      title: "Emergency support now",
      message: "Normal coaching is locked for this session. Use emergency support or contact a trusted person now.",
      groundingSkill: null,
      crisisResources: ["911", "988"],
      normalCoachingLocked: true
    });
    expect(payload.data.safetyEvent.riskTier).toBe("acute");
    expect(payload.data.safetyEvent.outcome).toBe("acute_lock");
  });

  test("POST /api/coach/messages validates message and mode", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/coach/messages", {
      message: "",
      mode: "unknown",
      contextRefs: {}
    }, "POST", { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("invalid_coach_message");
  });
});

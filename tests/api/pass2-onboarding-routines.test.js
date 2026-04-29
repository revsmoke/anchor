import { describe, expect, test } from "bun:test";
import { createApp } from "../../server/app.js";

function request(path, options = {}) {
  return new Request(`http://localhost${path}`, options);
}

function jsonRequest(path, body, headers = {}) {
  return request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

function createMemoryOnboardingDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const profiles = new Map();
  const routineTemplates = new Map();
  const routineInstances = new Map();
  const dailyPlans = new Map();

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

    async saveUserProfile(userId, profile) {
      const saved = {
        id: `profile_${userId}`,
        userId,
        ...profile
      };
      profiles.set(userId, saved);
      return saved;
    },

    async saveRoutineSetup(userId, anchors) {
      const templates = anchors.map((anchor, index) => ({
        id: `template_${index + 1}`,
        userId,
        type: anchor.type,
        targetTime: anchor.targetTime,
        steps: anchor.steps
      }));
      const today = templates.map((template, index) => ({
        id: `instance_${index + 1}`,
        userId,
        routineTemplateId: template.id,
        type: template.type,
        targetTime: template.targetTime,
        status: "scheduled"
      }));
      const dailyPlan = {
        id: `daily_plan_${userId}`,
        userId,
        date: "2026-04-26",
        nextBestStep: "Start your morning anchor."
      };

      routineTemplates.set(userId, templates);
      routineInstances.set(userId, today);
      dailyPlans.set(userId, dailyPlan);

      return {
        routineTemplates: templates,
        today,
        dailyPlan
      };
    }
  };
}

async function signedInConsentedApp() {
  const app = createApp({ db: createMemoryOnboardingDb() });
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
  }, { cookie }));

  return { app, cookie };
}

describe("Pass 2 onboarding and routine setup routes", () => {
  test("POST /api/onboarding/profile saves the user's rhythm and care context", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/onboarding/profile", {
      timezone: "America/Detroit",
      wakeTime: "07:00",
      sleepTime: "23:00",
      goals: ["stability", "routine"],
      struggles: ["mornings", "avoidance"],
      therapyStatus: "in_therapy"
    }, { cookie }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        profile: {
          id: "profile_user_1",
          userId: "user_1",
          timezone: "America/Detroit",
          wakeTime: "07:00",
          sleepTime: "23:00",
          goals: ["stability", "routine"],
          struggles: ["mornings", "avoidance"],
          therapyStatus: "in_therapy"
        }
      }
    });
  });

  test("POST /api/onboarding/profile requires saved consent", async () => {
    const app = createApp({ db: createMemoryOnboardingDb() });
    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "user@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    const response = await app.fetch(jsonRequest("/api/onboarding/profile", {
      timezone: "America/Detroit",
      wakeTime: "07:00",
      sleepTime: "23:00",
      goals: ["stability"],
      struggles: ["mornings"],
      therapyStatus: "in_therapy"
    }, { cookie: signup.headers.get("set-cookie").split(";")[0] }));

    expect(response.status).toBe(403);
  });

  test("POST /api/onboarding/routines creates three anchor templates, today instances, and a daily plan", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/onboarding/routines", {
      anchors: [
        { type: "morning", targetTime: "07:30", steps: ["check_in", "top_focus", "cope_ahead"] },
        { type: "midday", targetTime: "12:30", steps: ["status", "reset", "skill"] },
        { type: "evening", targetTime: "21:00", steps: ["diary", "reflect", "tomorrow"] }
      ]
    }, { cookie }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        routineTemplates: [
          { id: "template_1", userId: "user_1", type: "morning", targetTime: "07:30", steps: ["check_in", "top_focus", "cope_ahead"] },
          { id: "template_2", userId: "user_1", type: "midday", targetTime: "12:30", steps: ["status", "reset", "skill"] },
          { id: "template_3", userId: "user_1", type: "evening", targetTime: "21:00", steps: ["diary", "reflect", "tomorrow"] }
        ],
        today: [
          { id: "instance_1", userId: "user_1", routineTemplateId: "template_1", type: "morning", targetTime: "07:30", status: "scheduled" },
          { id: "instance_2", userId: "user_1", routineTemplateId: "template_2", type: "midday", targetTime: "12:30", status: "scheduled" },
          { id: "instance_3", userId: "user_1", routineTemplateId: "template_3", type: "evening", targetTime: "21:00", status: "scheduled" }
        ],
        dailyPlan: {
          id: "daily_plan_user_1",
          userId: "user_1",
          date: "2026-04-26",
          nextBestStep: "Start your morning anchor."
        }
      }
    });
  });

  test("POST /api/onboarding/routines requires exactly morning, midday, and evening anchors", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/onboarding/routines", {
      anchors: [
        { type: "morning", targetTime: "07:30", steps: ["check_in"] }
      ]
    }, { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("invalid_routine_setup");
  });
});

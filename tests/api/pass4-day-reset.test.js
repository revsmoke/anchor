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

function createMemoryDayResetDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const routineInstances = new Map();
  const dailyPlans = new Map();
  const resetHistory = new Map();

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
      return { id: `profile_${userId}`, userId, ...profile };
    },

    async saveRoutineSetup(userId, anchors) {
      const today = anchors.map((anchor, index) => ({
        id: `instance_${index + 1}`,
        userId,
        routineTemplateId: `template_${index + 1}`,
        type: anchor.type,
        targetTime: anchor.targetTime,
        status: "scheduled"
      }));
      routineInstances.set(userId, today);

      const dailyPlan = {
        id: `daily_plan_${userId}`,
        userId,
        date: "2026-04-26",
        mode: "full_day",
        mustDos: [],
        deferredItems: [],
        regulationAction: "",
        nextBestStep: "Start your morning anchor."
      };
      dailyPlans.set(userId, dailyPlan);
      resetHistory.set(userId, []);

      return {
        routineTemplates: anchors.map((anchor, index) => ({
          id: `template_${index + 1}`,
          userId,
          type: anchor.type,
          targetTime: anchor.targetTime,
          steps: anchor.steps
        })),
        today,
        dailyPlan
      };
    },

    async resetTodayPlan(userId, reset) {
      const history = resetHistory.get(userId) ?? [];
      history.push({ previousPlan: dailyPlans.get(userId), reset });
      resetHistory.set(userId, history);

      const dailyPlan = {
        ...dailyPlans.get(userId),
        mode: reset.mode,
        mustDos: reset.mustDos,
        deferredItems: reset.defer,
        regulationAction: reset.regulationAction,
        nextBestStep: `Minimum viable day set: do ${reset.mustDos[0]}, then take ${reset.regulationAction}.`,
        resetHistoryCount: history.length
      };
      dailyPlans.set(userId, dailyPlan);

      return {
        dailyPlan,
        anchors: routineInstances.get(userId),
        nextBestStep: dailyPlan.nextBestStep
      };
    }
  };
}

async function onboardedApp() {
  const app = createApp({ db: createMemoryDayResetDb() });
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

  await app.fetch(jsonRequest("/api/onboarding/profile", {
    timezone: "America/Detroit",
    wakeTime: "07:00",
    sleepTime: "23:00",
    goals: ["stability"],
    struggles: ["mornings"],
    therapyStatus: "self_directed"
  }, { cookie }));

  await app.fetch(jsonRequest("/api/onboarding/routines", {
    anchors: [
      { type: "morning", targetTime: "07:30", steps: ["check_in", "top_focus", "cope_ahead"] },
      { type: "midday", targetTime: "12:30", steps: ["status", "reset", "skill"] },
      { type: "evening", targetTime: "21:00", steps: ["diary", "reflect", "tomorrow"] }
    ]
  }, { cookie }));

  return { app, cookie };
}

describe("Pass 4 day reset and minimum viable day", () => {
  test("POST /api/today/reset updates the daily plan without deleting anchor history", async () => {
    const { app, cookie } = await onboardedApp();

    const response = await app.fetch(jsonRequest("/api/today/reset", {
      mode: "minimum_viable_day",
      mustDos: ["therapy"],
      defer: ["errands", "long messages"],
      regulationAction: "10-min walk"
    }, { cookie }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        dailyPlan: {
          id: "daily_plan_user_1",
          userId: "user_1",
          date: "2026-04-26",
          mode: "minimum_viable_day",
          mustDos: ["therapy"],
          deferredItems: ["errands", "long messages"],
          regulationAction: "10-min walk",
          nextBestStep: "Minimum viable day set: do therapy, then take 10-min walk.",
          resetHistoryCount: 1
        },
        anchors: [
          { id: "instance_1", userId: "user_1", routineTemplateId: "template_1", type: "morning", targetTime: "07:30", status: "scheduled" },
          { id: "instance_2", userId: "user_1", routineTemplateId: "template_2", type: "midday", targetTime: "12:30", status: "scheduled" },
          { id: "instance_3", userId: "user_1", routineTemplateId: "template_3", type: "evening", targetTime: "21:00", status: "scheduled" }
        ],
        nextBestStep: "Minimum viable day set: do therapy, then take 10-min walk."
      }
    });
  });

  test("POST /api/today/reset validates required reset fields", async () => {
    const { app, cookie } = await onboardedApp();

    const response = await app.fetch(jsonRequest("/api/today/reset", {
      mode: "minimum_viable_day",
      mustDos: [],
      defer: ["errands"],
      regulationAction: "10-min walk"
    }, { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("invalid_day_reset");
  });

  test("POST /api/today/reset requires an active session", async () => {
    const { app } = await onboardedApp();

    const response = await app.fetch(jsonRequest("/api/today/reset", {
      mode: "minimum_viable_day",
      mustDos: ["therapy"],
      defer: ["errands"],
      regulationAction: "10-min walk"
    }));

    expect(response.status).toBe(401);
  });
});

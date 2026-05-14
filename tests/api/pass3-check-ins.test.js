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

function createMemoryCheckInDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const profiles = new Map();
  const routineInstances = new Map();
  const quickCheckIns = new Map();
  const safetyEvents = [];
  const dailyPlans = new Map();
  const focusPlans = new Map();

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

    async getAppBootstrap(userId) {
      const userConsents = consents.get(userId) ?? [];
      const today = routineInstances.get(userId) ?? [];
      return {
        consents: userConsents,
        consentComplete: true,
        onboardingComplete: profiles.has(userId) && today.length === 3,
        today,
        dailyPlan: dailyPlans.get(userId) ?? null,
        focusPlan: focusPlans.get(userId) ?? null,
        nextStep: "main_app"
      };
    },

    async saveUserProfile(userId, profile) {
      const saved = { id: `profile_${userId}`, userId, ...profile };
      profiles.set(userId, saved);
      return saved;
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
        nextBestStep: "Start your morning anchor."
      };
      dailyPlans.set(userId, dailyPlan);

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

    async saveQuickCheckIn(userId, checkIn, recommendation) {
      const saved = {
        id: `check_in_${quickCheckIns.size + 1}`,
        userId,
        ...checkIn,
        riskTier: recommendation.riskTier,
        suggestedNextAction: recommendation.suggestedNextAction
      };
      quickCheckIns.set(saved.id, saved);
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
    },

    async completeRoutineInstance(userId, anchorId, completion) {
      const anchors = routineInstances.get(userId) ?? [];
      const anchor = anchors.find(candidate => candidate.id === anchorId);
      if (!anchor) return null;

      anchor.status = "complete";
      anchor.completedAt = completion.completedAt;
      anchor.completedCheckInId = completion.checkInId;

      const dailyPlan = dailyPlans.get(userId) ?? {
        id: `plan_${userId}`,
        userId,
        date: "2026-04-26",
        nextBestStep: "Start your morning anchor."
      };
      dailyPlan.nextBestStep = "Midday anchor is next.";
      dailyPlans.set(userId, dailyPlan);

      return {
        anchor,
        dailyPlan,
        nextBestStep: dailyPlan.nextBestStep
      };
    },

    async getTodayFocusPlan(userId) {
      return focusPlans.get(userId) ?? null;
    },

    async saveTodayFocusPlan(userId, focusPlan) {
      const saved = {
        id: focusPlans.get(userId)?.id ?? `focus_plan_${focusPlans.size + 1}`,
        userId,
        planDate: "2026-04-26",
        focusText: focusPlan.focusText,
        anticipatedHardMoment: focusPlan.anticipatedHardMoment,
        plannedSkill: focusPlan.plannedSkill
      };
      focusPlans.set(userId, saved);
      return saved;
    }
  };
}

async function onboardedApp() {
  const app = createApp({ db: createMemoryCheckInDb() });
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

describe("Pass 3 quick check-ins and morning anchor completion", () => {
  test("POST /api/check-ins saves a normal quick check-in and returns a suggested next action", async () => {
    const { app, cookie } = await onboardedApp();

    const response = await app.fetch(jsonRequest("/api/check-ins", {
      createdAt: "2026-04-26T07:35:00-04:00",
      anchorContext: "morning",
      primaryEmotionScore: 2,
      primaryUrgeScore: 1,
      energyState: "medium",
      suggestedNextActionStatus: "accepted",
      note: "I can start small.",
      locationContext: "home"
    }, { cookie }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        checkIn: {
          id: "check_in_1",
          userId: "user_1",
          createdAt: "2026-04-26T07:35:00-04:00",
          anchorContext: "morning",
          primaryEmotionScore: 2,
          primaryUrgeScore: 1,
          energyState: "medium",
          suggestedNextActionStatus: "accepted",
          note: "I can start small.",
          locationContext: "home",
          riskTier: "normal",
      suggestedNextAction: {
        type: "morning_anchor",
        label: "Pick one focus and make a cope-ahead plan."
      }
        },
        suggestedNextAction: {
          type: "morning_anchor",
          label: "Pick one focus and make a cope-ahead plan."
        },
        riskTier: "normal"
      }
    });
  });

  test("POST /api/check-ins routes elevated urge fixture to Safety Mode", async () => {
    const { app, cookie } = await onboardedApp();

    const response = await app.fetch(jsonRequest("/api/check-ins", {
      createdAt: "2026-04-26T07:35:00-04:00",
      anchorContext: "morning",
      primaryEmotionScore: 5,
      primaryUrgeScore: 5,
      energyState: "high",
      suggestedNextActionStatus: "deferred",
      note: "I am not sure I can stay safe.",
      locationContext: "home"
    }, { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.riskTier).toBe("elevated");
    expect(payload.data.safetyMode).toEqual({
      title: "Safety Mode",
      message: "Pause normal coaching and check whether you are safe right now.",
      crisisResources: ["911", "988"]
    });
  });

  test("POST /api/today/anchors/:id/complete marks the morning anchor complete", async () => {
    const { app, cookie } = await onboardedApp();

    await app.fetch(jsonRequest("/api/check-ins", {
      createdAt: "2026-04-26T07:35:00-04:00",
      anchorContext: "morning",
      primaryEmotionScore: 2,
      primaryUrgeScore: 1,
      energyState: "medium",
      suggestedNextActionStatus: "accepted"
    }, { cookie }));

    const response = await app.fetch(jsonRequest("/api/today/anchors/instance_1/complete", {
      completedAt: "2026-04-26T07:37:00-04:00",
      checkInId: "check_in_1"
    }, { cookie }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        anchor: {
          id: "instance_1",
          userId: "user_1",
          routineTemplateId: "template_1",
          type: "morning",
          targetTime: "07:30",
          status: "complete",
          completedAt: "2026-04-26T07:37:00-04:00",
          completedCheckInId: "check_in_1"
        },
        dailyPlan: {
          id: "daily_plan_user_1",
          userId: "user_1",
          date: "2026-04-26",
          nextBestStep: "Midday anchor is next."
        },
        nextBestStep: "Midday anchor is next."
      }
    });
  });

  test("focus plan requires auth, validates fields, upserts today, and appears in bootstrap", async () => {
    const { app, cookie } = await onboardedApp();

    const unauthorized = await app.fetch(jsonRequest("/api/today/focus-plan", {
      focusText: "email therapist",
      anticipatedHardMoment: "after lunch",
      plannedSkill: "paced breathing"
    }));
    expect(unauthorized.status).toBe(401);

    const invalid = await app.fetch(jsonRequest("/api/today/focus-plan", {
      focusText: "",
      anticipatedHardMoment: "after lunch",
      plannedSkill: "paced breathing"
    }, { cookie }));
    expect(invalid.status).toBe(400);

    const first = await app.fetch(jsonRequest("/api/today/focus-plan", {
      focusText: "email therapist",
      anticipatedHardMoment: "after lunch energy drop",
      plannedSkill: "paced breathing before I open messages"
    }, { cookie }));
    const firstPayload = await first.json();
    expect(first.status).toBe(201);
    expect(firstPayload.data.focusText).toBe("email therapist");

    const second = await app.fetch(jsonRequest("/api/today/focus-plan", {
      focusText: "prepare dinner",
      anticipatedHardMoment: "transition home",
      plannedSkill: "STOP before entering the kitchen"
    }, { cookie }));
    const secondPayload = await second.json();
    expect(second.status).toBe(201);
    expect(secondPayload.data.id).toBe(firstPayload.data.id);
    expect(secondPayload.data.focusText).toBe("prepare dinner");

    const bootstrap = await app.fetch(request("/api/app/bootstrap", {
      headers: { cookie }
    }));
    const bootstrapPayload = await bootstrap.json();
    expect(bootstrapPayload.data.focusPlan).toMatchObject({
      focusText: "prepare dinner",
      anticipatedHardMoment: "transition home",
      plannedSkill: "STOP before entering the kitchen"
    });
  });

  test("POST /api/check-ins validates score ranges", async () => {
    const { app, cookie } = await onboardedApp();

    const response = await app.fetch(jsonRequest("/api/check-ins", {
      createdAt: "2026-04-26T07:35:00-04:00",
      anchorContext: "morning",
      primaryEmotionScore: 6,
      primaryUrgeScore: 1,
      energyState: "medium",
      suggestedNextActionStatus: "accepted"
    }, { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("invalid_check_in");
  });
});

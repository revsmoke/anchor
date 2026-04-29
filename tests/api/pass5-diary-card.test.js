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

const diaryPayload = {
  entryDate: "2026-04-26",
  anchorCompletion: {
    morning: "complete",
    midday: "missed",
    evening: "complete"
  },
  emotionRatings: {
    anxietyFear: 3,
    sadness: 2,
    anger: 1,
    shame: 4,
    guilt: 2,
    numbness: 0,
    joyCalm: 2
  },
  urgeRatings: {
    selfHarm: 0,
    suicidality: 0,
    substanceUse: 1,
    bingeRestrictPurge: 0,
    isolateAvoid: 3,
    quitGiveUp: 2,
    lashOut: 0
  },
  targetOccurrences: [
    { targetKey: "isolate_avoid", occurrence: "urge_only" }
  ],
  skillsUsed: ["stop", "paced_breathing"],
  overallDayDifficulty: 3,
  optionalFields: {
    sleepDurationMinutes: 420,
    sleepQuality: 3,
    medicationAdherence: "taken",
    notes: "Kept the day workable."
  }
};

function createMemoryDiaryDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const entries = new Map();

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

    async getDiarySchema() {
      return {
        version: "v1",
        emotionFields: ["anxietyFear", "sadness", "anger", "shame", "guilt", "numbness", "joyCalm"],
        urgeFields: ["selfHarm", "suicidality", "substanceUse", "bingeRestrictPurge", "isolateAvoid", "quitGiveUp", "lashOut"],
        targetKeys: ["isolate_avoid", "completed_anchor"]
      };
    },

    async getDiaryEntry(userId, entryDate) {
      return entries.get(`${userId}:${entryDate}`) ?? null;
    },

    async saveDiaryEntry(userId, entry) {
      const saved = {
        id: `diary_${userId}_${entry.entryDate}`,
        userId,
        ...entry
      };
      entries.set(`${userId}:${entry.entryDate}`, saved);
      return saved;
    }
  };
}

async function signedInConsentedApp() {
  const app = createApp({ db: createMemoryDiaryDb() });
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

describe("Pass 5 evening diary card routes", () => {
  test("GET /api/diary/:date returns schema and no entry before save", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(request("/api/diary/2026-04-26", {
      headers: { cookie }
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        entry: null,
        schema: {
          version: "v1",
          emotionFields: ["anxietyFear", "sadness", "anger", "shame", "guilt", "numbness", "joyCalm"],
          urgeFields: ["selfHarm", "suicidality", "substanceUse", "bingeRestrictPurge", "isolateAvoid", "quitGiveUp", "lashOut"],
          targetKeys: ["isolate_avoid", "completed_anchor"]
        },
        completionState: "not_started"
      }
    });
  });

  test("PUT /api/diary/:date saves stable diary fields and returns next step", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/diary/2026-04-26", diaryPayload, "PUT", { cookie }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        entry: {
          id: "diary_user_1_2026-04-26",
          userId: "user_1",
          ...diaryPayload
        },
        insightSeed: {
          topTarget: "isolate_avoid",
          hierarchyLevel: "quality_of_life_interfering"
        },
        nextBestStep: "Diary saved. Choose one small setup step for tomorrow."
      }
    });
  });

  test("GET /api/diary/:date loads the saved diary entry", async () => {
    const { app, cookie } = await signedInConsentedApp();

    await app.fetch(jsonRequest("/api/diary/2026-04-26", diaryPayload, "PUT", { cookie }));
    const response = await app.fetch(request("/api/diary/2026-04-26", {
      headers: { cookie }
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.entry.id).toBe("diary_user_1_2026-04-26");
    expect(payload.data.completionState).toBe("complete");
  });

  test("PUT /api/diary/:date validates score ranges and matching entry date", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/diary/2026-04-26", {
      ...diaryPayload,
      entryDate: "2026-04-25",
      emotionRatings: {
        ...diaryPayload.emotionRatings,
        anxietyFear: 6
      }
    }, "PUT", { cookie }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("invalid_diary_entry");
  });
});

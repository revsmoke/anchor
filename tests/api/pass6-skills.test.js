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

const skillSeeds = [
  {
    id: "stop",
    module: "distress_tolerance",
    name: "STOP",
    situationTags: ["overwhelm", "urge"],
    whenToUse: "Use when emotion or urges spike and you need a pause before acting.",
    whyItHelps: "It creates enough space to choose the next effective step.",
    steps: ["Stop.", "Take a step back.", "Observe.", "Proceed mindfully."],
    durationSeconds: 90,
    followUpPrompt: "What did you notice before choosing your next step?"
  },
  {
    id: "paced_breathing",
    module: "distress_tolerance",
    name: "Paced Breathing",
    situationTags: ["panic", "body"],
    whenToUse: "Use when your body is activated and you need to slow down.",
    whyItHelps: "Longer exhales can reduce physical arousal.",
    steps: ["Inhale for four.", "Exhale for six.", "Repeat for two minutes."],
    durationSeconds: 120,
    followUpPrompt: "What changed after paced breathing?"
  },
  {
    id: "opposite_action",
    module: "emotion_regulation",
    name: "Opposite Action",
    situationTags: ["avoidance", "sadness"],
    whenToUse: "Use when an emotion does not fit the facts or is not effective.",
    whyItHelps: "Acting opposite can change the emotion over time.",
    steps: ["Name the emotion.", "Check the facts.", "Choose one opposite action."],
    durationSeconds: 180,
    followUpPrompt: "What small opposite action did you try?"
  }
];

function createMemorySkillsDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();
  const skillSessions = [];

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

    async listSkills({ module, q } = {}) {
      return skillSeeds.filter(skill => {
        const matchesModule = !module || skill.module === module;
        const haystack = `${skill.name} ${skill.whenToUse} ${skill.situationTags.join(" ")}`.toLowerCase();
        const matchesQuery = !q || haystack.includes(q.toLowerCase());
        return matchesModule && matchesQuery;
      });
    },

    async getSkill(skillId) {
      return skillSeeds.find(skill => skill.id === skillId) ?? null;
    },

    async getRecentSkills(userId) {
      return skillSessions
        .filter(session => session.userId === userId)
        .map(session => session.skillId);
    },

    async saveSkillSession(userId, skillId, session) {
      const skill = skillSeeds.find(candidate => candidate.id === skillId);
      if (!skill) return null;
      const saved = {
        id: `skill_session_${skillSessions.length + 1}`,
        userId,
        skillId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        helpfulnessRating: session.helpfulnessRating,
        sourceContext: session.sourceContext
      };
      skillSessions.push(saved);
      return saved;
    }
  };
}

async function signedInConsentedApp() {
  const app = createApp({ db: createMemorySkillsDb() });
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

describe("Pass 6 skills library and guided exercise routes", () => {
  test("GET /api/skills returns seeded skills with favorites and recent lists", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(request("/api/skills", {
      headers: { cookie }
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      data: {
        skills: skillSeeds,
        favorites: [],
        recent: []
      }
    });
  });

  test("GET /api/skills filters by module and query", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const moduleResponse = await app.fetch(request("/api/skills?module=emotion_regulation", {
      headers: { cookie }
    }));
    const modulePayload = await moduleResponse.json();
    expect(modulePayload.data.skills.map(skill => skill.id)).toEqual(["opposite_action"]);

    const queryResponse = await app.fetch(request("/api/skills?q=breath", {
      headers: { cookie }
    }));
    const queryPayload = await queryResponse.json();
    expect(queryPayload.data.skills.map(skill => skill.id)).toEqual(["paced_breathing"]);
  });

  test("GET /api/skills/:id returns skill detail", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(request("/api/skills/paced_breathing", {
      headers: { cookie }
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        skill: skillSeeds[1]
      }
    });
  });

  test("POST /api/skills/:id/sessions saves completion and returns follow-up prompt", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const response = await app.fetch(jsonRequest("/api/skills/paced_breathing/sessions", {
      startedAt: "2026-04-26T12:00:00.000Z",
      completedAt: "2026-04-26T12:02:00.000Z",
      helpfulnessRating: 4,
      sourceContext: "library"
    }, "POST", { cookie }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        skillSession: {
          id: "skill_session_1",
          userId: "user_1",
          skillId: "paced_breathing",
          startedAt: "2026-04-26T12:00:00.000Z",
          completedAt: "2026-04-26T12:02:00.000Z",
          helpfulnessRating: 4,
          sourceContext: "library"
        },
        followUpPrompt: "What changed after paced breathing?"
      }
    });
  });

  test("POST /api/skills/:id/sessions validates rating and skill ownership", async () => {
    const { app, cookie } = await signedInConsentedApp();

    const invalidResponse = await app.fetch(jsonRequest("/api/skills/paced_breathing/sessions", {
      startedAt: "2026-04-26T12:00:00.000Z",
      completedAt: "2026-04-26T12:02:00.000Z",
      helpfulnessRating: 6,
      sourceContext: "library"
    }, "POST", { cookie }));
    const invalidPayload = await invalidResponse.json();

    expect(invalidResponse.status).toBe(400);
    expect(invalidPayload.error.code).toBe("invalid_skill_session");

    const missingResponse = await app.fetch(jsonRequest("/api/skills/missing/sessions", {
      startedAt: "2026-04-26T12:00:00.000Z",
      completedAt: "2026-04-26T12:02:00.000Z",
      helpfulnessRating: 4,
      sourceContext: "library"
    }, "POST", { cookie }));

    expect(missingResponse.status).toBe(404);
  });
});

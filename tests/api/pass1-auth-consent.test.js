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

function createMemoryAuthDb() {
  const users = new Map();
  const sessions = new Map();
  const consents = new Map();

  return {
    async checkHealth() {
      return true;
    },

    async getTodaySnapshot() {
      return {
        productName: "Anchor",
        snapshotDate: "2026-04-25",
        morningAnchorSummary: "Morning anchor: check in, choose one focus, and cope ahead."
      };
    },

    async createUser({ email, passwordHash, timezone, locale }) {
      const normalizedEmail = email.toLowerCase();
      if (users.has(normalizedEmail)) {
        throw Object.assign(new Error("duplicate email"), { code: "duplicate_email" });
      }

      const user = {
        id: `user_${users.size + 1}`,
        email: normalizedEmail,
        passwordHash,
        timezone,
        locale,
        status: "active"
      };
      users.set(normalizedEmail, user);
      return user;
    },

    async getUserByEmail(email) {
      return users.get(email.toLowerCase()) ?? null;
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
      consents.set(userId, records.map(record => ({
        ...record,
        userId
      })));
      return consents.get(userId);
    },

    async getConsentsForUser(userId) {
      return consents.get(userId) ?? [];
    }
  };
}

function cookieFrom(response) {
  return response.headers.get("set-cookie")?.split(";")[0] ?? "";
}

describe("Pass 1 auth and consent routes", () => {
  test("POST /api/auth/signup creates an account, session cookie, and safe user payload", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    const response = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "User@Example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toContain("anchor_session=token_1");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        user: {
          id: "user_1",
          email: "user@example.com",
          timezone: "America/Detroit",
          locale: "en-US",
          status: "active"
        },
        session: {
          id: "session_1"
        }
      }
    });
  });

  test("POST /api/auth/signup rejects invalid account fields", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    const response = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "not-an-email",
      password: "short"
    }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("invalid_signup");
  });

  test("POST /api/auth/login creates a new session for a valid user", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    await app.fetch(jsonRequest("/api/auth/signup", {
      email: "user@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    const response = await app.fetch(jsonRequest("/api/auth/login", {
      email: "user@example.com",
      password: "passphrase-123"
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("anchor_session=token_2");
  });

  test("GET /api/me returns the active user and consent records", async () => {
    const db = createMemoryAuthDb();
    const app = createApp({ db });

    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "user@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    await db.saveConsentRecords("user_1", [
      { type: "crisis_limits", granted: true },
      { type: "privacy_choices", granted: true }
    ]);

    const response = await app.fetch(request("/api/me", {
      headers: { cookie: cookieFrom(signup) }
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        user: {
          id: "user_1",
          email: "user@example.com",
          timezone: "America/Detroit",
          locale: "en-US",
          status: "active"
        },
        profile: null,
        consents: [
          { type: "crisis_limits", granted: true, userId: "user_1" },
          { type: "privacy_choices", granted: true, userId: "user_1" }
        ]
      }
    });
  });

  test("POST /api/onboarding/consent saves required consent records for the active user", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "user@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    const response = await app.fetch(jsonRequest("/api/onboarding/consent", {
      consents: [
        { type: "crisis_limits", granted: true },
        { type: "privacy_choices", granted: true },
        { type: "voice_audio", granted: true }
      ]
    }, { cookie: cookieFrom(signup) }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        consents: [
          { type: "crisis_limits", granted: true, userId: "user_1" },
          { type: "privacy_choices", granted: true, userId: "user_1" },
          { type: "voice_audio", granted: true, userId: "user_1" }
        ],
        nextStep: "onboarding_profile"
      }
    });
  });

  test("POST /api/onboarding/consent rejects missing required consent", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "user@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    const response = await app.fetch(jsonRequest("/api/onboarding/consent", {
      consents: [
        { type: "crisis_limits", granted: true }
      ]
    }, { cookie: cookieFrom(signup) }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("required_consent_missing");
  });

  test("POST /api/onboarding/consent requires an active session", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    const response = await app.fetch(jsonRequest("/api/onboarding/consent", {
      consents: [
        { type: "crisis_limits", granted: true },
        { type: "privacy_choices", granted: true },
        { type: "voice_audio", granted: true }
      ]
    }));

    expect(response.status).toBe(401);
  });

  test("POST /api/auth/logout clears the active session cookie", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "user@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    const response = await app.fetch(request("/api/auth/logout", {
      method: "POST",
      headers: { cookie: cookieFrom(signup) }
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("anchor_session=;");
  });
});

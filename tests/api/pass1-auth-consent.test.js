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
  const resetTokens = new Map();

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
    },

    async getAppBootstrap(userId) {
      const user = [...users.values()].find(candidate => candidate.id === userId);
      const userConsents = consents.get(userId) ?? [];
      const consentComplete = ["crisis_limits", "privacy_choices", "voice_audio"]
        .every(type => userConsents.some(consent => consent.type === type && consent.granted));
      return {
        user: {
          id: user.id,
          email: user.email,
          timezone: user.timezone,
          locale: user.locale,
          status: user.status
        },
        consents: userConsents,
        consentComplete,
        onboardingComplete: true,
        today: [
          { id: "anchor_1", userId, routineTemplateId: "template_1", type: "morning", targetTime: "07:30", status: "scheduled" },
          { id: "anchor_2", userId, routineTemplateId: "template_2", type: "midday", targetTime: "12:30", status: "scheduled" },
          { id: "anchor_3", userId, routineTemplateId: "template_3", type: "evening", targetTime: "21:00", status: "scheduled" }
        ],
        dailyPlan: {
          id: "plan_1",
          userId,
          date: "2026-04-29",
          nextBestStep: "Start your morning anchor."
        },
        nextStep: consentComplete ? "main_app" : "consent"
      };
    },

    async createPasswordResetToken(userId, reset) {
      const token = {
        id: `reset_${resetTokens.size + 1}`,
        userId,
        tokenHash: reset.tokenHash,
        expiresAt: reset.expiresAt,
        usedAt: null
      };
      resetTokens.set(token.id, token);
      return token;
    },

    async getActivePasswordResetTokens(userId) {
      return [...resetTokens.values()]
        .filter(token => token.userId === userId && !token.usedAt && !token.lockedAt && (token.attemptCount ?? 0) < 5)
        .map(token => ({ ...token }));
    },

    async recordPasswordResetFailure(userId) {
      for (const [tokenId, token] of resetTokens.entries()) {
        if (token.userId !== userId || token.usedAt || token.lockedAt) continue;
        const attemptCount = (token.attemptCount ?? 0) + 1;
        resetTokens.set(tokenId, {
          ...token,
          attemptCount,
          lockedAt: attemptCount >= 5 ? new Date().toISOString() : null
        });
      }
    },

    async consumePasswordResetToken(userId, tokenId) {
      const token = resetTokens.get(tokenId);
      if (!token || token.userId !== userId || token.usedAt) return null;
      const used = { ...token, usedAt: new Date().toISOString() };
      resetTokens.set(tokenId, used);
      return used;
    },

    async updateUserPassword(userId, passwordHash) {
      const user = [...users.values()].find(candidate => candidate.id === userId);
      if (!user) return null;
      user.passwordHash = passwordHash;
      users.set(user.email, user);
      return user;
    },

    async deleteSessionsForUser(userId) {
      for (const [token, session] of sessions.entries()) {
        if (session.userId === userId) sessions.delete(token);
      }
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

  test("GET /api/app/bootstrap returns returning-user state for an active session", async () => {
    const db = createMemoryAuthDb();
    const app = createApp({ db });

    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "returning@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));
    await db.saveConsentRecords("user_1", [
      { type: "crisis_limits", granted: true },
      { type: "privacy_choices", granted: true },
      { type: "voice_audio", granted: true }
    ]);

    const response = await app.fetch(request("/api/app/bootstrap", {
      headers: { cookie: cookieFrom(signup) }
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.user.email).toBe("returning@example.com");
    expect(payload.data.consentComplete).toBe(true);
    expect(payload.data.onboardingComplete).toBe(true);
    expect(payload.data.nextStep).toBe("main_app");
    expect(payload.data.today.find(anchor => anchor.type === "morning").id).toBe("anchor_1");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("password reset request returns a dev reset code for known local users without revealing unknown accounts", async () => {
    const app = createApp({ db: createMemoryAuthDb() });

    await app.fetch(jsonRequest("/api/auth/signup", {
      email: "reset@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    const known = await app.fetch(jsonRequest("/api/auth/password-reset/request", {
      email: "reset@example.com"
    }));
    const knownPayload = await known.json();
    const unknown = await app.fetch(jsonRequest("/api/auth/password-reset/request", {
      email: "unknown@example.com"
    }));
    const unknownPayload = await unknown.json();

    expect(known.status).toBe(200);
    expect(knownPayload.data.message).toContain("If an account exists");
    expect(knownPayload.data.devResetCode).toMatch(/^\d{6}$/);
    expect(unknown.status).toBe(200);
    expect(unknownPayload.data.message).toContain("If an account exists");
    expect(unknownPayload.data.devResetCode).toBeUndefined();
  });

  test("password reset confirm changes password, consumes code, and invalidates existing sessions", async () => {
    const db = createMemoryAuthDb();
    const app = createApp({ db });

    const signup = await app.fetch(jsonRequest("/api/auth/signup", {
      email: "reset-confirm@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));
    const oldCookie = cookieFrom(signup);
    const requestReset = await app.fetch(jsonRequest("/api/auth/password-reset/request", {
      email: "reset-confirm@example.com"
    }));
    const { data } = await requestReset.json();

    const invalid = await app.fetch(jsonRequest("/api/auth/password-reset/confirm", {
      email: "reset-confirm@example.com",
      resetCode: "000000",
      newPassword: "new-passphrase-123"
    }));
    expect(invalid.status).toBe(400);

    const confirm = await app.fetch(jsonRequest("/api/auth/password-reset/confirm", {
      email: "reset-confirm@example.com",
      resetCode: data.devResetCode,
      newPassword: "new-passphrase-123"
    }));
    expect(confirm.status).toBe(200);

    const oldSession = await app.fetch(request("/api/me", {
      headers: { cookie: oldCookie }
    }));
    expect(oldSession.status).toBe(401);

    const oldPassword = await app.fetch(jsonRequest("/api/auth/login", {
      email: "reset-confirm@example.com",
      password: "passphrase-123"
    }));
    expect(oldPassword.status).toBe(401);

    const newPassword = await app.fetch(jsonRequest("/api/auth/login", {
      email: "reset-confirm@example.com",
      password: "new-passphrase-123"
    }));
    expect(newPassword.status).toBe(200);

    const reused = await app.fetch(jsonRequest("/api/auth/password-reset/confirm", {
      email: "reset-confirm@example.com",
      resetCode: data.devResetCode,
      newPassword: "another-passphrase-123"
    }));
    expect(reused.status).toBe(400);
  });

  test("password reset request omits dev reset code in production and locks after repeated bad codes", async () => {
    const db = createMemoryAuthDb();
    const app = createApp({
      db,
      config: {
        appEnv: "production",
        secureCookies: true,
        csrfProtection: true
      }
    });

    await app.fetch(jsonRequest("/api/auth/signup", {
      email: "locked@example.com",
      password: "passphrase-123",
      timezone: "America/Detroit",
      locale: "en-US"
    }));

    const requestReset = await app.fetch(jsonRequest("/api/auth/password-reset/request", {
      email: "locked@example.com"
    }));
    const requested = await requestReset.json();
    expect(requested.data.devResetCode).toBeUndefined();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await app.fetch(jsonRequest("/api/auth/password-reset/confirm", {
        email: "locked@example.com",
        resetCode: "000000",
        newPassword: "new-passphrase-123"
      }));
      expect(response.status).toBe(400);
    }

    expect(await db.getActivePasswordResetTokens("user_1")).toEqual([]);
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

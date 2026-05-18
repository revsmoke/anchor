import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { hashPassword, verifyPassword } from "./auth/passwords.js";
import {
  DIARY_EMOTION_FIELDS,
  DIARY_URGE_FIELDS,
  REQUIRED_CONSENT_TYPES,
  validateAnchorCompletionPayload,
  validateChainCreatePayload,
  validateChainPatchPayload,
  validateDayResetPayload,
  validateDiaryEntryPayload,
  validateCoachMessagePayload,
  validateDeleteExecutionPayload,
  validateDeleteRequestPayload,
  validateFocusPlanPayload,
  validateOfflineQueuePayload,
  validatePasswordResetConfirmPayload,
  validatePasswordResetRequestPayload,
  validateSkillSessionPayload,
  validatePrivacyExportPayload,
  validateQuickCheckInPayload,
  validateConsentPayload,
  validateLoginPayload,
  validateProfilePayload,
  validateSessionPacketPayload,
  validateSettingsPayload,
  validateRoutinePayload,
  validateSignupPayload,
  validateVoiceClientSecretPayload,
  validateVoiceEndPayload
} from "./auth/validation.js";
import { getPublicConfig, getServerConfig, isLiveRealtimeConfigured } from "./config.js";
import { clearSessionCookie, csrfCookie, readCsrfToken, readSessionToken, sessionCookie } from "./http/cookies.js";
import { createRequestId, jsonError, jsonOk } from "./http/response.js";
import { createArtifactStore, redactPacketPayload } from "./services/export-service.js";
import { createRealtimeClient } from "./services/realtime.js";
import { redactAuditMetadata } from "./services/audit.js";
import { resolveUserLocalDate, resolveUserTimezone } from "./dates.js";

const DEFAULT_PUBLIC_DIR = new URL("../public", import.meta.url).pathname;

export function createApp({
  db,
  publicDir = DEFAULT_PUBLIC_DIR,
  config = getServerConfig(),
  realtimeClient = createRealtimeClient(config),
  artifactStore = createArtifactStore(config),
  now = () => new Date()
} = {}) {
  if (!db) {
    throw new Error("createApp requires a db adapter.");
  }

  return {
    async fetch(request) {
      const url = new URL(request.url);
      const csrfFailure = validateCsrfIfNeeded(config, request, url);
      if (csrfFailure) return csrfFailure;

      if (request.method === "GET" && url.pathname === "/api/health") {
        return handleHealth(db);
      }

      if (request.method === "GET" && url.pathname === "/api/config/public") {
        return jsonOk(getPublicConfig(config));
      }

      if (request.method === "GET" && url.pathname === "/api/csrf") {
        return handleCsrf(config);
      }

      if (request.method === "GET" && url.pathname === "/api/today/snapshot") {
        return handleTodaySnapshot(db);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/signup") {
        return handleSignup(db, request, config);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        return handleLogin(db, request, config);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        return handleLogout(db, request, config);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/password-reset/request") {
        return handlePasswordResetRequest(db, request, config);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/password-reset/confirm") {
        return handlePasswordResetConfirm(db, request);
      }

      if (request.method === "GET" && url.pathname === "/api/me") {
        return handleMe(db, request);
      }

      if (request.method === "GET" && url.pathname === "/api/app/bootstrap") {
        return handleAppBootstrap(db, request, url, now);
      }

      if (request.method === "POST" && url.pathname === "/api/onboarding/consent") {
        return handleConsent(db, request);
      }

      if (request.method === "POST" && url.pathname === "/api/onboarding/profile") {
        return handleProfile(db, request);
      }

      if (request.method === "POST" && url.pathname === "/api/onboarding/routines") {
        return handleRoutines(db, request, url, now);
      }

      if (request.method === "POST" && url.pathname === "/api/check-ins") {
        return handleCheckIn(db, request);
      }

      if (request.method === "POST" && url.pathname === "/api/today/reset") {
        return handleDayReset(db, request, url, now);
      }

      if (request.method === "GET" && url.pathname === "/api/today/focus-plan") {
        return handleGetFocusPlan(db, request, url, now);
      }

      if (request.method === "POST" && url.pathname === "/api/today/focus-plan") {
        return handleSaveFocusPlan(db, request, url, now);
      }

      const diaryMatch = url.pathname.match(/^\/api\/diary\/(\d{4}-\d{2}-\d{2})$/);
      if (diaryMatch && request.method === "GET") {
        return handleDiaryGet(db, request, diaryMatch[1]);
      }

      if (diaryMatch && request.method === "PUT") {
        return handleDiaryPut(db, request, diaryMatch[1]);
      }

      if (request.method === "GET" && url.pathname === "/api/skills") {
        return handleSkillsList(db, request, url);
      }

      const skillSessionMatch = url.pathname.match(/^\/api\/skills\/([^/]+)\/sessions$/);
      if (skillSessionMatch && request.method === "POST") {
        return handleSkillSessionCreate(db, request, skillSessionMatch[1]);
      }

      const skillDetailMatch = url.pathname.match(/^\/api\/skills\/([^/]+)$/);
      if (skillDetailMatch && request.method === "GET") {
        return handleSkillDetail(db, request, skillDetailMatch[1]);
      }

      if (request.method === "POST" && url.pathname === "/api/coach/messages") {
        return handleCoachMessage(db, request);
      }

      if (request.method === "POST" && url.pathname === "/api/chain-analyses") {
        return handleChainCreate(db, request);
      }

      const chainMatch = url.pathname.match(/^\/api\/chain-analyses\/([^/]+)$/);
      if (chainMatch && request.method === "PATCH") {
        return handleChainPatch(db, request, chainMatch[1]);
      }

      if (request.method === "POST" && url.pathname === "/api/voice/client-secret") {
        return handleVoiceClientSecret(db, request, config, realtimeClient);
      }

      const voiceEndMatch = url.pathname.match(/^\/api\/voice\/sessions\/([^/]+)\/end$/);
      if (voiceEndMatch && request.method === "POST") {
        return handleVoiceEnd(db, request, realtimeClient, voiceEndMatch[1]);
      }

      if (request.method === "GET" && url.pathname === "/api/insights") {
        return handleInsights(db, request, url);
      }

      const weeklyReviewMatch = url.pathname.match(/^\/api\/weekly-review\/(\d{4}-\d{2}-\d{2})$/);
      if (weeklyReviewMatch && request.method === "GET") {
        return handleWeeklyReview(db, request, weeklyReviewMatch[1]);
      }

      if (request.method === "POST" && url.pathname === "/api/session-packets") {
        return handleSessionPacketCreate(db, request, artifactStore);
      }

      const sessionPacketMatch = url.pathname.match(/^\/api\/session-packets\/([^/]+)$/);
      if (sessionPacketMatch && request.method === "GET") {
        return handleSessionPacketGet(db, request, sessionPacketMatch[1]);
      }

      if (request.method === "PATCH" && url.pathname === "/api/me/settings") {
        return handleSettingsSave(db, request);
      }

      if (request.method === "POST" && url.pathname === "/api/privacy/export") {
        return handlePrivacyExport(db, request, artifactStore);
      }

      if (request.method === "POST" && url.pathname === "/api/privacy/delete-request") {
        return handleDeleteRequest(db, request);
      }

      const deleteExecuteMatch = url.pathname.match(/^\/api\/privacy\/delete-requests\/([^/]+)\/execute$/);
      if (deleteExecuteMatch && request.method === "POST") {
        return handleDeleteExecute(db, request, artifactStore, deleteExecuteMatch[1]);
      }

      const exportDownloadMatch = url.pathname.match(/^\/api\/exports\/([^/]+)\/download$/);
      if (exportDownloadMatch && request.method === "GET") {
        return handleExportDownload(db, request, artifactStore, exportDownloadMatch[1]);
      }

      if (request.method === "POST" && url.pathname === "/api/sync/offline-queue") {
        return handleOfflineQueue(db, request);
      }

      const anchorCompleteMatch = url.pathname.match(/^\/api\/today\/anchors\/([^/]+)\/complete$/);
      if (request.method === "POST" && anchorCompleteMatch) {
        return handleAnchorComplete(db, request, anchorCompleteMatch[1], url, now);
      }

      if (request.method === "GET" && url.pathname === "/favicon.ico") {
        return new Response(null, { status: 204 });
      }

      if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
        return serveStatic(publicDir, url.pathname);
      }

      return jsonError("not_found", "Route not found.", {
        status: 404,
        requestId: createRequestId()
      });
    }
  };
}

async function handleHealth(db) {
  try {
    await db.checkHealth();
    return jsonOk({
      status: "ok",
      database: "ok"
    });
  } catch {
    return jsonError("health_check_failed", "Health check failed.", {
      status: 503,
      requestId: createRequestId()
    });
  }
}

async function handleTodaySnapshot(db) {
  try {
    return jsonOk(await db.getTodaySnapshot());
  } catch {
    return jsonError("snapshot_unavailable", "Today snapshot is unavailable.", {
      status: 503,
      requestId: createRequestId()
    });
  }
}

function handleCsrf(config) {
  const token = crypto.randomUUID();
  return jsonOk(
    { csrfToken: token },
    {
      headers: {
        "set-cookie": csrfCookie(token, { secure: config.secureCookies })
      }
    }
  );
}

async function handleSignup(db, request, config) {
  const payload = await readJson(request);
  const validation = validateSignupPayload(payload);

  if (!validation.ok) {
    return jsonError("invalid_signup", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  try {
    const passwordHash = await hashPassword(validation.value.password);
    const user = await db.createUser({
      email: validation.value.email,
      passwordHash,
      timezone: validation.value.timezone,
      locale: validation.value.locale
    });
    const session = await db.createSession(user.id);

    return jsonOk(
      {
        user: publicUser(user),
        session: { id: session.id }
      },
      {
        status: 201,
        headers: {
          "set-cookie": sessionCookie(session.token, { secure: config.secureCookies })
        }
      }
    );
  } catch (error) {
    if (error?.code === "duplicate_email") {
      return jsonError("email_already_exists", "An account already exists for this email.", {
        status: 409,
        requestId: createRequestId()
      });
    }

    return jsonError("signup_failed", "Account could not be created.", {
      status: 500,
      requestId: createRequestId()
    });
  }
}

async function handleLogin(db, request, config) {
  const payload = await readJson(request);
  const validation = validateLoginPayload(payload);

  if (!validation.ok) {
    return jsonError("invalid_login", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const user = await db.getUserByEmail(validation.value.email);
  const validPassword = user
    ? await verifyPassword(user.passwordHash, validation.value.password)
    : false;

  if (!user || !validPassword) {
    return jsonError("invalid_credentials", "Email or password is incorrect.", {
      status: 401,
      requestId: createRequestId()
    });
  }

  const session = await db.createSession(user.id);
  return jsonOk(
    {
      user: publicUser(user),
      session: { id: session.id }
    },
    {
      headers: {
        "set-cookie": sessionCookie(session.token, { secure: config.secureCookies })
      }
    }
  );
}

async function handleLogout(db, request, config) {
  const token = readSessionToken(request);
  if (token) {
    await db.deleteSession(token);
  }

  return jsonOk(
    { loggedOut: true },
    {
      headers: {
        "set-cookie": clearSessionCookie({ secure: config.secureCookies })
      }
    }
  );
}

async function handlePasswordResetRequest(db, request, config) {
  const payload = await readJson(request);
  const validation = validatePasswordResetRequestPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_password_reset_request", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const message = "If an account exists for that email, a password reset code is available.";
  const user = await db.getUserByEmail(validation.value.email);
  if (!user) {
    return jsonOk({ message });
  }

  const resetCode = createPasswordResetCode();
  await db.createPasswordResetToken(user.id, {
    tokenHash: await hashPassword(resetCode),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    requestMetadata: {
      source: "web",
      appEnv: config.appEnv
    }
  });

  return jsonOk({
    message,
    ...(canReturnDevResetCode(config) ? { devResetCode: resetCode } : {})
  });
}

async function handlePasswordResetConfirm(db, request) {
  const payload = await readJson(request);
  const validation = validatePasswordResetConfirmPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_password_reset_confirm", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const user = await db.getUserByEmail(validation.value.email);
  if (!user) {
    return jsonError("invalid_password_reset_code", "Reset code is invalid or expired.", {
      status: 400,
      requestId: createRequestId()
    });
  }

  const tokens = await db.getActivePasswordResetTokens(user.id);
  let matchingToken = null;
  for (const token of tokens) {
    if (await verifyPassword(token.tokenHash, validation.value.resetCode)) {
      matchingToken = token;
      break;
    }
  }

  if (!matchingToken) {
    if (typeof db.recordPasswordResetFailure === "function") {
      await db.recordPasswordResetFailure(user.id);
    }
    return jsonError("invalid_password_reset_code", "Reset code is invalid or expired.", {
      status: 400,
      requestId: createRequestId()
    });
  }

  const consumed = await db.consumePasswordResetToken(user.id, matchingToken.id);
  if (!consumed) {
    return jsonError("invalid_password_reset_code", "Reset code is invalid or expired.", {
      status: 400,
      requestId: createRequestId()
    });
  }

  await db.updateUserPassword(user.id, await hashPassword(validation.value.newPassword));
  await db.deleteSessionsForUser(user.id);
  return jsonOk({ passwordReset: true });
}

async function handleMe(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  return jsonOk({
    user: publicUser(user),
    profile: null,
    consents: await db.getConsentsForUser(user.id)
  });
}

async function handleAppBootstrap(db, request, url, now) {
  const headers = { "cache-control": "no-store" };
  if (!readSessionToken(request)) {
    return jsonOk({
      authenticated: false,
      nextStep: "auth"
    }, {
      headers
    });
  }

  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  const dateOptions = await dailyDateOptions(db, user, url, now);
  const bootstrap = await db.getAppBootstrap(user.id, dateOptions);

  return jsonOk({
    ...bootstrap,
    authenticated: true,
    user: bootstrap.user ?? publicUser(user)
  }, {
    headers
  });
}

async function handleConsent(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateConsentPayload(payload);
  if (!validation.ok) {
    return jsonError("required_consent_missing", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  return jsonOk({
    consents: await db.saveConsentRecords(user.id, validation.value),
    nextStep: "onboarding_profile"
  });
}

async function handleProfile(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateProfilePayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_profile", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  return jsonOk({
    profile: await db.saveUserProfile(user.id, validation.value)
  });
}

async function handleRoutines(db, request, url, now) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateRoutinePayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_routine_setup", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  return jsonOk(await db.saveRoutineSetup(user.id, validation.value, await dailyDateOptions(db, user, url, now)));
}

async function handleCheckIn(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateQuickCheckInPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_check_in", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const recommendation = recommendNextAction(validation.value);
  const checkIn = await db.saveQuickCheckIn(user.id, validation.value, recommendation);
  const data = {
    checkIn,
    suggestedNextAction: recommendation.suggestedNextAction,
    riskTier: recommendation.riskTier
  };

  if (recommendation.riskTier !== "normal") {
    await db.saveSafetyEvent(user.id, {
      riskTier: recommendation.riskTier,
      triggerType: "quick_check_in",
      outcome: "safety_mode",
      context: {
        checkInId: checkIn.id,
        anchorContext: checkIn.anchorContext
      }
    });
    data.safetyMode = safetyModePayload();
  }

  return jsonOk(data, { status: 201 });
}

async function handleAnchorComplete(db, request, anchorId, url, now) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateAnchorCompletionPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_anchor_completion", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const result = await db.completeRoutineInstance(
    user.id,
    anchorId,
    validation.value,
    await dailyDateOptions(db, user, url, now)
  );
  if (!result) {
    return jsonError("anchor_not_found", "Anchor could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }

  return jsonOk(result);
}

async function handleDayReset(db, request, url, now) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateDayResetPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_day_reset", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  return jsonOk(await db.resetTodayPlan(user.id, validation.value, await dailyDateOptions(db, user, url, now)));
}

async function handleGetFocusPlan(db, request, url, now) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  return jsonOk({
    focusPlan: await db.getTodayFocusPlan(user.id, await dailyDateOptions(db, user, url, now))
  });
}

async function handleSaveFocusPlan(db, request, url, now) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateFocusPlanPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_focus_plan", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  return jsonOk(await db.saveTodayFocusPlan(
    user.id,
    validation.value,
    await dailyDateOptions(db, user, url, now)
  ), {
    status: 201
  });
}

async function handleDiaryGet(db, request, entryDate) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const [schema, entry] = await Promise.all([
    db.getDiarySchema(),
    db.getDiaryEntry(user.id, entryDate)
  ]);

  return jsonOk({
    entry,
    schema,
    completionState: entry ? "complete" : "not_started"
  });
}

async function handleDiaryPut(db, request, entryDate) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateDiaryEntryPayload(payload, entryDate);
  if (!validation.ok) {
    return jsonError("invalid_diary_entry", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const entry = await db.saveDiaryEntry(user.id, validation.value);
  const insightSeed = diaryInsightSeed(entry);

  return jsonOk({
    entry,
    insightSeed,
    nextBestStep: "Diary saved. Choose one small setup step for tomorrow."
  });
}

async function handleSkillsList(db, request, url) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const filters = {
    module: String(url.searchParams.get("module") || "").trim() || null,
    q: String(url.searchParams.get("q") || "").trim() || null,
    recommendedFor: String(url.searchParams.get("recommendedFor") || "").trim() || null
  };

  return jsonOk({
    skills: await db.listSkills(filters),
    favorites: [],
    recent: await db.getRecentSkills(user.id)
  });
}

async function handleSkillDetail(db, request, skillId) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const skill = await db.getSkill(skillId);
  if (!skill) {
    return jsonError("skill_not_found", "Skill could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }

  return jsonOk({ skill });
}

async function handleSkillSessionCreate(db, request, skillId) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateSkillSessionPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_skill_session", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const skill = await db.getSkill(skillId);
  if (!skill) {
    return jsonError("skill_not_found", "Skill could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }

  const skillSession = await db.saveSkillSession(user.id, skillId, validation.value);

  return jsonOk(
    {
      skillSession,
      followUpPrompt: skill.followUpPrompt
    },
    { status: 201 }
  );
}

async function handleCoachMessage(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateCoachMessagePayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_coach_message", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const coachInput = validation.value;
  const riskTier = classifyCoachRisk(coachInput.message);
  const runDraft = coachAgentRun(coachInput, riskTier);
  const agentRun = await db.saveAgentRun(user.id, runDraft);

  if (riskTier !== "normal") {
    const safetyMode = coachSafetyModePayload(riskTier);
    const safetyEvent = await db.saveSafetyEvent(user.id, {
      riskTier,
      triggerType: "coach_message",
      outcome: riskTier === "acute" ? "acute_lock" : "safety_mode",
      context: {
        agentRunId: agentRun.id,
        mode: coachInput.mode,
        inputFingerprint: runDraft.inputFingerprint
      }
    });
    await saveCoachMessageIfSupported(db, user.id, {
      agentRunId: agentRun.id,
      role: "user",
      messageFingerprint: runDraft.inputFingerprint
    });

    return jsonOk({
      agentRun,
      riskTier,
      safetyMode,
      safetyEvent
    });
  }

  const reply = coachReplyFor(coachInput);
  await saveCoachMessageIfSupported(db, user.id, {
    agentRunId: agentRun.id,
    role: "assistant",
    replyText: reply.text,
    nextAction: reply.nextAction
  });

  return jsonOk({
    reply,
    agentRun,
    riskTier,
    nextAction: reply.nextAction
  });
}

async function handleChainCreate(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateChainCreatePayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_chain_analysis", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const chainAnalysis = await db.createChainAnalysis(user.id, validation.value);
  return jsonOk({ chainAnalysis }, { status: 201 });
}

async function handleChainPatch(db, request, chainId) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateChainPatchPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_chain_analysis", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const chainAnalysis = await db.updateChainAnalysis(user.id, chainId, validation.value);
  if (!chainAnalysis) {
    return jsonError("chain_not_found", "Chain analysis could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }

  return jsonOk({
    chainAnalysis,
    completionState: chainAnalysis.completionState,
    preventionPlan: chainAnalysis.preventionPlan
  });
}

async function handleVoiceClientSecret(db, request, config, realtimeClient) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateVoiceClientSecretPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_voice_session", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  if (validation.value.useLiveRealtime && !isLiveRealtimeConfigured(config)) {
    return jsonError("voice_realtime_unavailable", "Realtime voice is not configured for this environment.", {
      status: 503,
      requestId: createRequestId()
    });
  }

  const session = {
    type: "realtime",
    model: config.realtimeModel,
    instructions: "You are Anchor's DBT practice voice coach. Keep responses short and action-oriented. Do not provide emergency care.",
    audio: {
      output: { voice: "marin" }
    }
  };
  let call;
  try {
    call = validation.value.sdpOffer && validation.value.useLiveRealtime
      ? await realtimeClient.createCall({
        sdpOffer: validation.value.sdpOffer,
        session,
        forceNetwork: validation.value.useLiveRealtime
      })
      : {
        sdpAnswer: "v=0\r\no=- 2 2 IN IP4 127.0.0.1\r\ns=Anchor Local Answer\r\n",
        openAiCallId: "local_realtime_call"
      };
  } catch {
    return jsonError("voice_realtime_failed", "Realtime voice session could not be started.", {
      status: 502,
      requestId: createRequestId()
    });
  }

  const voiceSession = await db.createVoiceSession(user.id, {
    ...validation.value,
    openAiCallId: call.openAiCallId,
    transcriptPreviewEnabled: true
  });
  await saveAuditIfSupported(db, user.id, "voice_started", {
    voiceSessionId: voiceSession.id,
    openAiCallId: call.openAiCallId,
    doNotSave: voiceSession.doNotSave
  });

  return jsonOk(
    {
      voiceSessionId: voiceSession.id,
      sdpAnswer: call.sdpAnswer,
      openAiCallId: call.openAiCallId,
      clientSecret: {
        value: "local_voice_client_secret",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      },
      realtimeConfig: {
        mode: voiceSession.mode,
        transcriptPreviewEnabled: true,
        doNotSave: voiceSession.doNotSave
      }
    },
    { status: 201 }
  );
}

async function handleVoiceEnd(db, request, realtimeClient, voiceSessionId) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateVoiceEndPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_voice_end", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const voiceSession = await db.endVoiceSession(user.id, voiceSessionId, validation.value);
  if (!voiceSession) {
    return jsonError("voice_session_not_found", "Voice session could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }

  if (voiceSession.openAiCallId) {
    await realtimeClient.hangup(voiceSession.openAiCallId, {
      forceNetwork: voiceSession.openAiCallId !== "local_realtime_call"
    });
  }
  await saveAuditIfSupported(db, user.id, "voice_ended", {
    voiceSessionId,
    openAiCallId: voiceSession.openAiCallId,
    transcriptOptIn: validation.value.transcriptOptIn
  });

  const artifact = validation.value.transcriptOptIn
    ? {
      type: "voice_summary",
      summary: validation.value.savedSummary || "Voice session ended."
    }
    : null;

  return jsonOk({ voiceSession, artifact });
}

async function handleInsights(db, request, url) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  const range = String(url.searchParams.get("range") || "7d").trim();
  return jsonOk(await db.getInsights(user.id, range));
}

async function handleWeeklyReview(db, request, weekStart) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  const review = await db.getWeeklyReview(user.id, weekStart);
  return jsonOk({
    review,
    sourceEvidence: review.sourceEvidence
  });
}

async function handleSessionPacketCreate(db, request, artifactStore) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  if (!(await hasRequiredConsents(db, user.id))) return consentRequired();

  const payload = await readJson(request);
  const validation = validateSessionPacketPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_session_packet", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const packet = await db.createSessionPacket(user.id, validation.value);
  const exportData = typeof db.getSessionExportData === "function"
    ? await db.getSessionExportData(user.id, packet)
    : {};
  const exportPayload = redactPacketPayload({
    type: "session_packet",
    packet: {
      id: packet.id,
      dateRange: packet.dateRange,
      includedSections: packet.includedSections,
      redactions: packet.redactions
    },
    data: exportData
  }, packet.redactions);
  const artifactId = `artifact_${artifactIdSource(packet.id)}`;
  const stored = await artifactStore.writeJson({ artifactId, payload: exportPayload });
  const artifact = typeof db.createExportArtifact === "function"
    ? await db.createExportArtifact(user.id, {
      artifactId,
      kind: "session_packet",
      format: "json",
      storageKey: stored.storageKey,
      byteSize: stored.byteSize,
      redactions: packet.redactions,
      sourceId: packet.id
    })
    : { id: artifactId, storageKey: stored.storageKey };

  if (typeof db.markSessionPacketArtifact === "function") {
    await db.markSessionPacketArtifact(user.id, packet.id, artifact.id);
  }
  await saveAuditIfSupported(db, user.id, "session_packet_export_created", {
    packetId: packet.id,
    artifactId: artifact.id,
    redactions: packet.redactions
  });

  return jsonOk(
    {
      packet,
      downloadUrl: `/api/exports/${artifact.id}/download`,
      shareUrl: null
    },
    { status: 201 }
  );
}

async function handleSessionPacketGet(db, request, packetId) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();
  const packet = await db.getSessionPacket(user.id, packetId);
  if (!packet) {
    return jsonError("session_packet_not_found", "Session packet could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }
  return jsonOk({ packet });
}

async function handleSettingsSave(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateSettingsPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_settings", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const settings = await db.saveUserSettings(user.id, validation.value);
  return jsonOk({ settings });
}

async function handlePrivacyExport(db, request, artifactStore) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validatePrivacyExportPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_privacy_export", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const exportRequest = await db.createPrivacyExport(user.id, validation.value);
  const exportData = typeof db.getPrivacyExportData === "function"
    ? await db.getPrivacyExportData(user.id, exportRequest)
    : { exportRequest };
  const artifactId = `artifact_${artifactIdSource(exportRequest.id)}`;
  const stored = await artifactStore.writeJson({
    artifactId,
    payload: {
      type: "privacy_export",
      exportRequest,
      data: exportData
    }
  });
  const artifact = typeof db.createExportArtifact === "function"
    ? await db.createExportArtifact(user.id, {
      artifactId,
      kind: "privacy_export",
      format: "json",
      storageKey: stored.storageKey,
      byteSize: stored.byteSize,
      redactions: {},
      sourceId: exportRequest.id
    })
    : { id: artifactId };
  await saveAuditIfSupported(db, user.id, "privacy_export_created", {
    exportRequestId: exportRequest.id,
    artifactId: artifact.id
  });

  return jsonOk({
    exportRequestId: exportRequest.id,
    status: exportRequest.status,
    downloadUrl: `/api/exports/${artifact.id}/download`
  }, { status: 201 });
}

async function handleDeleteRequest(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateDeleteRequestPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_delete_request", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const deleteRequest = await db.createDeleteRequest(user.id, validation.value);
  await saveAuditIfSupported(db, user.id, "privacy_delete_requested", {
    deleteRequestId: deleteRequest.id,
    scope: deleteRequest.scope
  });
  return jsonOk({
    deleteRequestId: deleteRequest.id,
    scheduledDeletionAt: deleteRequest.scheduledDeletionAt
  }, { status: 201 });
}

async function handleDeleteExecute(db, request, artifactStore, deleteRequestId) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateDeleteExecutionPayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_delete_execution", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  if (typeof db.deleteExportArtifactsForUser === "function") {
    const artifacts = await db.deleteExportArtifactsForUser(user.id);
    for (const artifact of artifacts) {
      if (artifact.storageKey) await artifactStore.delete(artifact.storageKey);
    }
  }

  const result = typeof db.executeDeleteRequest === "function"
    ? await db.executeDeleteRequest(user.id, deleteRequestId)
    : null;

  if (!result) {
    return jsonError("delete_request_not_found", "Delete request could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }

  await saveAuditIfSupported(db, user.id, "privacy_delete_completed", {
    deleteRequestId,
    status: result.status
  });
  return jsonOk({
    deleteRequestId: result.id,
    status: result.status,
    completedAt: result.completedAt
  });
}

async function handleExportDownload(db, request, artifactStore, artifactId) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const artifact = typeof db.getExportArtifact === "function"
    ? await db.getExportArtifact(user.id, artifactId)
    : null;
  if (!artifact) {
    return jsonError("export_artifact_not_found", "Export artifact could not be found.", {
      status: 404,
      requestId: createRequestId()
    });
  }

  const payload = await artifactStore.readJson(artifact.storageKey);
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${artifactId}.json"`,
      "x-request-id": createRequestId()
    }
  });
}

async function handleOfflineQueue(db, request) {
  const user = await requireUser(db, request);
  if (!user) return unauthorized();

  const payload = await readJson(request);
  const validation = validateOfflineQueuePayload(payload);
  if (!validation.ok) {
    return jsonError("invalid_offline_queue", validation.message, {
      status: 400,
      requestId: createRequestId()
    });
  }

  const result = await db.applyOfflineMutations(
    user.id,
    validation.value.clientId,
    validation.value.mutations
  );
  await saveAuditIfSupported(db, user.id, "offline_queue_synced", {
    clientId: validation.value.clientId,
    acceptedCount: result.accepted.length,
    rejectedCount: result.rejected.length,
    needsReviewCount: result.needsReview.length
  });
  return jsonOk(result);
}

async function requireUser(db, request) {
  const token = readSessionToken(request);
  if (!token) return null;
  return db.getSessionUser(token);
}

async function dailyDateOptions(db, user, url, now) {
  const profileTimezone = typeof db.getUserDailyTimezone === "function"
    ? await db.getUserDailyTimezone(user.id)
    : "";
  const timezone = resolveUserTimezone({
    profileTimezone,
    fallbackTimezone: url.searchParams.get("timezone") || user.timezone || "UTC"
  });

  return {
    localDate: resolveUserLocalDate({
      timezone,
      dateParam: url.searchParams.get("date") || "",
      now: now()
    }),
    timezone
  };
}

function validateCsrfIfNeeded(config, request, url) {
  if (!config.csrfProtection || !["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    return null;
  }

  if (url.pathname.startsWith("/api/auth/")) {
    return null;
  }

  const sessionToken = readSessionToken(request);
  if (!sessionToken) return null;

  const headerToken = request.headers.get("x-csrf-token") ?? "";
  const cookieToken = readCsrfToken(request);
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return jsonError("csrf_required", "CSRF token is required.", {
      status: 403,
      requestId: createRequestId()
    });
  }

  return null;
}

async function saveAuditIfSupported(db, userId, eventType, metadata = {}) {
  if (typeof db.saveAuditEvent === "function") {
    await db.saveAuditEvent(userId, {
      eventType,
      metadata: redactAuditMetadata(metadata)
    });
  }
}

function artifactIdSource(sourceId) {
  return String(sourceId ?? crypto.randomUUID()).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function unauthorized() {
  return jsonError("unauthorized", "Sign in is required.", {
    status: 401,
    requestId: createRequestId()
  });
}

async function hasRequiredConsents(db, userId) {
  const consents = await db.getConsentsForUser(userId);
  const granted = new Set(consents.filter(consent => consent.granted).map(consent => consent.type));
  return REQUIRED_CONSENT_TYPES.every(type => granted.has(type));
}

function consentRequired() {
  return jsonError("consent_required", "Required consent must be saved before onboarding.", {
    status: 403,
    requestId: createRequestId()
  });
}

function recommendNextAction(checkIn) {
  const riskTier = classifyRisk(checkIn);
  if (riskTier !== "normal") {
    return {
      riskTier,
      suggestedNextAction: {
        type: "safety_check",
        label: "Check whether you are safe right now."
      }
    };
  }

  return {
    riskTier: "normal",
    suggestedNextAction: {
      type: `${checkIn.anchorContext}_anchor`,
      label: actionLabelFor(checkIn)
    }
  };
}

function classifyRisk(checkIn) {
  const note = String(checkIn.note ?? "").toLowerCase();
  if (
    checkIn.primaryUrgeScore >= 5 ||
    note.includes("not sure i can stay safe") ||
    note.includes("unsafe")
  ) {
    return "elevated";
  }

  return "normal";
}

function actionLabelFor(checkIn) {
  if (checkIn.anchorContext === "morning") {
    return "Pick one focus and make a cope-ahead plan.";
  }

  if (checkIn.energyState === "low") {
    return "Use STOP, drink water, and take one small step.";
  }

  return "Take the next small structured step.";
}

function safetyModePayload() {
  return {
    title: "Safety Mode",
    message: "Pause normal coaching and check whether you are safe right now.",
    crisisResources: ["911", "988"]
  };
}

function classifyCoachRisk(message) {
  const text = message.toLowerCase();
  const acuteSignals = [
    "kill myself",
    "current attempt",
    "cannot stay safe",
    "can't stay safe",
    "plan to"
  ];
  if (acuteSignals.some(signal => text.includes(signal)) && (text.includes("kill") || text.includes("suicide") || text.includes("stay safe"))) {
    return "acute";
  }

  const elevatedSignals = [
    "not sure i can stay safe",
    "unsafe",
    "wish i would not wake up",
    "self-harm",
    "self harm"
  ];
  if (elevatedSignals.some(signal => text.includes(signal))) {
    return "elevated";
  }

  return "normal";
}

function coachAgentRun(input, riskTier) {
  const safetyDecision = {
    triggerType: "coach_message",
    outcome: riskTier === "normal" ? "normal_coaching" : riskTier === "acute" ? "acute_lock" : "safety_mode"
  };

  if (riskTier !== "normal") {
    return {
      agentName: "Safety Guardian",
      specialistsUsed: ["Safety Guardian"],
      riskTier,
      mode: input.mode,
      inputFingerprint: `len:${input.message.length}`,
      safetyDecision,
      contextRefs: input.contextRefs
    };
  }

  return {
    agentName: "Anchor Orchestrator",
    specialistsUsed: [specialistForMode(input.mode)],
    riskTier,
    mode: input.mode,
    inputFingerprint: `len:${input.message.length}`,
    safetyDecision,
    contextRefs: input.contextRefs
  };
}

function specialistForMode(mode) {
  if (mode === "skill") return "Skills Coach";
  return "Structure Coach";
}

function coachReplyFor(input) {
  if (input.mode === "skill") {
    return {
      text: "Use one short skill before solving the whole problem.",
      nextAction: {
        type: "open_skill",
        label: "Open Paced Breathing"
      }
    };
  }

  return {
    text: "Let's reduce the day to one must-do.",
    nextAction: {
      type: "day_reset",
      label: "Choose one must-do"
    }
  };
}

function coachSafetyModePayload(riskTier) {
  if (riskTier === "acute") {
    return {
      title: "Emergency support now",
      message: "Normal coaching is locked for this session. Use emergency support or contact a trusted person now.",
      groundingSkill: null,
      crisisResources: ["911", "988"],
      normalCoachingLocked: true
    };
  }

  return {
    title: "Safety Mode",
    message: "Are you safe right now?",
    groundingSkill: "Paced Breathing",
    crisisResources: ["911", "988"],
    normalCoachingLocked: false
  };
}

async function saveCoachMessageIfSupported(db, userId, message) {
  if (typeof db.saveCoachMessage === "function") {
    await db.saveCoachMessage(userId, message);
  }
}

function diaryInsightSeed(entry) {
  const target = entry.targetOccurrences?.find(item => item.occurrence !== "none")?.targetKey ?? "completed_anchor";
  return {
    topTarget: target,
    hierarchyLevel: hierarchyLevelForTarget(target)
  };
}

function hierarchyLevelForTarget(targetKey) {
  if (["self_harm_urge", "self_harm_action", "suicidality_urge", "suicidality_plan_action"].includes(targetKey)) {
    return "life_threatening";
  }

  if (["skipped_therapy", "skipped_diary_card", "repeated_skipped_anchors"].includes(targetKey)) {
    return "therapy_interfering";
  }

  if (["substance_use", "binge_restrict_purge", "isolate_avoid", "lash_out", "dissociation_shutdown", "quit_give_up"].includes(targetKey)) {
    return "quality_of_life_interfering";
  }

  return "skills_generalization";
}

export function diarySchema() {
  return {
    version: "v1",
    emotionFields: DIARY_EMOTION_FIELDS,
    urgeFields: DIARY_URGE_FIELDS,
    targetKeys: ["isolate_avoid", "completed_anchor"]
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    timezone: user.timezone,
    locale: user.locale,
    status: user.status
  };
}

function createPasswordResetCode() {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(value).padStart(6, "0");
}

function canReturnDevResetCode(config) {
  return config.appEnv !== "production";
}

async function serveStatic(publicDir, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(publicDir, safePath));

  if (!filePath.startsWith(normalize(publicDir))) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const body = await readFile(filePath);
    return new Response(body, {
      headers: {
        "content-type": contentTypeFor(filePath)
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

function contentTypeFor(filePath) {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

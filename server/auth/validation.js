export const REQUIRED_CONSENT_TYPES = [
  "crisis_limits",
  "privacy_choices",
  "voice_audio"
];

export const DIARY_EMOTION_FIELDS = [
  "anxietyFear",
  "sadness",
  "anger",
  "shame",
  "guilt",
  "numbness",
  "joyCalm"
];

export const DIARY_URGE_FIELDS = [
  "selfHarm",
  "suicidality",
  "substanceUse",
  "bingeRestrictPurge",
  "isolateAvoid",
  "quitGiveUp",
  "lashOut"
];

const ANCHOR_COMPLETION_VALUES = ["complete", "missed", "skipped"];
const TARGET_OCCURRENCE_VALUES = ["none", "urge_only", "action_occurred"];
const DEFAULT_TARGET_KEYS = [
  "self_harm_urge",
  "self_harm_action",
  "suicidality_urge",
  "suicidality_plan_action",
  "skipped_therapy",
  "skipped_diary_card",
  "repeated_skipped_anchors",
  "substance_use",
  "binge_restrict_purge",
  "isolate_avoid",
  "lash_out",
  "dissociation_shutdown",
  "quit_give_up",
  "used_skill",
  "completed_anchor",
  "completed_repair_action"
];

export function validateSignupPayload(payload) {
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const password = String(payload?.password ?? "");
  const timezone = String(payload?.timezone ?? "America/Detroit").trim();
  const locale = String(payload?.locale ?? "en-US").trim();

  if (!email.includes("@") || email.length > 254) {
    return { ok: false, message: "Enter a valid email." };
  }

  if (password.length < 12) {
    return { ok: false, message: "Password must be at least 12 characters." };
  }

  if (!timezone || !locale) {
    return { ok: false, message: "Timezone and locale are required." };
  }

  return {
    ok: true,
    value: {
      email,
      password,
      timezone,
      locale
    }
  };
}

export function validateLoginPayload(payload) {
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const password = String(payload?.password ?? "");

  if (!email.includes("@") || !password) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  return {
    ok: true,
    value: { email, password }
  };
}

export function validatePasswordResetRequestPayload(payload) {
  const email = String(payload?.email ?? "").trim().toLowerCase();

  if (!email.includes("@") || email.length > 254) {
    return { ok: false, message: "Enter a valid email." };
  }

  return {
    ok: true,
    value: { email }
  };
}

export function validatePasswordResetConfirmPayload(payload) {
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const resetCode = String(payload?.resetCode ?? "").trim();
  const newPassword = String(payload?.newPassword ?? "");

  if (!email.includes("@") || email.length > 254) {
    return { ok: false, message: "Enter a valid email." };
  }

  if (!resetCode) {
    return { ok: false, message: "Reset code is required." };
  }

  if (newPassword.length < 12) {
    return { ok: false, message: "Password must be at least 12 characters." };
  }

  return {
    ok: true,
    value: { email, resetCode, newPassword }
  };
}

export function validateConsentPayload(payload) {
  const consents = Array.isArray(payload?.consents) ? payload.consents : [];
  const consentMap = new Map(consents.map(consent => [consent?.type, consent?.granted === true]));
  const missing = REQUIRED_CONSENT_TYPES.find(type => consentMap.get(type) !== true);

  if (missing) {
    return {
      ok: false,
      message: labelForConsent(missing)
    };
  }

  return {
    ok: true,
    value: REQUIRED_CONSENT_TYPES.map(type => ({
      type,
      granted: true
    }))
  };
}

export function validateProfilePayload(payload) {
  const timezone = String(payload?.timezone ?? "").trim();
  const wakeTime = String(payload?.wakeTime ?? "").trim();
  const sleepTime = String(payload?.sleepTime ?? "").trim();
  const goals = normalizeStringList(payload?.goals);
  const struggles = normalizeStringList(payload?.struggles);
  const therapyStatus = String(payload?.therapyStatus ?? "").trim();

  if (!timezone) return { ok: false, message: "Timezone is required." };
  if (!isTime(wakeTime)) return { ok: false, message: "Wake time is required." };
  if (!isTime(sleepTime)) return { ok: false, message: "Sleep time is required." };
  if (!goals.length) return { ok: false, message: "At least one goal is required." };
  if (!struggles.length) return { ok: false, message: "At least one hard moment is required." };
  if (!["in_therapy", "self_directed", "not_sure"].includes(therapyStatus)) {
    return { ok: false, message: "Therapy status is required." };
  }

  return {
    ok: true,
    value: {
      timezone,
      wakeTime,
      sleepTime,
      goals,
      struggles,
      therapyStatus
    }
  };
}

export function validateRoutinePayload(payload) {
  const anchors = Array.isArray(payload?.anchors) ? payload.anchors : [];
  const requiredTypes = ["morning", "midday", "evening"];
  const seenTypes = new Set(anchors.map(anchor => anchor?.type));

  if (anchors.length !== 3 || requiredTypes.some(type => !seenTypes.has(type))) {
    return {
      ok: false,
      message: "Create morning, midday, and evening anchors."
    };
  }

  const normalized = requiredTypes.map(type => {
    const anchor = anchors.find(candidate => candidate?.type === type);
    const targetTime = String(anchor?.targetTime ?? "").trim();
    const steps = normalizeStringList(anchor?.steps);

    if (!isTime(targetTime)) {
      return { error: `${capitalize(type)} anchor time is required.` };
    }

    if (!steps.length) {
      return { error: `${capitalize(type)} anchor steps are required.` };
    }

    return {
      type,
      targetTime,
      steps
    };
  });

  const invalid = normalized.find(anchor => anchor.error);
  if (invalid) {
    return {
      ok: false,
      message: invalid.error
    };
  }

  return {
    ok: true,
    value: normalized
  };
}

export function validateQuickCheckInPayload(payload) {
  const createdAt = String(payload?.createdAt ?? "").trim();
  const anchorContext = String(payload?.anchorContext ?? "").trim();
  const primaryEmotionScore = Number(payload?.primaryEmotionScore);
  const primaryUrgeScore = Number(payload?.primaryUrgeScore);
  const energyState = String(payload?.energyState ?? "").trim();
  const suggestedNextActionStatus = String(payload?.suggestedNextActionStatus ?? "").trim();
  const note = String(payload?.note ?? "").trim();
  const locationContext = String(payload?.locationContext ?? "").trim();

  if (!createdAt || Number.isNaN(Date.parse(createdAt))) {
    return { ok: false, message: "Check-in time is required." };
  }

  if (!["morning", "midday", "evening", "anytime"].includes(anchorContext)) {
    return { ok: false, message: "Anchor context is required." };
  }

  if (!isScore(primaryEmotionScore)) {
    return { ok: false, message: "Mood must be from 0 to 5." };
  }

  if (!isScore(primaryUrgeScore)) {
    return { ok: false, message: "Urge must be from 0 to 5." };
  }

  if (!["low", "medium", "high"].includes(energyState)) {
    return { ok: false, message: "Energy is required." };
  }

  if (!["accepted", "dismissed", "deferred"].includes(suggestedNextActionStatus)) {
    return { ok: false, message: "Next action status is required." };
  }

  if (note.length > 180) {
    return { ok: false, message: "Note must be one short sentence." };
  }

  if (locationContext && !["home", "work", "school", "commute", "social", "other"].includes(locationContext)) {
    return { ok: false, message: "Location context is not valid." };
  }

  return {
    ok: true,
    value: {
      createdAt,
      anchorContext,
      primaryEmotionScore,
      primaryUrgeScore,
      energyState,
      suggestedNextActionStatus,
      note: note || null,
      locationContext: locationContext || null
    }
  };
}

export function validateSafetyPlanPayload(payload) {
  const warningSigns = normalizeStringList(payload?.warningSigns).slice(0, 20);
  const steps = normalizeStringList(payload?.steps).slice(0, 20);
  const contacts = Array.isArray(payload?.contacts)
    ? payload.contacts.map(normalizeSafetyContact).filter(Boolean).slice(0, 10)
    : [];
  const crisisResources = Array.isArray(payload?.crisisResources)
    ? payload.crisisResources.map(normalizeSafetyResource).filter(Boolean).slice(0, 10)
    : [];

  if (!warningSigns.length) return { ok: false, message: "At least one warning sign is required." };
  if (!steps.length) return { ok: false, message: "At least one safety step is required." };
  if (!crisisResources.length) return { ok: false, message: "At least one crisis resource is required." };

  return {
    ok: true,
    value: {
      warningSigns,
      steps,
      contacts,
      crisisResources
    }
  };
}

export function validateSafetyEventPayload(payload) {
  const riskTier = String(payload?.riskTier ?? "").trim();
  const triggerType = String(payload?.triggerType ?? "").trim();
  const outcome = String(payload?.outcome ?? "").trim();
  const context = payload?.context && typeof payload.context === "object" && !Array.isArray(payload.context)
    ? payload.context
    : {};

  if (!["elevated", "acute"].includes(riskTier)) {
    return { ok: false, message: "Safety risk tier is required." };
  }
  if (!triggerType || triggerType.length > 80) {
    return { ok: false, message: "Safety trigger type is required." };
  }
  if (!outcome || outcome.length > 80) {
    return { ok: false, message: "Safety outcome is required." };
  }

  return {
    ok: true,
    value: {
      riskTier,
      triggerType,
      outcome,
      context
    }
  };
}

export function validateSafetyEventResolutionPayload(payload) {
  const resolutionStatus = String(payload?.resolutionStatus ?? "").trim();
  const resolutionNote = String(payload?.resolutionNote ?? "").trim().slice(0, 1000);
  const resolvedAt = String(payload?.resolvedAt ?? new Date().toISOString()).trim();

  if (!["resolved", "dismissed"].includes(resolutionStatus)) {
    return { ok: false, message: "Resolution status is required." };
  }
  if (!resolutionNote) return { ok: false, message: "Resolution note is required." };
  if (Number.isNaN(Date.parse(resolvedAt))) return { ok: false, message: "Resolution time is required." };

  return {
    ok: true,
    value: {
      resolutionStatus,
      resolutionNote,
      resolvedAt
    }
  };
}

export function validateFocusPlanPayload(payload) {
  const focusText = String(payload?.focusText ?? "").trim();
  const anticipatedHardMoment = String(payload?.anticipatedHardMoment ?? "").trim();
  const plannedSkill = String(payload?.plannedSkill ?? "").trim();

  if (!focusText) {
    return { ok: false, message: "One focus is required." };
  }

  if (!anticipatedHardMoment) {
    return { ok: false, message: "Likely hard moment is required." };
  }

  if (!plannedSkill) {
    return { ok: false, message: "Skill or support step is required." };
  }

  if ([focusText, anticipatedHardMoment, plannedSkill].some(value => value.length > 180)) {
    return { ok: false, message: "Focus plan fields must stay short." };
  }

  return {
    ok: true,
    value: {
      focusText,
      anticipatedHardMoment,
      plannedSkill
    }
  };
}

export function validateAnchorCompletionPayload(payload) {
  const completedAt = String(payload?.completedAt ?? "").trim();
  const checkInId = String(payload?.checkInId ?? "").trim();

  if (!completedAt || Number.isNaN(Date.parse(completedAt))) {
    return { ok: false, message: "Completion time is required." };
  }

  if (!checkInId) {
    return { ok: false, message: "Saved check-in is required." };
  }

  return {
    ok: true,
    value: {
      completedAt,
      checkInId
    }
  };
}

export function validateDayResetPayload(payload) {
  const mode = String(payload?.mode ?? "").trim();
  const mustDos = normalizeStringList(payload?.mustDos);
  const defer = normalizeStringList(payload?.defer);
  const regulationAction = String(payload?.regulationAction ?? "").trim();

  if (!["full_day", "minimum_viable_day"].includes(mode)) {
    return { ok: false, message: "Reset mode is required." };
  }

  if (!mustDos.length) {
    return { ok: false, message: "One must-do is required." };
  }

  if (mustDos.length > 3) {
    return { ok: false, message: "Keep the reset to three must-dos or fewer." };
  }

  if (!regulationAction) {
    return { ok: false, message: "One regulation action is required." };
  }

  return {
    ok: true,
    value: {
      mode,
      mustDos,
      defer,
      regulationAction
    }
  };
}

export function validateDiaryEntryPayload(payload, pathDate) {
  const entryDate = String(payload?.entryDate ?? "").trim();
  const anchorCompletion = payload?.anchorCompletion ?? {};
  const emotionRatings = payload?.emotionRatings ?? {};
  const urgeRatings = payload?.urgeRatings ?? {};
  const targetOccurrences = Array.isArray(payload?.targetOccurrences) ? payload.targetOccurrences : [];
  const skillsUsed = normalizeStringList(payload?.skillsUsed);
  const overallDayDifficulty = Number(payload?.overallDayDifficulty);
  const optionalFields = normalizeDiaryOptionalFields(payload?.optionalFields ?? {});

  if (!isDate(entryDate) || entryDate !== pathDate) {
    return { ok: false, message: "Diary date must match the route date." };
  }

  for (const anchor of ["morning", "midday", "evening"]) {
    if (!ANCHOR_COMPLETION_VALUES.includes(anchorCompletion?.[anchor])) {
      return { ok: false, message: `${capitalize(anchor)} completion is required.` };
    }
  }

  for (const field of DIARY_EMOTION_FIELDS) {
    if (!isScore(Number(emotionRatings?.[field]))) {
      return { ok: false, message: `${diaryFieldLabel(field)} is required.` };
    }
  }

  for (const field of DIARY_URGE_FIELDS) {
    if (!isScore(Number(urgeRatings?.[field]))) {
      return { ok: false, message: `${diaryFieldLabel(field)} is required.` };
    }
  }

  if (!isScore(overallDayDifficulty)) {
    return { ok: false, message: "Overall day difficulty is required." };
  }

  const normalizedTargets = targetOccurrences.map(target => ({
    targetKey: String(target?.targetKey ?? "").trim(),
    occurrence: String(target?.occurrence ?? "").trim()
  }));

  for (const target of normalizedTargets) {
    if (!DEFAULT_TARGET_KEYS.includes(target.targetKey) || !TARGET_OCCURRENCE_VALUES.includes(target.occurrence)) {
      return { ok: false, message: "Target occurrence is not valid." };
    }
  }

  return {
    ok: true,
    value: {
      entryDate,
      anchorCompletion: {
        morning: anchorCompletion.morning,
        midday: anchorCompletion.midday,
        evening: anchorCompletion.evening
      },
      emotionRatings: Object.fromEntries(DIARY_EMOTION_FIELDS.map(field => [field, Number(emotionRatings[field])])),
      urgeRatings: Object.fromEntries(DIARY_URGE_FIELDS.map(field => [field, Number(urgeRatings[field])])),
      targetOccurrences: normalizedTargets,
      skillsUsed,
      overallDayDifficulty,
      optionalFields
    }
  };
}

export function validateSkillSessionPayload(payload) {
  const startedAt = String(payload?.startedAt ?? "").trim();
  const completedAt = String(payload?.completedAt ?? "").trim();
  const helpfulnessRating = Number(payload?.helpfulnessRating);
  const sourceContext = String(payload?.sourceContext ?? "").trim();

  if (!startedAt || Number.isNaN(Date.parse(startedAt))) {
    return { ok: false, message: "Skill start time is required." };
  }

  if (!completedAt || Number.isNaN(Date.parse(completedAt))) {
    return { ok: false, message: "Skill completion time is required." };
  }

  if (Date.parse(completedAt) < Date.parse(startedAt)) {
    return { ok: false, message: "Skill completion cannot be before start." };
  }

  if (!isScore(helpfulnessRating)) {
    return { ok: false, message: "Helpfulness rating is required." };
  }

  if (!["library", "today", "diary"].includes(sourceContext)) {
    return { ok: false, message: "Skill source is required." };
  }

  return {
    ok: true,
    value: {
      startedAt,
      completedAt,
      helpfulnessRating,
      sourceContext
    }
  };
}

export function validateCoachMessagePayload(payload) {
  const message = String(payload?.message ?? "").trim();
  const mode = String(payload?.mode ?? "").trim();
  const contextRefs = payload?.contextRefs && typeof payload.contextRefs === "object" && !Array.isArray(payload.contextRefs)
    ? Object.fromEntries(
      Object.entries(payload.contextRefs)
        .map(([key, value]) => [key, String(value ?? "").trim()])
        .filter(([, value]) => value)
    )
    : {};

  if (!message) {
    return { ok: false, message: "Coach message is required." };
  }

  if (message.length > 1000) {
    return { ok: false, message: "Coach message is too long." };
  }

  if (!["reset", "skill", "planning", "freeform"].includes(mode)) {
    return { ok: false, message: "Coach mode is required." };
  }

  return {
    ok: true,
    value: {
      message,
      mode,
      contextRefs
    }
  };
}

export function validateChainCreatePayload(payload) {
  const sourceDiaryEntryId = String(payload?.sourceDiaryEntryId ?? "").trim() || null;
  const promptingEvent = String(payload?.promptingEvent ?? "").trim();

  if (!promptingEvent) {
    return { ok: false, message: "Prompting event is required." };
  }

  if (promptingEvent.length > 280) {
    return { ok: false, message: "Prompting event must be brief." };
  }

  return {
    ok: true,
    value: {
      sourceDiaryEntryId,
      promptingEvent
    }
  };
}

export function validateChainPatchPayload(payload) {
  const status = String(payload?.status ?? "draft").trim();
  const vulnerabilities = normalizeStringList(payload?.vulnerabilities);
  const links = normalizeStringList(payload?.links);
  const consequences = normalizeStringList(payload?.consequences);
  const alternatives = normalizeStringList(payload?.alternatives);

  if (!["draft", "complete"].includes(status)) {
    return { ok: false, message: "Chain status is required." };
  }

  if (status === "complete" && (!vulnerabilities.length || !links.length || !consequences.length || !alternatives.length)) {
    return { ok: false, message: "Complete chain fields are required." };
  }

  return {
    ok: true,
    value: {
      vulnerabilities,
      links,
      consequences,
      alternatives,
      status
    }
  };
}

export function validateVoiceClientSecretPayload(payload) {
  const mode = String(payload?.mode ?? "").trim();
  const doNotSave = payload?.doNotSave === true;
  const useLiveRealtime = payload?.useLiveRealtime === true;
  const contextRefs = normalizeContextRefs(payload?.contextRefs);
  const sdpOffer = String(payload?.sdpOffer ?? "").trim();

  if (!["reset", "skill", "planning", "freeform"].includes(mode)) {
    return { ok: false, message: "Voice mode is required." };
  }

  return {
    ok: true,
    value: {
      mode,
      doNotSave,
      useLiveRealtime,
      contextRefs,
      sdpOffer: sdpOffer || null
    }
  };
}

export function validateVoiceEndPayload(payload) {
  const endedAt = String(payload?.endedAt ?? "").trim();
  const savedSummary = String(payload?.savedSummary ?? "").trim();
  const transcriptOptIn = payload?.transcriptOptIn === true;

  if (!endedAt || Number.isNaN(Date.parse(endedAt))) {
    return { ok: false, message: "Voice end time is required." };
  }

  if (savedSummary.length > 500) {
    return { ok: false, message: "Voice summary is too long." };
  }

  return {
    ok: true,
    value: {
      endedAt,
      savedSummary,
      transcriptOptIn
    }
  };
}

export function validateSessionPacketPayload(payload) {
  const dateRange = normalizeDateRange(payload?.dateRange);
  const includedSections = normalizeStringList(payload?.includedSections)
    .filter(section => ["diary", "skills", "chains", "insights"].includes(section));
  const redactions = payload?.redactions && typeof payload.redactions === "object" && !Array.isArray(payload.redactions)
    ? { notes: payload.redactions.notes === true }
    : { notes: false };
  const shareMode = String(payload?.shareMode ?? "").trim();

  if (!dateRange) {
    return { ok: false, message: "Packet date range is required." };
  }

  if (!includedSections.length) {
    return { ok: false, message: "At least one packet section is required." };
  }

  if (!["download", "local_share"].includes(shareMode)) {
    return { ok: false, message: "Packet share mode is required." };
  }

  return {
    ok: true,
    value: {
      dateRange,
      includedSections,
      redactions,
      shareMode
    }
  };
}

export function validateSettingsPayload(payload) {
  const transcriptRetentionDays = Number(payload?.transcriptRetentionDays);
  const traceRetentionDays = Number(payload?.traceRetentionDays);
  const quietHoursStart = String(payload?.quietHoursStart ?? "22:00").trim();
  const quietHoursEnd = String(payload?.quietHoursEnd ?? "07:00").trim();

  if (![0, 7, 30, 90].includes(transcriptRetentionDays)) {
    return { ok: false, message: "Transcript retention is required." };
  }

  if (![7, 30, 90, 365].includes(traceRetentionDays)) {
    return { ok: false, message: "Trace retention is required." };
  }

  if (!isTime(quietHoursStart) || !isTime(quietHoursEnd)) {
    return { ok: false, message: "Quiet hours are required." };
  }

  return {
    ok: true,
    value: {
      transcriptRetentionDays,
      traceRetentionDays,
      audioConsent: payload?.audioConsent === true,
      shareConsent: payload?.shareConsent === true,
      notificationOptIn: payload?.notificationOptIn === true,
      quietHoursStart,
      quietHoursEnd
    }
  };
}

export function validatePrivacyExportPayload(payload) {
  const format = String(payload?.format ?? "").trim();
  const dateRange = normalizeDateRange(payload?.dateRange);

  if (!["json", "pdf"].includes(format)) {
    return { ok: false, message: "Export format is required." };
  }

  if (!dateRange) {
    return { ok: false, message: "Export date range is required." };
  }

  return {
    ok: true,
    value: {
      format,
      dateRange
    }
  };
}

export function validateDeleteRequestPayload(payload) {
  const scope = String(payload?.scope ?? "").trim();
  const confirmation = String(payload?.confirmation ?? "").trim();

  if (!["all"].includes(scope)) {
    return { ok: false, message: "Delete scope is required." };
  }

  if (confirmation !== "DELETE") {
    return { ok: false, message: "Delete confirmation must be DELETE." };
  }

  return {
    ok: true,
    value: { scope }
  };
}

export function validateDeleteExecutionPayload(payload) {
  const confirmation = String(payload?.confirmation ?? "").trim();

  if (confirmation !== "DELETE") {
    return { ok: false, message: "Delete confirmation must be DELETE." };
  }

  return {
    ok: true,
    value: { confirmation }
  };
}

export function validateOfflineQueuePayload(payload) {
  const clientId = String(payload?.clientId ?? "").trim();
  const mutations = Array.isArray(payload?.mutations) ? payload.mutations : [];

  if (!clientId) {
    return { ok: false, message: "Client id is required." };
  }

  const normalized = mutations.map(mutation => ({
    clientMutationId: String(mutation?.clientMutationId ?? "").trim(),
    entityType: String(mutation?.entityType ?? "").trim(),
    operation: String(mutation?.operation ?? "").trim(),
    occurredAt: String(mutation?.occurredAt ?? "").trim(),
    payload: mutation?.payload && typeof mutation.payload === "object" && !Array.isArray(mutation.payload)
      ? mutation.payload
      : {}
  }));

  if (!normalized.length) {
    return { ok: false, message: "At least one offline mutation is required." };
  }

  const invalid = normalized.find(mutation =>
    !mutation.clientMutationId ||
    !["quick_check_in", "diary_entry", "routine_completion", "skill_session", "chain_analysis"].includes(mutation.entityType) ||
    !["create", "update"].includes(mutation.operation) ||
    !mutation.occurredAt ||
    Number.isNaN(Date.parse(mutation.occurredAt))
  );

  if (invalid) {
    return { ok: false, message: "Offline mutation is not valid." };
  }

  return {
    ok: true,
    value: {
      clientId,
      mutations: normalized
    }
  };
}

function labelForConsent(type) {
  switch (type) {
    case "crisis_limits":
      return "Crisis limits consent is required.";
    case "privacy_choices":
      return "Privacy choices consent is required.";
    case "voice_audio":
      return "Voice audio consent is required.";
    default:
      return "Required consent is missing.";
  }
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item ?? "").trim()).filter(Boolean);
}

function normalizeSafetyContact(contact) {
  const name = String(contact?.name ?? "").trim();
  const relationship = String(contact?.relationship ?? "").trim();
  const phone = String(contact?.phone ?? "").trim();
  if (!name || !phone) return null;
  return { name, relationship, phone };
}

function normalizeSafetyResource(resource) {
  const label = String(resource?.label ?? "").trim();
  const value = String(resource?.value ?? "").trim();
  if (!label || !value) return null;
  return { label, value };
}

function normalizeContextRefs(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, ref]) => [String(key).trim(), String(ref ?? "").trim()])
      .filter(([key, ref]) => key && ref)
  );
}

function normalizeDateRange(value) {
  const start = String(value?.start ?? "").trim();
  const end = String(value?.end ?? "").trim();
  if (!isDate(start) || !isDate(end) || end < start) return null;
  return { start, end };
}

function isTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 5;
}

function normalizeDiaryOptionalFields(optionalFields) {
  const sleepDurationMinutes = optionalFields?.sleepDurationMinutes === "" || optionalFields?.sleepDurationMinutes == null
    ? null
    : Number(optionalFields.sleepDurationMinutes);
  const sleepQuality = optionalFields?.sleepQuality === "" || optionalFields?.sleepQuality == null
    ? null
    : Number(optionalFields.sleepQuality);
  const medicationAdherence = String(optionalFields?.medicationAdherence ?? "").trim();
  const notes = String(optionalFields?.notes ?? "").trim();

  return {
    sleepDurationMinutes: Number.isInteger(sleepDurationMinutes) && sleepDurationMinutes >= 0 ? sleepDurationMinutes : null,
    sleepQuality: isScore(sleepQuality) ? sleepQuality : null,
    medicationAdherence: ["taken", "missed", "not_applicable"].includes(medicationAdherence) ? medicationAdherence : null,
    notes: notes.slice(0, 500)
  };
}

function diaryFieldLabel(field) {
  const labels = {
    anxietyFear: "Anxiety/fear",
    sadness: "Sadness",
    anger: "Anger",
    shame: "Shame",
    guilt: "Guilt",
    numbness: "Numbness",
    joyCalm: "Joy/calm",
    selfHarm: "Self-harm urge",
    suicidality: "Suicidality urge",
    substanceUse: "Substance use urge",
    bingeRestrictPurge: "Binge/restrict/purge urge",
    isolateAvoid: "Isolate/avoid urge",
    quitGiveUp: "Quit/give-up urge",
    lashOut: "Lash out urge"
  };
  return labels[field] ?? field;
}

function capitalize(value) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

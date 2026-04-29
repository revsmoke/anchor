const statusEl = document.querySelector("#snapshot-status");
const dataEl = document.querySelector("#snapshot-data");
const errorEl = document.querySelector("#snapshot-error");

const productEl = document.querySelector("[data-testid='snapshot-product']");
const dateEl = document.querySelector("[data-testid='snapshot-date']");
const summaryEl = document.querySelector("[data-testid='snapshot-summary']");
const consentForm = document.querySelector("#consent-form");
const consentErrorEl = document.querySelector("#consent-error");
const consentStatusEl = document.querySelector("#consent-status");
const onboardingSection = document.querySelector("#onboarding-section");
const onboardingForm = document.querySelector("#onboarding-form");
const onboardingErrorEl = document.querySelector("#onboarding-error");
const onboardingStatusEl = document.querySelector("#onboarding-status");
const routineResultEl = document.querySelector("#routine-result");
const anchorListEl = document.querySelector("[data-testid='anchor-list']");
const nextBestStepEl = document.querySelector("#next-best-step");
const checkInSection = document.querySelector("#check-in-section");
const checkInForm = document.querySelector("#check-in-form");
const checkInErrorEl = document.querySelector("#check-in-error");
const checkInStatusEl = document.querySelector("#check-in-status");
const checkInResultEl = document.querySelector("#check-in-result");
const suggestedActionEl = document.querySelector("#suggested-action");
const completionNextStepEl = document.querySelector("#completion-next-step");
const safetyModeEl = document.querySelector("#safety-mode");
const safetyModeMessageEl = document.querySelector("#safety-mode-message");
const resetSection = document.querySelector("#reset-section");
const resetForm = document.querySelector("#reset-form");
const resetErrorEl = document.querySelector("#reset-error");
const resetStatusEl = document.querySelector("#reset-status");
const resetResultEl = document.querySelector("#reset-result");
const resetNextStepEl = document.querySelector("#reset-next-step");
const resetDeferredEl = document.querySelector("#reset-deferred");
const resetAnchorListEl = document.querySelector("[data-testid='reset-anchor-list']");
const diarySection = document.querySelector("#diary-section");
const diaryForm = document.querySelector("#diary-form");
const diaryDateEl = document.querySelector("#diary-date");
const diaryErrorEl = document.querySelector("#diary-error");
const diaryStatusEl = document.querySelector("#diary-status");
const diaryResultEl = document.querySelector("#diary-result");
const diaryNextStepEl = document.querySelector("#diary-next-step");
const diaryTopTargetEl = document.querySelector("#diary-top-target");
const skillsSection = document.querySelector("#skills-section");
const skillsStatusEl = document.querySelector("#skills-status");
const skillsErrorEl = document.querySelector("#skills-error");
const skillsRecentEl = document.querySelector("#skills-recent");
const skillsListEl = document.querySelector("#skills-list");
const skillSearchEl = document.querySelector("#skill-search");
const skillDetailEl = document.querySelector("#skill-detail");
const skillDetailHeadingEl = document.querySelector("#skill-detail-heading");
const skillWhenEl = document.querySelector("#skill-when");
const skillWhyEl = document.querySelector("#skill-why");
const skillDurationEl = document.querySelector("#skill-duration");
const skillStepsEl = document.querySelector("#skill-steps");
const skillStartButton = document.querySelector("#skill-start");
const skillTimerEl = document.querySelector("#skill-timer");
const skillSessionForm = document.querySelector("#skill-session-form");
const skillHelpfulnessEl = document.querySelector("#skill-helpfulness");
const skillSessionErrorEl = document.querySelector("#skill-session-error");
const skillSessionStatusEl = document.querySelector("#skill-session-status");
const skillFollowUpEl = document.querySelector("#skill-follow-up");
const skillModuleButtons = [...document.querySelectorAll("[data-module-filter]")];
const coachSection = document.querySelector("#coach-section");
const coachForm = document.querySelector("#coach-form");
const coachModeEl = document.querySelector("#coach-mode");
const coachMessageEl = document.querySelector("#coach-message");
const coachSendButton = document.querySelector("#coach-send");
const coachErrorEl = document.querySelector("#coach-error");
const coachStatusEl = document.querySelector("#coach-status");
const coachThreadEl = document.querySelector("#coach-thread");
const coachReplyEl = document.querySelector("#coach-reply");
const coachNextActionEl = document.querySelector("#coach-next-action");
const coachSpecialistEl = document.querySelector("#coach-specialist");
const coachSafetyModeEl = document.querySelector("#coach-safety-mode");
const coachSafetyTitleEl = document.querySelector("#coach-safety-title");
const coachSafetyMessageEl = document.querySelector("#coach-safety-message");
const coachGroundingSkillEl = document.querySelector("#coach-grounding-skill");
const chainSection = document.querySelector("#chain-section");
const chainForm = document.querySelector("#chain-form");
const chainCompleteForm = document.querySelector("#chain-complete-form");
const chainErrorEl = document.querySelector("#chain-error");
const chainStatusEl = document.querySelector("#chain-status");
const chainCompleteErrorEl = document.querySelector("#chain-complete-error");
const chainCompleteStatusEl = document.querySelector("#chain-complete-status");
const chainPreventionPlanEl = document.querySelector("#chain-prevention-plan");
const voiceSection = document.querySelector("#voice-section");
const voiceForm = document.querySelector("#voice-form");
const voiceEndButton = document.querySelector("#voice-end");
const voiceErrorEl = document.querySelector("#voice-error");
const voiceStatusEl = document.querySelector("#voice-status");
const voicePreviewEl = document.querySelector("#voice-preview");
const voiceEndStatusEl = document.querySelector("#voice-end-status");
const insightsSection = document.querySelector("#insights-section");
const insightsLoadButton = document.querySelector("#insights-load");
const insightsErrorEl = document.querySelector("#insights-error");
const insightsResultEl = document.querySelector("#insights-result");
const insightsScoreEl = document.querySelector("#insights-score");
const insightsCardTitleEl = document.querySelector("#insights-card-title");
const weeklyRecommendationEl = document.querySelector("#weekly-recommendation");
const packetSection = document.querySelector("#packet-section");
const packetForm = document.querySelector("#packet-form");
const packetErrorEl = document.querySelector("#packet-error");
const packetStatusEl = document.querySelector("#packet-status");
const packetDownloadEl = document.querySelector("#packet-download");
const privacySection = document.querySelector("#privacy-section");
const privacyForm = document.querySelector("#privacy-form");
const privacyErrorEl = document.querySelector("#privacy-error");
const privacyStatusEl = document.querySelector("#privacy-status");
const privacyExportButton = document.querySelector("#privacy-export");
const exportStatusEl = document.querySelector("#export-status");
const deleteForm = document.querySelector("#delete-form");
const deleteExecuteButton = document.querySelector("#delete-execute");
const deleteErrorEl = document.querySelector("#delete-error");
const deleteStatusEl = document.querySelector("#delete-status");
const offlineSection = document.querySelector("#offline-section");
const notificationForm = document.querySelector("#notification-form");
const notificationErrorEl = document.querySelector("#notification-error");
const notificationStatusEl = document.querySelector("#notification-status");
const offlineForm = document.querySelector("#offline-form");
const offlineErrorEl = document.querySelector("#offline-error");
const offlineStatusEl = document.querySelector("#offline-status");

let morningAnchorId = "";
let allSkills = [];
let activeSkill = null;
let activeSkillStartedAt = "";
let activeSkillModule = "";
let activeChainId = "";
let activeVoiceSessionId = "";
let activeDeleteRequestId = "";
let csrfToken = "";

loadTodaySnapshot();
registerServiceWorker();
consentForm.addEventListener("submit", saveConsent);
onboardingForm.addEventListener("submit", saveOnboarding);
checkInForm.addEventListener("submit", saveQuickCheckIn);
resetForm.addEventListener("submit", saveDayReset);
diaryForm.addEventListener("submit", saveDiaryCard);
coachForm.addEventListener("submit", sendCoachMessage);
chainForm.addEventListener("submit", createChainAnalysis);
chainCompleteForm.addEventListener("submit", completeChainAnalysis);
voiceForm.addEventListener("submit", startVoiceSession);
voiceEndButton.addEventListener("click", endVoiceSession);
insightsLoadButton.addEventListener("click", loadInsightsAndReview);
packetForm.addEventListener("submit", generateSessionPacket);
privacyForm.addEventListener("submit", savePrivacySettings);
privacyExportButton.addEventListener("click", exportPrivacyData);
deleteForm.addEventListener("submit", requestAccountDelete);
deleteExecuteButton.addEventListener("click", executeAccountDelete);
notificationForm.addEventListener("submit", saveNotificationSettings);
offlineForm.addEventListener("submit", syncOfflineQueue);
skillSearchEl.addEventListener("input", renderFilteredSkills);
skillStartButton.addEventListener("click", startSkillExercise);
skillSessionForm.addEventListener("submit", completeSkillExercise);
skillModuleButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeSkillModule = button.dataset.moduleFilter;
    renderFilteredSkills();
  });
});

async function loadTodaySnapshot() {
  try {
    const response = await fetch("/api/today/snapshot");
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload?.error?.message || "Today snapshot is unavailable.");
    }

    renderSnapshot(payload.data);
  } catch (error) {
    renderError(error.message || "Today snapshot is unavailable.");
  }
}

function renderSnapshot(snapshot) {
  productEl.textContent = snapshot.productName;
  dateEl.textContent = snapshot.snapshotDate;
  summaryEl.textContent = snapshot.morningAnchorSummary;

  statusEl.textContent = "Loaded from PostgreSQL.";
  dataEl.hidden = false;
  errorEl.hidden = true;
  errorEl.textContent = "";
}

function renderError(message) {
  statusEl.textContent = "Unable to load today.";
  dataEl.hidden = true;
  errorEl.hidden = false;
  errorEl.textContent = message;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/service-worker.js");
  } catch {
    // PWA install support is progressive; app behavior remains available without it.
  }
}

async function saveConsent(event) {
  event.preventDefault();
  hideConsentMessages();

  const formData = new FormData(consentForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const crisis = document.querySelector("#consent-crisis").checked;
  const privacy = document.querySelector("#consent-privacy").checked;
  const voice = document.querySelector("#consent-voice").checked;

  const localError = validateConsentForm({ email, password, crisis, privacy, voice });
  if (localError) {
    renderConsentError(localError);
    return;
  }

  const submitButton = consentForm.querySelector("button");
  submitButton.disabled = true;

  try {
    await postJson("/api/auth/signup", {
      email,
      password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Detroit",
      locale: navigator.language || "en-US"
    });
    await ensureCsrfToken();

    await postJson("/api/onboarding/consent", {
      consents: [
        { type: "crisis_limits", granted: crisis },
        { type: "privacy_choices", granted: privacy },
        { type: "voice_audio", granted: voice }
      ]
    });

    consentStatusEl.hidden = false;
    consentStatusEl.textContent = "Consent saved. Next: onboarding setup.";
    onboardingSection.hidden = false;
  } catch (error) {
    renderConsentError(error.message || "Consent could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

async function saveOnboarding(event) {
  event.preventDefault();
  hideOnboardingMessages();

  const formData = new FormData(onboardingForm);
  const profile = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Detroit",
    wakeTime: String(formData.get("wakeTime") || ""),
    sleepTime: String(formData.get("sleepTime") || ""),
    goals: splitList(formData.get("goals")),
    struggles: splitList(formData.get("struggles")),
    therapyStatus: String(formData.get("therapyStatus") || "")
  };

  const localError = validateOnboarding(profile);
  if (localError) {
    renderOnboardingError(localError);
    return;
  }

  const anchors = [
    { type: "morning", targetTime: String(formData.get("morningTime") || ""), steps: ["check_in", "top_focus", "cope_ahead"] },
    { type: "midday", targetTime: String(formData.get("middayTime") || ""), steps: ["status", "reset", "skill"] },
    { type: "evening", targetTime: String(formData.get("eveningTime") || ""), steps: ["diary", "reflect", "tomorrow"] }
  ];

  const submitButton = onboardingForm.querySelector("button");
  submitButton.disabled = true;

  try {
    await postJson("/api/onboarding/profile", profile);
    const setup = await postJson("/api/onboarding/routines", { anchors });
    renderRoutineSetup(setup);
  } catch (error) {
    renderOnboardingError(error.message || "Routine setup could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

function validateConsentForm({ email, password, crisis, privacy, voice }) {
  if (!email.includes("@")) return "Enter a valid email.";
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!crisis) return "Crisis limits consent is required.";
  if (!privacy) return "Privacy choices consent is required.";
  if (!voice) return "Voice audio consent is required.";
  return "";
}

async function postJson(path, body) {
  return requestJson("POST", path, body);
}

async function putJson(path, body) {
  return requestJson("PUT", path, body);
}

async function patchJson(path, body) {
  return requestJson("PATCH", path, body);
}

async function getJson(path) {
  return requestJson("GET", path);
}

async function requestJson(method, path, body) {
  const options = {
    method,
    headers: {}
  };

  if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    options.headers["x-csrf-token"] = csrfToken;
  }

  if (body !== undefined) {
    options.headers["content-type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);
  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    throw new Error(payload?.error?.message || "Request failed.");
  }

  return payload.data;
}

async function ensureCsrfToken() {
  try {
    const result = await getJson("/api/csrf");
    csrfToken = result.csrfToken;
  } catch {
    csrfToken = "";
  }
}

function hideConsentMessages() {
  consentErrorEl.hidden = true;
  consentErrorEl.textContent = "";
  consentStatusEl.hidden = true;
  consentStatusEl.textContent = "";
}

function renderConsentError(message) {
  consentErrorEl.hidden = false;
  consentErrorEl.textContent = message;
}

function validateOnboarding(profile) {
  if (!profile.wakeTime) return "Wake time is required.";
  if (!profile.sleepTime) return "Sleep time is required.";
  if (!profile.goals.length) return "At least one goal is required.";
  if (!profile.struggles.length) return "At least one hard moment is required.";
  if (!profile.therapyStatus) return "Therapy status is required.";
  return "";
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function hideOnboardingMessages() {
  onboardingErrorEl.hidden = true;
  onboardingErrorEl.textContent = "";
  onboardingStatusEl.hidden = true;
  onboardingStatusEl.textContent = "";
}

function renderOnboardingError(message) {
  onboardingErrorEl.hidden = false;
  onboardingErrorEl.textContent = message;
}

function renderRoutineSetup(setup) {
  onboardingStatusEl.hidden = false;
  onboardingStatusEl.textContent = "Your three anchors are ready.";
  routineResultEl.hidden = false;
  anchorListEl.innerHTML = "";
  morningAnchorId = setup.today.find(anchor => anchor.type === "morning")?.id || "";

  setup.today.forEach(anchor => {
    const item = document.createElement("li");
    item.textContent = `${capitalize(anchor.type)} - ${anchor.targetTime}`;
    anchorListEl.append(item);
  });

  nextBestStepEl.textContent = setup.dailyPlan.nextBestStep;
  checkInSection.hidden = false;
  resetSection.hidden = false;
  diarySection.hidden = false;
  skillsSection.hidden = false;
  coachSection.hidden = false;
  chainSection.hidden = false;
  voiceSection.hidden = false;
  insightsSection.hidden = false;
  packetSection.hidden = false;
  privacySection.hidden = false;
  offlineSection.hidden = false;
  diaryDateEl.value = new Date().toISOString().slice(0, 10);
  checkInResultEl.hidden = true;
  safetyModeEl.hidden = true;
  resetResultEl.hidden = true;
  diaryResultEl.hidden = true;
  skillDetailEl.hidden = true;
  coachThreadEl.hidden = true;
  coachSafetyModeEl.hidden = true;
  chainCompleteForm.hidden = true;
  chainPreventionPlanEl.hidden = true;
  voiceEndButton.hidden = true;
  voiceEndStatusEl.hidden = true;
  insightsResultEl.hidden = true;
  packetDownloadEl.hidden = true;
  loadSkills();
}

async function saveQuickCheckIn(event) {
  event.preventDefault();
  hideCheckInMessages();

  const formData = new FormData(checkInForm);
  const checkIn = {
    createdAt: new Date().toISOString(),
    anchorContext: "morning",
    primaryEmotionScore: scoreValue(formData.get("primaryEmotionScore")),
    primaryUrgeScore: scoreValue(formData.get("primaryUrgeScore")),
    energyState: String(formData.get("energyState") || ""),
    suggestedNextActionStatus: String(formData.get("suggestedNextActionStatus") || "accepted"),
    note: String(formData.get("note") || "").trim(),
    locationContext: String(formData.get("locationContext") || "")
  };

  const localError = validateCheckIn(checkIn);
  if (localError) {
    renderCheckInError(localError);
    return;
  }

  const submitButton = checkInForm.querySelector("button");
  submitButton.disabled = true;

  try {
    const result = await postJson("/api/check-ins", checkIn);
    if (result.safetyMode) {
      renderSafetyMode(result.safetyMode);
      return;
    }

    const completion = await postJson(`/api/today/anchors/${morningAnchorId}/complete`, {
      completedAt: new Date().toISOString(),
      checkInId: result.checkIn.id
    });
    renderCheckInComplete(result, completion);
  } catch (error) {
    renderCheckInError(error.message || "Check-in could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

function scoreValue(value) {
  return value === "" || value === null ? null : Number(value);
}

function validateCheckIn(checkIn) {
  if (!Number.isInteger(checkIn.primaryEmotionScore)) return "Mood is required.";
  if (!Number.isInteger(checkIn.primaryUrgeScore)) return "Urge is required.";
  if (!checkIn.energyState) return "Energy is required.";
  if (!morningAnchorId) return "Morning anchor is not ready.";
  return "";
}

function hideCheckInMessages() {
  checkInErrorEl.hidden = true;
  checkInErrorEl.textContent = "";
  checkInStatusEl.hidden = true;
  checkInStatusEl.textContent = "";
  checkInResultEl.hidden = true;
  safetyModeEl.hidden = true;
}

function renderCheckInError(message) {
  checkInErrorEl.hidden = false;
  checkInErrorEl.textContent = message;
}

function renderCheckInComplete(checkInResult, completion) {
  checkInStatusEl.hidden = false;
  checkInStatusEl.textContent = "Morning anchor complete.";
  checkInResultEl.hidden = false;
  suggestedActionEl.textContent = checkInResult.suggestedNextAction.label;
  completionNextStepEl.textContent = completion.nextBestStep;
}

function renderSafetyMode(safetyMode) {
  safetyModeEl.hidden = false;
  safetyModeMessageEl.textContent = safetyMode.message;
}

async function saveDayReset(event) {
  event.preventDefault();
  hideResetMessages();

  const formData = new FormData(resetForm);
  const reset = {
    mode: String(formData.get("mode") || "full_day"),
    mustDos: splitList(formData.get("mustDos")),
    defer: splitList(formData.get("defer")),
    regulationAction: String(formData.get("regulationAction") || "").trim()
  };

  const localError = validateDayReset(reset);
  if (localError) {
    renderResetError(localError);
    return;
  }

  const submitButton = resetForm.querySelector("button");
  submitButton.disabled = true;

  try {
    const result = await postJson("/api/today/reset", reset);
    renderDayReset(result);
  } catch (error) {
    renderResetError(error.message || "Day reset could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

function validateDayReset(reset) {
  if (!reset.mustDos.length) return "One must-do is required.";
  if (!reset.regulationAction) return "One regulation action is required.";
  return "";
}

function hideResetMessages() {
  resetErrorEl.hidden = true;
  resetErrorEl.textContent = "";
  resetStatusEl.hidden = true;
  resetStatusEl.textContent = "";
  resetResultEl.hidden = true;
}

function renderResetError(message) {
  resetErrorEl.hidden = false;
  resetErrorEl.textContent = message;
}

function renderDayReset(result) {
  resetStatusEl.hidden = false;
  resetStatusEl.textContent = result.dailyPlan.mode === "minimum_viable_day"
    ? "Minimum viable day set."
    : "Today reset.";
  resetResultEl.hidden = false;
  resetNextStepEl.textContent = result.nextBestStep;
  resetDeferredEl.textContent = result.dailyPlan.deferredItems?.length
    ? `Deferred: ${result.dailyPlan.deferredItems.join(", ")}`
    : "Deferred: none";
  resetAnchorListEl.innerHTML = "";

  result.anchors.forEach(anchor => {
    const item = document.createElement("li");
    item.textContent = `${capitalize(anchor.type)} - ${anchor.status}`;
    resetAnchorListEl.append(item);
  });
}

async function saveDiaryCard(event) {
  event.preventDefault();
  hideDiaryMessages();

  const formData = new FormData(diaryForm);
  const entryDate = String(formData.get("entryDate") || new Date().toISOString().slice(0, 10));
  const entry = {
    entryDate,
    anchorCompletion: {
      morning: String(formData.get("morningCompletion") || ""),
      midday: String(formData.get("middayCompletion") || ""),
      evening: String(formData.get("eveningCompletion") || "")
    },
    emotionRatings: {
      anxietyFear: scoreValue(formData.get("anxietyFear")),
      sadness: scoreValue(formData.get("sadness")),
      anger: scoreValue(formData.get("anger")),
      shame: scoreValue(formData.get("shame")),
      guilt: scoreValue(formData.get("guilt")),
      numbness: scoreValue(formData.get("numbness")),
      joyCalm: scoreValue(formData.get("joyCalm"))
    },
    urgeRatings: {
      selfHarm: scoreValue(formData.get("selfHarm")),
      suicidality: scoreValue(formData.get("suicidality")),
      substanceUse: scoreValue(formData.get("substanceUse")),
      bingeRestrictPurge: scoreValue(formData.get("bingeRestrictPurge")),
      isolateAvoid: scoreValue(formData.get("isolateAvoid")),
      quitGiveUp: scoreValue(formData.get("quitGiveUp")),
      lashOut: scoreValue(formData.get("lashOut"))
    },
    targetOccurrences: [
      { targetKey: "isolate_avoid", occurrence: String(formData.get("targetOccurrence") || "none") }
    ],
    skillsUsed: splitList(formData.get("skillsUsed")),
    overallDayDifficulty: scoreValue(formData.get("overallDayDifficulty")),
    optionalFields: {
      sleepDurationMinutes: optionalNumber(formData.get("sleepDurationMinutes")),
      sleepQuality: scoreValue(formData.get("sleepQuality")),
      medicationAdherence: String(formData.get("medicationAdherence") || ""),
      notes: String(formData.get("notes") || "").trim()
    }
  };

  const localError = validateDiary(entry);
  if (localError) {
    renderDiaryError(localError);
    return;
  }

  const submitButton = diaryForm.querySelector("button");
  submitButton.disabled = true;

  try {
    const result = await putJson(`/api/diary/${entryDate}`, entry);
    renderDiarySaved(result);
  } catch (error) {
    renderDiaryError(error.message || "Diary card could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

function optionalNumber(value) {
  return value === "" || value === null ? null : Number(value);
}

function validateDiary(entry) {
  if (!Number.isInteger(entry.emotionRatings.anxietyFear)) return "Anxiety/fear is required.";
  if (!Number.isInteger(entry.urgeRatings.selfHarm)) return "Self-harm urge is required.";
  if (!Number.isInteger(entry.overallDayDifficulty)) return "Overall day difficulty is required.";
  return "";
}

function hideDiaryMessages() {
  diaryErrorEl.hidden = true;
  diaryErrorEl.textContent = "";
  diaryStatusEl.hidden = true;
  diaryStatusEl.textContent = "";
  diaryResultEl.hidden = true;
}

function renderDiaryError(message) {
  diaryErrorEl.hidden = false;
  diaryErrorEl.textContent = message;
}

function renderDiarySaved(result) {
  diaryStatusEl.hidden = false;
  diaryStatusEl.textContent = "Diary card saved.";
  diaryResultEl.hidden = false;
  diaryNextStepEl.textContent = result.nextBestStep;
  diaryTopTargetEl.textContent = `Top target: ${result.insightSeed.topTarget}`;
}

async function loadSkills() {
  hideSkillsMessages();
  skillsStatusEl.hidden = false;
  skillsStatusEl.textContent = "Loading skills...";

  try {
    const result = await getJson("/api/skills");
    allSkills = result.skills;
    renderRecentSkills(result.recent);
    renderFilteredSkills();
  } catch (error) {
    renderSkillsError(error.message || "Skills could not be loaded.");
  }
}

function renderFilteredSkills() {
  const query = skillSearchEl.value.trim().toLowerCase();
  skillModuleButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.moduleFilter === activeSkillModule));
  });

  const visibleSkills = allSkills.filter(skill => {
    const matchesModule = !activeSkillModule || skill.module === activeSkillModule;
    const haystack = `${skill.name} ${skill.whenToUse} ${skill.situationTags.join(" ")}`.toLowerCase();
    return matchesModule && (!query || haystack.includes(query));
  });

  skillsListEl.innerHTML = "";
  skillsStatusEl.hidden = false;
  skillsStatusEl.textContent = visibleSkills.length ? `${visibleSkills.length} skills available.` : "No skills match this filter.";

  visibleSkills.forEach(skill => {
    const card = document.createElement("article");
    card.className = "skill-item";

    const heading = document.createElement(activeSkill?.id === skill.id ? "p" : "h3");
    if (activeSkill?.id === skill.id) heading.className = "skill-item-title";
    heading.textContent = skill.name;

    const meta = document.createElement("p");
    meta.className = "skill-meta";
    meta.textContent = `${moduleLabel(skill.module)} - ${Math.round(skill.durationSeconds / 60)} min`;

    const when = document.createElement("p");
    when.textContent = skill.whenToUse;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `Open ${skill.name}`;
    button.addEventListener("click", () => openSkill(skill.id));

    card.append(heading, meta, when, button);
    skillsListEl.append(card);
  });
}

async function openSkill(skillId) {
  hideSkillSessionMessages();

  try {
    const result = await getJson(`/api/skills/${skillId}`);
    activeSkill = result.skill;
    activeSkillStartedAt = "";
    renderFilteredSkills();
    skillDetailHeadingEl.textContent = activeSkill.name;
    skillWhenEl.textContent = activeSkill.whenToUse;
    skillWhyEl.textContent = activeSkill.whyItHelps;
    skillDurationEl.textContent = `Duration: ${Math.round(activeSkill.durationSeconds / 60)} minutes`;
    skillTimerEl.textContent = "";
    skillHelpfulnessEl.value = "";
    skillFollowUpEl.textContent = "";
    skillStepsEl.innerHTML = "";

    activeSkill.steps.forEach(step => {
      const item = document.createElement("li");
      item.textContent = step;
      skillStepsEl.append(item);
    });

    skillDetailEl.hidden = false;
  } catch (error) {
    renderSkillsError(error.message || "Skill could not be loaded.");
  }
}

function startSkillExercise() {
  activeSkillStartedAt = new Date().toISOString();
  skillTimerEl.textContent = "Exercise running.";
  hideSkillSessionMessages();
}

async function completeSkillExercise(event) {
  event.preventDefault();
  hideSkillSessionMessages();

  if (!activeSkill) {
    renderSkillSessionError("Open a skill first.");
    return;
  }

  if (!activeSkillStartedAt) {
    activeSkillStartedAt = new Date().toISOString();
  }

  const helpfulnessRating = scoreValue(skillHelpfulnessEl.value);
  if (!Number.isInteger(helpfulnessRating)) {
    renderSkillSessionError("Helpfulness rating is required.");
    return;
  }

  const submitButton = skillSessionForm.querySelector("button");
  submitButton.disabled = true;

  try {
    const result = await postJson(`/api/skills/${activeSkill.id}/sessions`, {
      startedAt: activeSkillStartedAt,
      completedAt: new Date().toISOString(),
      helpfulnessRating,
      sourceContext: "library"
    });
    skillSessionStatusEl.hidden = false;
    skillSessionStatusEl.textContent = "Skill session saved.";
    skillFollowUpEl.textContent = result.followUpPrompt;
    renderRecentSkills([result.skillSession.skillId]);
  } catch (error) {
    renderSkillSessionError(error.message || "Skill session could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

function renderRecentSkills(recent) {
  if (!recent?.length) {
    skillsRecentEl.hidden = true;
    skillsRecentEl.textContent = "";
    return;
  }

  skillsRecentEl.hidden = false;
  skillsRecentEl.textContent = `Recent: ${recent.join(", ")}`;
}

function hideSkillsMessages() {
  skillsErrorEl.hidden = true;
  skillsErrorEl.textContent = "";
}

function renderSkillsError(message) {
  skillsErrorEl.hidden = false;
  skillsErrorEl.textContent = message;
  skillsStatusEl.hidden = true;
}

function hideSkillSessionMessages() {
  skillSessionErrorEl.hidden = true;
  skillSessionErrorEl.textContent = "";
  skillSessionStatusEl.hidden = true;
  skillSessionStatusEl.textContent = "";
}

function renderSkillSessionError(message) {
  skillSessionErrorEl.hidden = false;
  skillSessionErrorEl.textContent = message;
}

function moduleLabel(moduleName) {
  const labels = {
    distress_tolerance: "Distress Tolerance",
    emotion_regulation: "Emotion Regulation"
  };
  return labels[moduleName] ?? moduleName;
}

async function sendCoachMessage(event) {
  event.preventDefault();
  hideCoachMessages();

  const message = coachMessageEl.value.trim();
  const mode = coachModeEl.value;
  if (!message) {
    renderCoachError("Coach message is required.");
    return;
  }

  coachSendButton.disabled = true;
  coachStatusEl.hidden = false;
  coachStatusEl.textContent = "Checking safety...";

  try {
    const result = await postJson("/api/coach/messages", {
      message,
      mode,
      contextRefs: {}
    });

    if (result.safetyMode) {
      renderCoachSafetyMode(result.safetyMode);
      return;
    }

    renderCoachReply(result);
  } catch (error) {
    renderCoachError(error.message || "Coach message could not be sent.");
  } finally {
    if (!coachSendButton.dataset.locked) {
      coachSendButton.disabled = false;
    }
  }
}

function hideCoachMessages() {
  coachErrorEl.hidden = true;
  coachErrorEl.textContent = "";
  coachStatusEl.hidden = true;
  coachStatusEl.textContent = "";
  coachThreadEl.hidden = true;
  coachSafetyModeEl.hidden = true;
}

function renderCoachError(message) {
  coachErrorEl.hidden = false;
  coachErrorEl.textContent = message;
}

function renderCoachReply(result) {
  coachStatusEl.hidden = true;
  coachThreadEl.hidden = false;
  coachReplyEl.textContent = `Coach: ${result.reply.text}`;
  coachNextActionEl.textContent = `Next action: ${result.nextAction.label}`;
  coachSpecialistEl.textContent = `Specialist: ${result.agentRun.specialistsUsed.join(", ")}`;
  coachMessageEl.value = "";
}

function renderCoachSafetyMode(safetyMode) {
  coachStatusEl.hidden = true;
  coachThreadEl.hidden = true;
  coachSafetyModeEl.hidden = false;
  coachSafetyTitleEl.textContent = safetyMode.title;
  coachSafetyMessageEl.textContent = safetyMode.message;
  coachGroundingSkillEl.textContent = safetyMode.groundingSkill
    ? `Grounding skill: ${safetyMode.groundingSkill}`
    : "";

  if (safetyMode.normalCoachingLocked) {
    coachSendButton.disabled = true;
    coachSendButton.dataset.locked = "true";
    coachMessageEl.disabled = true;
    coachModeEl.disabled = true;
  }
}

async function createChainAnalysis(event) {
  event.preventDefault();
  hideChainMessages();

  const promptingEvent = document.querySelector("#chain-prompting-event").value.trim();
  if (!promptingEvent) {
    renderInlineError(chainErrorEl, "Prompting event is required.");
    return;
  }

  try {
    const result = await postJson("/api/chain-analyses", {
      promptingEvent,
      sourceDiaryEntryId: null
    });
    activeChainId = result.chainAnalysis.id;
    chainStatusEl.hidden = false;
    chainStatusEl.textContent = "Chain draft saved.";
    chainCompleteForm.hidden = false;
  } catch (error) {
    renderInlineError(chainErrorEl, error.message || "Chain analysis could not be saved.");
  }
}

async function completeChainAnalysis(event) {
  event.preventDefault();
  hideChainCompleteMessages();

  const formData = new FormData(chainCompleteForm);
  if (!activeChainId) {
    renderInlineError(chainCompleteErrorEl, "Create a chain draft first.");
    return;
  }

  try {
    const result = await patchJson(`/api/chain-analyses/${activeChainId}`, {
      vulnerabilities: splitList(formData.get("vulnerabilities")),
      links: splitList(formData.get("links")),
      consequences: splitList(formData.get("consequences")),
      alternatives: splitList(formData.get("alternatives")),
      status: "complete"
    });
    chainCompleteStatusEl.hidden = false;
    chainCompleteStatusEl.textContent = "Chain analysis complete.";
    chainPreventionPlanEl.hidden = false;
    chainPreventionPlanEl.textContent = result.preventionPlan;
  } catch (error) {
    renderInlineError(chainCompleteErrorEl, error.message || "Chain analysis could not be completed.");
  }
}

async function startVoiceSession(event) {
  event.preventDefault();
  voiceErrorEl.hidden = true;
  voiceStatusEl.hidden = true;
  voicePreviewEl.hidden = true;
  voiceEndStatusEl.hidden = true;

  try {
    const formData = new FormData(voiceForm);
    const result = await postJson("/api/voice/client-secret", {
      mode: "skill",
      doNotSave: formData.get("doNotSave") === "on",
      contextRefs: {},
      sdpOffer: await createLocalSdpOffer()
    });
    activeVoiceSessionId = result.voiceSessionId;
    voiceStatusEl.hidden = false;
    voiceStatusEl.textContent = result.sdpAnswer
      ? "Voice session ready. Client secret ready."
      : "Client secret ready.";
    voicePreviewEl.hidden = false;
    voicePreviewEl.textContent = result.realtimeConfig.transcriptPreviewEnabled
      ? `Transcript preview enabled.${result.sdpAnswer ? " Server-mediated WebRTC connected." : ""}`
      : "Transcript preview disabled.";
    voiceEndButton.hidden = false;
  } catch (error) {
    renderInlineError(voiceErrorEl, error.message || "Voice session could not start.");
  }
}

async function createLocalSdpOffer() {
  return "v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=Anchor Browser Offer\r\n";
}

async function endVoiceSession() {
  voiceEndStatusEl.hidden = true;
  voiceEndStatusEl.textContent = "Voice session ended.";
  voiceEndStatusEl.hidden = false;
  try {
    await postJson(`/api/voice/sessions/${activeVoiceSessionId}/end`, {
      endedAt: new Date().toISOString(),
      savedSummary: "Practiced one paced breathing cycle.",
      transcriptOptIn: false
    });
    voiceEndButton.hidden = true;
  } catch (error) {
    voiceEndStatusEl.hidden = true;
    renderInlineError(voiceErrorEl, error.message || "Voice session could not end.");
  }
}

async function loadInsightsAndReview() {
  insightsErrorEl.hidden = true;
  insightsResultEl.hidden = true;
  try {
    const [insights, weekly] = await Promise.all([
      getJson("/api/insights?range=7d"),
      getJson("/api/weekly-review/2026-04-20")
    ]);
    insightsResultEl.hidden = false;
    insightsScoreEl.textContent = `Structure score: ${insights.structureScore}`;
    insightsCardTitleEl.textContent = insights.cards[0]?.title || "";
    weeklyRecommendationEl.textContent = weekly.review.recommendations[0] || "";
  } catch (error) {
    renderInlineError(insightsErrorEl, error.message || "Insights could not be loaded.");
  }
}

async function generateSessionPacket(event) {
  event.preventDefault();
  packetErrorEl.hidden = true;
  packetStatusEl.hidden = true;
  packetDownloadEl.hidden = true;

  const formData = new FormData(packetForm);
  const includedSections = [];
  if (formData.get("includeDiary") === "on") includedSections.push("diary");
  if (formData.get("includeSkills") === "on") includedSections.push("skills");
  if (formData.get("includeChains") === "on") includedSections.push("chains");

  try {
    const result = await postJson("/api/session-packets", {
      dateRange: { start: "2026-04-20", end: "2026-04-28" },
      includedSections,
      redactions: { notes: formData.get("redactNotes") === "on" },
      shareMode: "download"
    });
    packetStatusEl.hidden = false;
    packetStatusEl.textContent = "Packet ready.";
    packetDownloadEl.href = result.downloadUrl;
    packetDownloadEl.hidden = false;
  } catch (error) {
    renderInlineError(packetErrorEl, error.message || "Packet could not be generated.");
  }
}

async function savePrivacySettings(event) {
  event.preventDefault();
  privacyErrorEl.hidden = true;
  privacyStatusEl.hidden = true;
  const formData = new FormData(privacyForm);

  try {
    await patchJson("/api/me/settings", settingsPayload({
      transcriptRetentionDays: formData.get("transcriptRetentionDays"),
      traceRetentionDays: formData.get("traceRetentionDays")
    }));
    privacyStatusEl.hidden = false;
    privacyStatusEl.textContent = "Privacy settings saved.";
  } catch (error) {
    renderInlineError(privacyErrorEl, error.message || "Privacy settings could not be saved.");
  }
}

async function exportPrivacyData() {
  exportStatusEl.hidden = true;
  try {
    await postJson("/api/privacy/export", {
      format: "json",
      dateRange: { start: "2026-04-20", end: "2026-04-28" }
    });
    exportStatusEl.hidden = false;
    exportStatusEl.textContent = "Export queued.";
  } catch (error) {
    renderInlineError(privacyErrorEl, error.message || "Export could not be queued.");
  }
}

async function requestAccountDelete(event) {
  event.preventDefault();
  deleteErrorEl.hidden = true;
  deleteStatusEl.hidden = true;
  const formData = new FormData(deleteForm);

  try {
    const result = await postJson("/api/privacy/delete-request", {
      scope: "all",
      confirmation: String(formData.get("confirmation") || "")
    });
    activeDeleteRequestId = result.deleteRequestId;
    deleteStatusEl.hidden = false;
    deleteStatusEl.textContent = `Deletion scheduled for ${result.scheduledDeletionAt.slice(0, 10)}.`;
    deleteExecuteButton.hidden = false;
  } catch (error) {
    renderInlineError(deleteErrorEl, error.message || "Delete request could not be scheduled.");
  }
}

async function executeAccountDelete() {
  deleteErrorEl.hidden = true;
  try {
    const result = await postJson(`/api/privacy/delete-requests/${activeDeleteRequestId}/execute`, {
      confirmation: "DELETE"
    });
    deleteStatusEl.hidden = false;
    deleteStatusEl.textContent = result.status === "completed" ? "Deletion completed." : "Deletion request updated.";
    deleteExecuteButton.hidden = true;
  } catch (error) {
    renderInlineError(deleteErrorEl, error.message || "Delete request could not be executed.");
  }
}

async function saveNotificationSettings(event) {
  event.preventDefault();
  notificationErrorEl.hidden = true;
  notificationStatusEl.hidden = true;
  const formData = new FormData(notificationForm);

  try {
    await patchJson("/api/me/settings", settingsPayload({
      notificationOptIn: formData.get("notificationOptIn") === "on",
      quietHoursStart: formData.get("quietHoursStart"),
      quietHoursEnd: formData.get("quietHoursEnd")
    }));
    notificationStatusEl.hidden = false;
    notificationStatusEl.textContent = "Notification settings saved.";
  } catch (error) {
    renderInlineError(notificationErrorEl, error.message || "Notification settings could not be saved.");
  }
}

async function syncOfflineQueue(event) {
  event.preventDefault();
  offlineErrorEl.hidden = true;
  offlineStatusEl.hidden = true;
  const formData = new FormData(offlineForm);
  const clientMutationId = String(formData.get("clientMutationId") || "").trim();
  const queued = readOfflineQueue();
  const mutations = queued.length ? queued : [
    {
      clientMutationId,
      entityType: "quick_check_in",
      operation: "create",
      occurredAt: new Date().toISOString(),
      payload: { mood: 3 }
    }
  ];

  try {
    const result = await postJson("/api/sync/offline-queue", {
      clientId: "browser-device",
      mutations
    });
    writeOfflineQueue([]);
    offlineStatusEl.hidden = false;
    offlineStatusEl.textContent = `Accepted: ${result.accepted[0]?.clientMutationId || "none"}`;
  } catch (error) {
    if (clientMutationId) {
      writeOfflineQueue([
        ...queued,
        {
          clientMutationId,
          entityType: "quick_check_in",
          operation: "create",
          occurredAt: new Date().toISOString(),
          payload: { mood: 3 }
        }
      ]);
      offlineStatusEl.hidden = false;
      offlineStatusEl.textContent = `Queued offline: ${clientMutationId}`;
    } else {
      renderInlineError(offlineErrorEl, error.message || "Offline queue could not sync.");
    }
  }
}

function readOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem("anchor_offline_queue") || "[]");
  } catch {
    return [];
  }
}

function writeOfflineQueue(queue) {
  localStorage.setItem("anchor_offline_queue", JSON.stringify(queue));
}

function settingsPayload(overrides = {}) {
  return {
    transcriptRetentionDays: Number(overrides.transcriptRetentionDays ?? 0),
    traceRetentionDays: Number(overrides.traceRetentionDays ?? 30),
    audioConsent: false,
    shareConsent: false,
    notificationOptIn: overrides.notificationOptIn === true,
    quietHoursStart: String(overrides.quietHoursStart ?? "22:00"),
    quietHoursEnd: String(overrides.quietHoursEnd ?? "07:00")
  };
}

function hideChainMessages() {
  chainErrorEl.hidden = true;
  chainErrorEl.textContent = "";
  chainStatusEl.hidden = true;
  chainStatusEl.textContent = "";
  hideChainCompleteMessages();
}

function hideChainCompleteMessages() {
  chainCompleteErrorEl.hidden = true;
  chainCompleteErrorEl.textContent = "";
  chainCompleteStatusEl.hidden = true;
  chainCompleteStatusEl.textContent = "";
  chainPreventionPlanEl.hidden = true;
  chainPreventionPlanEl.textContent = "";
}

function renderInlineError(element, message) {
  element.hidden = false;
  element.textContent = message;
}

function capitalize(value) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

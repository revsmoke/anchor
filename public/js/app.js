const statusEl = document.querySelector("#snapshot-status");
const dataEl = document.querySelector("#snapshot-data");
const errorEl = document.querySelector("#snapshot-error");

const productEl = document.querySelector("[data-testid='snapshot-product']");
const dateEl = document.querySelector("[data-testid='snapshot-date']");
const summaryEl = document.querySelector("[data-testid='snapshot-summary']");
const appShellEl = document.querySelector(".app-shell");
const appBootStatusEl = document.querySelector("#app-boot-status");
const authenticatedShellEl = document.querySelector("#authenticated-shell");
const currentViewLabelEl = document.querySelector("#current-view-label");
const appMenuToggleButton = document.querySelector("#app-menu-toggle");
const primaryNavEl = document.querySelector("#primary-nav");
const logoutButton = document.querySelector("#logout-button");
const viewTargetButtons = [...document.querySelectorAll("[data-view-target]")];
const authSection = document.querySelector("#auth-section");
const authForm = document.querySelector("#auth-form");
const authModeSignInButton = document.querySelector("#auth-mode-signin");
const authModeSignUpButton = document.querySelector("#auth-mode-signup");
const authHeadingEl = document.querySelector("#auth-heading");
const authCopyEl = document.querySelector("#auth-copy");
const authFieldsEl = document.querySelector("#auth-fields");
const signupConsentsEl = document.querySelector("#signup-consents");
const authSubmitButton = document.querySelector("#auth-submit");
const forgotPasswordOpenButton = document.querySelector("#forgot-password-open");
const authErrorEl = document.querySelector("#auth-error");
const authStatusEl = document.querySelector("#auth-status");
const passwordResetDialog = document.querySelector("#password-reset-dialog");
const passwordResetRequestForm = document.querySelector("#password-reset-request-form");
const passwordResetConfirmForm = document.querySelector("#password-reset-confirm-form");
const passwordResetCloseButton = document.querySelector("#password-reset-close");
const resetEmailEl = document.querySelector("#reset-email");
const resetCodeEl = document.querySelector("#reset-code");
const resetNewPasswordEl = document.querySelector("#reset-new-password");
const resetCodePanelEl = document.querySelector("#reset-code-panel");
const resetDevCodeEl = document.querySelector("#reset-dev-code");
const passwordResetErrorEl = document.querySelector("#password-reset-error");
const passwordResetStatusEl = document.querySelector("#password-reset-status");
const onboardingSection = document.querySelector("#onboarding-section");
const onboardingForm = document.querySelector("#onboarding-form");
const onboardingErrorEl = document.querySelector("#onboarding-error");
const onboardingStatusEl = document.querySelector("#onboarding-status");
const routineResultEl = document.querySelector("#routine-result");
const anchorListEl = document.querySelector("[data-testid='anchor-list']");
const nextBestStepEl = document.querySelector("#next-best-step");
const todaySection = document.querySelector("#today-section");
const anchorProgressEl = document.querySelector("#anchor-progress");
const focusPlanSummaryEl = document.querySelector("#focus-plan-summary");
const focusSummaryFocusEl = document.querySelector("#focus-summary-focus");
const focusSummaryMomentEl = document.querySelector("#focus-summary-moment");
const focusSummarySkillEl = document.querySelector("#focus-summary-skill");
const checkInSection = document.querySelector("#check-in-section");
const checkInForm = document.querySelector("#check-in-form");
const checkInErrorEl = document.querySelector("#check-in-error");
const checkInStatusEl = document.querySelector("#check-in-status");
const checkInResultEl = document.querySelector("#check-in-result");
const suggestedActionEl = document.querySelector("#suggested-action");
const completionNextStepEl = document.querySelector("#completion-next-step");
const safetyModeEl = document.querySelector("#safety-mode");
const safetyModeMessageEl = document.querySelector("#safety-mode-message");
const focusPlanSection = document.querySelector("#focus-plan-section");
const focusPlanForm = document.querySelector("#focus-plan-form");
const focusTextEl = document.querySelector("#focus-text");
const anticipatedHardMomentEl = document.querySelector("#anticipated-hard-moment");
const plannedSkillEl = document.querySelector("#planned-skill");
const focusPlanErrorEl = document.querySelector("#focus-plan-error");
const focusPlanStatusEl = document.querySelector("#focus-plan-status");
const middaySection = document.querySelector("#midday-section");
const middayForm = document.querySelector("#midday-form");
const middayErrorEl = document.querySelector("#midday-error");
const middayStatusEl = document.querySelector("#midday-status");
const middayResultEl = document.querySelector("#midday-result");
const middayNextStepEl = document.querySelector("#midday-next-step");
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
const safetySection = document.querySelector("#safety-section");
const safetyPlanForm = document.querySelector("#safety-plan-form");
const safetyWarningSignsEl = document.querySelector("#safety-warning-signs");
const safetyStepsEl = document.querySelector("#safety-steps");
const safetyContactNameEl = document.querySelector("#safety-contact-name");
const safetyContactRelationshipEl = document.querySelector("#safety-contact-relationship");
const safetyContactPhoneEl = document.querySelector("#safety-contact-phone");
const safetyResourceLabelEl = document.querySelector("#safety-resource-label");
const safetyResourceValueEl = document.querySelector("#safety-resource-value");
const safetyPlanErrorEl = document.querySelector("#safety-plan-error");
const safetyPlanStatusEl = document.querySelector("#safety-plan-status");
const safetyResourcesEl = document.querySelector("#safety-resources");
const safetyResourcesListEl = document.querySelector("#safety-resources-list");
const safetyHelpNowButton = document.querySelector("#safety-help-now");
const safetyEventErrorEl = document.querySelector("#safety-event-error");
const safetyEventStatusEl = document.querySelector("#safety-event-status");
const safetyResolutionForm = document.querySelector("#safety-resolution-form");
const safetyResolutionNoteEl = document.querySelector("#safety-resolution-note");
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
const voiceUseLiveAgentEl = document.querySelector("#voice-use-live-agent");
const voiceLiveAvailabilityEl = document.querySelector("#voice-live-availability");
const voiceErrorEl = document.querySelector("#voice-error");
const voiceStatusEl = document.querySelector("#voice-status");
const voicePreviewEl = document.querySelector("#voice-preview");
const voiceEndStatusEl = document.querySelector("#voice-end-status");
const voiceRemoteAudioEl = document.querySelector("#voice-remote-audio");
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
let middayAnchorId = "";
let todayAnchors = [];
let allSkills = [];
let activeSkill = null;
let activeSkillStartedAt = "";
let activeSkillModule = "";
let activeChainId = "";
let activeVoiceSessionId = "";
let activeVoiceConnection = null;
let activeVoiceUsedRealtime = false;
let activeSafetyEventId = "";
let activeDeleteRequestId = "";
let csrfToken = "";
let publicConfig = null;
let authMode = "signin";
let currentView = "today";

const guidedSections = {
  today: { element: todaySection, label: "Today" },
  "check-in": { element: checkInSection, label: "Check-in" },
  "focus-plan": { element: focusPlanSection, label: "Focus Plan" },
  midday: { element: middaySection, label: "Midday" },
  reset: { element: resetSection, label: "Reset Today" },
  diary: { element: diarySection, label: "Diary Card" },
  skills: { element: skillsSection, label: "Skills" },
  coach: { element: coachSection, label: "Coach" },
  safety: { element: safetySection, label: "Safety" },
  chain: { element: chainSection, label: "Chain Analysis" },
  voice: { element: voiceSection, label: "Voice" },
  insights: { element: insightsSection, label: "Insights" },
  packet: { element: packetSection, label: "Exports" },
  privacy: { element: privacySection, label: "Privacy" },
  offline: { element: offlineSection, label: "Offline" }
};

loadPublicConfig();
loadTodaySnapshot();
renderAuthMode();
setSessionChecking(true);
bootstrapAuthenticatedUser({ silent: true, hideAuth: true });
registerServiceWorker();
authForm.addEventListener("submit", handleAuthSubmit);
authModeSignInButton.addEventListener("click", () => {
  authMode = "signin";
  renderAuthMode();
});
authModeSignUpButton.addEventListener("click", () => {
  authMode = "signup";
  renderAuthMode();
});
forgotPasswordOpenButton.addEventListener("click", openPasswordResetDialog);
passwordResetCloseButton.addEventListener("click", closePasswordResetDialog);
passwordResetDialog.addEventListener("close", () => {
  passwordResetDialog.hidden = true;
});
passwordResetRequestForm.addEventListener("submit", requestPasswordReset);
passwordResetConfirmForm.addEventListener("submit", confirmPasswordReset);
appMenuToggleButton.addEventListener("click", togglePrimaryNav);
logoutButton.addEventListener("click", logout);
viewTargetButtons.forEach(button => {
  button.addEventListener("click", () => {
    showGuidedView(button.dataset.viewTarget);
    closePrimaryNav();
  });
});
window.addEventListener("hashchange", () => {
  showGuidedView(viewFromHash(), { updateHash: false });
});
onboardingForm.addEventListener("submit", saveOnboarding);
checkInForm.addEventListener("submit", saveQuickCheckIn);
focusPlanForm.addEventListener("submit", saveFocusPlan);
middayForm.addEventListener("submit", saveMiddayCheckIn);
resetForm.addEventListener("submit", saveDayReset);
diaryForm.addEventListener("submit", saveDiaryCard);
coachForm.addEventListener("submit", sendCoachMessage);
safetyPlanForm.addEventListener("submit", saveSafetyPlan);
safetyHelpNowButton.addEventListener("click", logHelpNowSafetyEvent);
safetyResolutionForm.addEventListener("submit", resolveSafetyEpisode);
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
    const response = await fetch("/api/today/snapshot", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload?.error?.message || "Today snapshot is unavailable.");
    }

    renderSnapshot(payload.data);
  } catch (error) {
    renderError(error.message || "Today snapshot is unavailable.");
  }
}

async function loadPublicConfig() {
  try {
    const response = await fetch("/api/config/public", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error("Public config unavailable.");
    publicConfig = payload.data;
    renderVoiceAvailability();
  } catch {
    publicConfig = { voice: { liveRealtimeAvailable: false } };
    renderVoiceAvailability();
  }
}

function renderVoiceAvailability() {
  const available = publicConfig?.voice?.liveRealtimeAvailable === true;
  if (!available) {
    localStorage.removeItem("anchor_live_webrtc");
  }
  voiceUseLiveAgentEl.disabled = !available;
  voiceUseLiveAgentEl.checked = available && localStorage.getItem("anchor_live_webrtc") === "1";
  voiceLiveAvailabilityEl.textContent = available
    ? `Real OpenAI voice agent available (${publicConfig.voice.realtimeModel}).`
    : "Real OpenAI voice agent unavailable: start the server with OPENAI_API_KEY to enable it.";
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

function renderAuthMode() {
  const isSignup = authMode === "signup";
  const isConsentCompletion = authMode === "consent";
  authModeSignInButton.setAttribute("aria-pressed", String(!isSignup));
  authModeSignUpButton.setAttribute("aria-pressed", String(isSignup));
  authModeSignInButton.disabled = isConsentCompletion;
  authModeSignUpButton.disabled = isConsentCompletion;
  authFieldsEl.hidden = isConsentCompletion;
  signupConsentsEl.hidden = !(isSignup || isConsentCompletion);
  forgotPasswordOpenButton.hidden = isSignup || isConsentCompletion;
  authSubmitButton.textContent = isConsentCompletion
    ? "Save consent"
    : isSignup ? "Create account and save consent" : "Sign in";
  authHeadingEl.textContent = isConsentCompletion
    ? "Complete consent"
    : isSignup ? "Start with Anchor" : "Welcome back";
  authCopyEl.textContent = isConsentCompletion
    ? "Confirm the required consent choices to continue with this account."
    : isSignup
    ? "Create your account, confirm consent, and set up your first daily anchors."
    : "Sign in with the email and password you used to start Anchor.";
  document.querySelector("#password").setAttribute("autocomplete", isSignup ? "new-password" : "current-password");
  hideAuthMessages();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (authMode === "consent") {
    await saveConsentForCurrentSession();
    return;
  }
  if (authMode === "signup") {
    await createAccountAndConsent();
    return;
  }
  await signIn();
}

async function saveConsentForCurrentSession() {
  hideAuthMessages();
  const crisis = document.querySelector("#consent-crisis").checked;
  const privacy = document.querySelector("#consent-privacy").checked;
  const voice = document.querySelector("#consent-voice").checked;
  const localError = validateConsentChoices({ crisis, privacy, voice });
  if (localError) {
    renderAuthError(localError);
    return;
  }

  authSubmitButton.disabled = true;
  try {
    await postJson("/api/onboarding/consent", {
      consents: [
        { type: "crisis_limits", granted: crisis },
        { type: "privacy_choices", granted: privacy },
        { type: "voice_audio", granted: voice }
      ]
    });
    authSection.hidden = true;
    onboardingStatusEl.hidden = false;
    onboardingStatusEl.textContent = "Consent saved. Next: onboarding setup.";
    onboardingSection.hidden = false;
  } catch (error) {
    renderAuthError(error.message || "Consent could not be saved.");
  } finally {
    authSubmitButton.disabled = false;
  }
}

async function signIn() {
  hideAuthMessages();
  const formData = new FormData(authForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const localError = validateSignInForm({ email, password });
  if (localError) {
    renderAuthError(localError);
    return;
  }

  authSubmitButton.disabled = true;
  try {
    await postJson("/api/auth/login", { email, password });
    await ensureCsrfToken();
    authStatusEl.hidden = false;
    authStatusEl.textContent = "Signed in. Welcome back.";
    await bootstrapAuthenticatedUser({ silent: false, hideAuth: true });
  } catch (error) {
    renderAuthError(error.message || "Sign in could not be completed.");
  } finally {
    authSubmitButton.disabled = false;
  }
}

async function createAccountAndConsent() {
  hideAuthMessages();

  const formData = new FormData(authForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const crisis = document.querySelector("#consent-crisis").checked;
  const privacy = document.querySelector("#consent-privacy").checked;
  const voice = document.querySelector("#consent-voice").checked;

  const localError = validateSignupForm({ email, password, crisis, privacy, voice });
  if (localError) {
    renderAuthError(localError);
    return;
  }

  authSubmitButton.disabled = true;

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

    authSection.hidden = true;
    onboardingStatusEl.hidden = false;
    onboardingStatusEl.textContent = "Consent saved. Next: onboarding setup.";
    onboardingSection.hidden = false;
  } catch (error) {
    renderAuthError(error.message || "Consent could not be saved.");
  } finally {
    authSubmitButton.disabled = false;
  }
}

async function bootstrapAuthenticatedUser({ silent = false, hideAuth = false } = {}) {
  try {
    const bootstrap = await getJson("/api/app/bootstrap");
    renderBootstrapState(bootstrap, { hideAuth });
    if (bootstrap.nextStep === "main_app") {
      await refreshTodayState({ silent: true });
    }
    return bootstrap;
  } catch (error) {
    if (!silent) renderAuthError(error.message || "Account state could not be loaded.");
    renderSignedOut();
    return null;
  }
}

function renderBootstrapState(bootstrap, { hideAuth = false } = {}) {
  if (bootstrap.authenticated === false) {
    renderSignedOut();
    return;
  }

  appBootStatusEl.hidden = true;

  if (hideAuth && bootstrap.nextStep !== "consent") {
    authSection.hidden = true;
  }

  if (bootstrap.nextStep === "consent") {
    authenticatedShellEl.hidden = true;
    hideGuidedSections();
    onboardingSection.hidden = true;
    authSection.hidden = false;
    authMode = "consent";
    renderAuthMode();
    renderAuthError("Required consent must be saved before continuing.");
    return;
  }

  if (bootstrap.nextStep === "onboarding_profile") {
    authenticatedShellEl.hidden = true;
    authSection.hidden = true;
    hideGuidedSections();
    onboardingSection.hidden = false;
    return;
  }

  if (bootstrap.nextStep === "main_app") {
    renderRoutineSetup({
      today: bootstrap.today,
      dailyPlan: bootstrap.dailyPlan || { nextBestStep: "Start your morning anchor." },
      focusPlan: bootstrap.focusPlan || null
    });
  }
}

function setSessionChecking(isChecking) {
  appShellEl.dataset.appState = isChecking ? "booting" : "ready";
  appBootStatusEl.hidden = !isChecking;
  if (isChecking) {
    authSection.hidden = true;
    authenticatedShellEl.hidden = true;
    onboardingSection.hidden = true;
    hideGuidedSections();
  }
}

function renderSignedOut(message = "") {
  setSessionChecking(false);
  authenticatedShellEl.hidden = true;
  onboardingSection.hidden = true;
  hideGuidedSections();
  authSection.hidden = false;
  authMode = "signin";
  renderAuthMode();
  if (message) {
    authStatusEl.hidden = false;
    authStatusEl.textContent = message;
  }
}

function showAuthenticatedShell() {
  setSessionChecking(false);
  authenticatedShellEl.hidden = false;
}

function togglePrimaryNav() {
  const expanded = appMenuToggleButton.getAttribute("aria-expanded") === "true";
  appMenuToggleButton.setAttribute("aria-expanded", String(!expanded));
  primaryNavEl.classList.toggle("is-open", !expanded);
}

function closePrimaryNav() {
  appMenuToggleButton.setAttribute("aria-expanded", "false");
  primaryNavEl.classList.remove("is-open");
}

function hideGuidedSections() {
  Object.values(guidedSections).forEach(({ element }) => {
    element.hidden = true;
    element.classList.remove("guided-section-active");
  });
}

function viewFromHash() {
  const value = location.hash.replace(/^#/, "");
  return guidedSections[value] ? value : "";
}

function showGuidedView(view, { updateHash = true, replaceHash = false } = {}) {
  if (!guidedSections[view]) return;
  currentView = view;
  if (updateHash && location.hash !== `#${view}`) {
    if (replaceHash) {
      history.replaceState({ view }, "", `#${view}`);
    } else {
      history.pushState({ view }, "", `#${view}`);
    }
  }
  hideGuidedSections();
  const section = guidedSections[view];
  section.element.hidden = false;
  section.element.classList.add("guided-section-active");
  currentViewLabelEl.textContent = section.label;
  viewTargetButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.viewTarget === view));
  });
  if (view === "safety") {
    loadSafetyPlan({ silent: true });
  }
}

async function logout() {
  logoutButton.disabled = true;
  try {
    await ensureCsrfToken();
    await postJson("/api/auth/logout", {});
    csrfToken = "";
    currentView = "today";
    closePrimaryNav();
    renderSignedOut("Signed out.");
  } catch (error) {
    currentViewLabelEl.textContent = error.message || "Logout could not be completed.";
  } finally {
    logoutButton.disabled = false;
  }
}

function openPasswordResetDialog() {
  hidePasswordResetMessages();
  passwordResetDialog.hidden = false;
  resetEmailEl.value = document.querySelector("#email").value;
  resetCodeEl.value = "";
  resetNewPasswordEl.value = "";
  resetCodePanelEl.hidden = true;
  resetDevCodeEl.textContent = "";
  passwordResetConfirmForm.hidden = true;
  if (typeof passwordResetDialog.showModal === "function") {
    passwordResetDialog.showModal();
  } else {
    passwordResetDialog.setAttribute("open", "");
  }
  resetEmailEl.focus();
}

function closePasswordResetDialog() {
  if (passwordResetDialog.open && typeof passwordResetDialog.close === "function") {
    passwordResetDialog.close();
    return;
  }
  passwordResetDialog.hidden = true;
  passwordResetDialog.removeAttribute("open");
}

async function requestPasswordReset(event) {
  event.preventDefault();
  hidePasswordResetMessages();
  const email = resetEmailEl.value.trim();
  if (!email.includes("@")) {
    renderPasswordResetError("Enter a valid email.");
    return;
  }

  const submitButton = passwordResetRequestForm.querySelector("button");
  submitButton.disabled = true;
  try {
    const result = await postJson("/api/auth/password-reset/request", { email });
    passwordResetStatusEl.hidden = false;
    passwordResetStatusEl.textContent = result.message;
    if (result.devResetCode) {
      resetCodePanelEl.hidden = false;
      resetDevCodeEl.textContent = result.devResetCode;
      resetCodeEl.value = result.devResetCode;
      passwordResetConfirmForm.hidden = false;
      resetCodeEl.focus();
    } else {
      passwordResetStatusEl.textContent = `${result.message} No prototype reset code was returned for this address. Create an account first or check the exact email.`;
      resetCodePanelEl.hidden = true;
      resetDevCodeEl.textContent = "";
      passwordResetConfirmForm.hidden = true;
      resetEmailEl.focus();
    }
  } catch (error) {
    renderPasswordResetError(error.message || "Password reset could not be requested.");
  } finally {
    submitButton.disabled = false;
  }
}

async function confirmPasswordReset(event) {
  event.preventDefault();
  hidePasswordResetMessages({ keepCode: true });
  const email = resetEmailEl.value.trim();
  const resetCode = resetCodeEl.value.trim();
  const newPassword = resetNewPasswordEl.value;
  if (!email.includes("@")) {
    renderPasswordResetError("Enter a valid email.");
    return;
  }
  if (!resetCode) {
    renderPasswordResetError("Reset code is required.");
    return;
  }
  if (newPassword.length < 12) {
    renderPasswordResetError("Password must be at least 12 characters.");
    return;
  }

  const submitButton = passwordResetConfirmForm.querySelector("button");
  submitButton.disabled = true;
  try {
    await postJson("/api/auth/password-reset/confirm", { email, resetCode, newPassword });
    passwordResetDialog.close();
    authMode = "signin";
    renderAuthMode();
    document.querySelector("#email").value = email;
    document.querySelector("#password").value = "";
    authStatusEl.hidden = false;
    authStatusEl.textContent = "Password reset. Sign in with your new password.";
  } catch (error) {
    renderPasswordResetError(error.message || "Password could not be reset.");
  } finally {
    submitButton.disabled = false;
  }
}

function hidePasswordResetMessages({ keepCode = false } = {}) {
  passwordResetErrorEl.hidden = true;
  passwordResetErrorEl.textContent = "";
  passwordResetStatusEl.hidden = true;
  passwordResetStatusEl.textContent = "";
  if (!keepCode) {
    resetCodePanelEl.hidden = true;
    resetDevCodeEl.textContent = "";
  }
}

function renderPasswordResetError(message) {
  passwordResetErrorEl.hidden = false;
  passwordResetErrorEl.textContent = message;
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
    await refreshTodayState({ silent: true });
  } catch (error) {
    renderOnboardingError(error.message || "Routine setup could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

function validateSignInForm({ email, password }) {
  if (!email.includes("@")) return "Enter a valid email.";
  if (!password) return "Password is required.";
  return "";
}

function validateSignupForm({ email, password, crisis, privacy, voice }) {
  if (!email.includes("@")) return "Enter a valid email.";
  if (password.length < 12) return "Password must be at least 12 characters.";
  return validateConsentChoices({ crisis, privacy, voice });
}

function validateConsentChoices({ crisis, privacy, voice }) {
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
    headers: {},
    cache: "no-store"
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

function hideAuthMessages() {
  authErrorEl.hidden = true;
  authErrorEl.textContent = "";
  authStatusEl.hidden = true;
  authStatusEl.textContent = "";
}

function renderAuthError(message) {
  authErrorEl.hidden = false;
  authErrorEl.textContent = message;
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
  showAuthenticatedShell();
  authSection.hidden = true;
  onboardingSection.hidden = true;
  onboardingStatusEl.hidden = true;
  onboardingStatusEl.textContent = "";
  routineResultEl.hidden = false;
  applyTodayState(setup);
  showGuidedView(viewFromHash() || currentView || "today", { replaceHash: true });
  diaryDateEl.value = new Date().toISOString().slice(0, 10);
  checkInResultEl.hidden = true;
  safetyModeEl.hidden = true;
  middayResultEl.hidden = true;
  resetResultEl.hidden = true;
  diaryResultEl.hidden = true;
  skillDetailEl.hidden = true;
  coachThreadEl.hidden = true;
  coachSafetyModeEl.hidden = true;
  safetyEventStatusEl.hidden = true;
  safetyEventErrorEl.hidden = true;
  safetyResolutionForm.hidden = true;
  chainCompleteForm.hidden = true;
  chainPreventionPlanEl.hidden = true;
  voiceEndButton.hidden = true;
  voiceEndStatusEl.hidden = true;
  insightsResultEl.hidden = true;
  packetDownloadEl.hidden = true;
  loadSkills();
}

function applyTodayState(setup) {
  anchorListEl.innerHTML = "";
  todayAnchors = setup.today || setup.anchors || [];
  morningAnchorId = todayAnchors.find(anchor => anchor.type === "morning")?.id || "";
  middayAnchorId = todayAnchors.find(anchor => anchor.type === "midday")?.id || "";

  todayAnchors.forEach(anchor => {
    const item = document.createElement("li");
    item.textContent = `${capitalize(anchor.type)} - ${anchor.targetTime}`;
    anchorListEl.append(item);
  });

  nextBestStepEl.textContent = setup.dailyPlan?.nextBestStep || setup.nextBestStep || "Start your morning anchor.";
  renderAnchorProgress();
  renderFocusPlan(setup.focusPlan || null);
}

async function refreshTodayState({ silent = false } = {}) {
  try {
    const today = await getJson("/api/today");
    applyTodayState({
      today: today.anchors,
      dailyPlan: today.dailyPlan || { nextBestStep: today.nextBestStep || "Start your morning anchor." },
      focusPlan: today.focusPlan || null
    });
    return today;
  } catch (error) {
    if (!silent) {
      currentViewLabelEl.textContent = error.message || "Today could not be refreshed.";
    }
    return null;
  }
}

function renderAnchorProgress() {
  anchorProgressEl.innerHTML = "";
  todayAnchors.forEach(anchor => {
    const item = document.createElement("li");
    const label = document.createElement("strong");
    const time = document.createElement("span");
    const state = document.createElement("span");
    label.textContent = capitalize(anchor.type);
    time.textContent = anchor.targetTime;
    state.className = "anchor-state";
    state.textContent = anchor.status === "complete"
      ? "Complete"
      : nextAnchorType() === anchor.type ? "Current" : "Scheduled";
    item.append(label, time, state);
    anchorProgressEl.append(item);
  });
}

function nextAnchorType() {
  return todayAnchors.find(anchor => anchor.status !== "complete")?.type || "evening";
}

function updateAnchorState(updatedAnchor) {
  todayAnchors = todayAnchors.map(anchor => anchor.id === updatedAnchor.id ? { ...anchor, ...updatedAnchor } : anchor);
  renderAnchorProgress();
}

function renderFocusPlan(focusPlan) {
  if (!focusPlan) {
    focusPlanSummaryEl.hidden = true;
    focusSummaryFocusEl.textContent = "";
    focusSummaryMomentEl.textContent = "";
    focusSummarySkillEl.textContent = "";
    return;
  }

  focusPlanSummaryEl.hidden = false;
  focusSummaryFocusEl.textContent = focusPlan.focusText;
  focusSummaryMomentEl.textContent = focusPlan.anticipatedHardMoment;
  focusSummarySkillEl.textContent = focusPlan.plannedSkill;
  focusTextEl.value = focusPlan.focusText;
  anticipatedHardMomentEl.value = focusPlan.anticipatedHardMoment;
  plannedSkillEl.value = focusPlan.plannedSkill;
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
    updateAnchorState(completion.anchor);
    renderCheckInComplete(result, completion);
  } catch (error) {
    renderCheckInError(error.message || "Check-in could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

async function saveFocusPlan(event) {
  event.preventDefault();
  hideFocusPlanMessages();
  const formData = new FormData(focusPlanForm);
  const focusPlan = {
    focusText: String(formData.get("focusText") || "").trim(),
    anticipatedHardMoment: String(formData.get("anticipatedHardMoment") || "").trim(),
    plannedSkill: String(formData.get("plannedSkill") || "").trim()
  };

  const localError = validateFocusPlan(focusPlan);
  if (localError) {
    renderInlineError(focusPlanErrorEl, localError);
    return;
  }

  const submitButton = focusPlanForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  try {
    const saved = await postJson("/api/today/focus-plan", focusPlan);
    renderFocusPlan(saved);
    focusPlanStatusEl.hidden = false;
    focusPlanStatusEl.textContent = "Focus plan saved.";
    showGuidedView("today");
  } catch (error) {
    renderInlineError(focusPlanErrorEl, error.message || "Focus plan could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

function validateFocusPlan(focusPlan) {
  if (!focusPlan.focusText) return "One focus is required.";
  if (!focusPlan.anticipatedHardMoment) return "Likely hard moment is required.";
  if (!focusPlan.plannedSkill) return "Skill or support step is required.";
  return "";
}

function hideFocusPlanMessages() {
  focusPlanErrorEl.hidden = true;
  focusPlanErrorEl.textContent = "";
  focusPlanStatusEl.hidden = true;
  focusPlanStatusEl.textContent = "";
}

async function saveMiddayCheckIn(event) {
  event.preventDefault();
  hideMiddayMessages();
  const formData = new FormData(middayForm);
  const checkIn = {
    createdAt: new Date().toISOString(),
    anchorContext: "midday",
    primaryEmotionScore: scoreValue(formData.get("primaryEmotionScore")),
    primaryUrgeScore: scoreValue(formData.get("primaryUrgeScore")),
    energyState: String(formData.get("energyState") || ""),
    suggestedNextActionStatus: "accepted",
    note: String(formData.get("note") || "").trim(),
    locationContext: ""
  };

  const localError = validateMiddayCheckIn(checkIn);
  if (localError) {
    renderInlineError(middayErrorEl, localError);
    return;
  }

  const submitButton = middayForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  try {
    const result = await postJson("/api/check-ins", checkIn);
    if (result.safetyMode) {
      renderInlineError(middayErrorEl, result.safetyMode.message);
      return;
    }

    const completion = await postJson(`/api/today/anchors/${middayAnchorId}/complete`, {
      completedAt: new Date().toISOString(),
      checkInId: result.checkIn.id
    });
    updateAnchorState(completion.anchor);
    middayStatusEl.hidden = false;
    middayStatusEl.textContent = "Midday anchor complete.";
    middayResultEl.hidden = false;
    middayNextStepEl.textContent = completion.nextBestStep;
  } catch (error) {
    renderInlineError(middayErrorEl, error.message || "Midday anchor could not be completed.");
  } finally {
    submitButton.disabled = false;
  }
}

function validateMiddayCheckIn(checkIn) {
  if (!Number.isInteger(checkIn.primaryEmotionScore)) return "Midday mood is required.";
  if (!Number.isInteger(checkIn.primaryUrgeScore)) return "Midday urge is required.";
  if (!checkIn.energyState) return "Midday energy is required.";
  if (!middayAnchorId) return "Midday anchor is not ready.";
  return "";
}

function hideMiddayMessages() {
  middayErrorEl.hidden = true;
  middayErrorEl.textContent = "";
  middayStatusEl.hidden = true;
  middayStatusEl.textContent = "";
  middayResultEl.hidden = true;
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

async function loadSafetyPlan({ silent = false } = {}) {
  if (!safetySection || safetySection.hidden) return;
  hideSafetyPlanMessages();

  try {
    const result = await getJson("/api/safety-plan");
    renderSafetyPlan(result.safetyPlan);
    await loadOpenSafetyEpisode();
  } catch (error) {
    if (!silent) {
      renderInlineError(safetyPlanErrorEl, error.message || "Safety plan could not be loaded.");
    }
  }
}

async function loadOpenSafetyEpisode() {
  const result = await getJson("/api/safety-events");
  const openAcuteEvent = (result.safetyEvents || [])
    .filter(event => event.riskTier === "acute" && event.resolutionStatus === "open")
    .sort((left, right) => String(right.detectedAt || "").localeCompare(String(left.detectedAt || "")))[0];

  if (!openAcuteEvent) {
    if (!activeSafetyEventId) {
      safetyResolutionForm.hidden = true;
    }
    return;
  }

  activeSafetyEventId = openAcuteEvent.id;
  safetyResolutionForm.hidden = false;
  safetyEventStatusEl.hidden = false;
  safetyEventStatusEl.textContent = "Active safety episode found. Resolve it after support is reached.";
}

async function saveSafetyPlan(event) {
  event.preventDefault();
  hideSafetyPlanMessages();
  const safetyPlan = safetyPlanFromForm();
  const localError = validateSafetyPlan(safetyPlan);
  if (localError) {
    renderInlineError(safetyPlanErrorEl, localError);
    return;
  }

  const submitButton = safetyPlanForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  try {
    const result = await putJson("/api/safety-plan", safetyPlan);
    renderSafetyPlan(result.safetyPlan);
    safetyPlanStatusEl.hidden = false;
    safetyPlanStatusEl.textContent = "Safety plan saved.";
  } catch (error) {
    renderInlineError(safetyPlanErrorEl, error.message || "Safety plan could not be saved.");
  } finally {
    submitButton.disabled = false;
  }
}

async function logHelpNowSafetyEvent() {
  hideSafetyEventMessages();
  if (activeSafetyEventId) {
    safetyEventStatusEl.hidden = false;
    safetyEventStatusEl.textContent = "Active safety episode found. Resolve it after support is reached.";
    safetyResolutionForm.hidden = false;
    safetyResolutionNoteEl.focus();
    return;
  }

  safetyHelpNowButton.disabled = true;
  try {
    const result = await postJson("/api/safety-events", {
      riskTier: "acute",
      triggerType: "help_now_ui",
      outcome: "acute_lock",
      context: { source: "safety_help_now" }
    });
    activeSafetyEventId = result.safetyEvent.id;
    safetyEventStatusEl.hidden = false;
    safetyEventStatusEl.textContent = "Help Now safety event logged. Normal actions are locked until this is resolved.";
    safetyResolutionForm.hidden = false;
    safetyResolutionNoteEl.focus();
  } catch (error) {
    renderInlineError(safetyEventErrorEl, error.message || "Safety event could not be logged.");
  } finally {
    safetyHelpNowButton.disabled = false;
  }
}

async function resolveSafetyEpisode(event) {
  event.preventDefault();
  hideSafetyEventMessages({ keepResolution: true });
  const resolutionNote = safetyResolutionNoteEl.value.trim();
  if (!activeSafetyEventId) {
    renderInlineError(safetyEventErrorEl, "Log a Help Now event first.");
    return;
  }
  if (!resolutionNote) {
    renderInlineError(safetyEventErrorEl, "Resolution note is required.");
    return;
  }

  const submitButton = safetyResolutionForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  try {
    await putJson(`/api/safety-events/${activeSafetyEventId}/resolution`, {
      resolutionStatus: "resolved",
      resolutionNote,
      resolvedAt: new Date().toISOString()
    });
    activeSafetyEventId = "";
    safetyResolutionForm.hidden = true;
    safetyResolutionNoteEl.value = "";
    safetyEventStatusEl.hidden = false;
    safetyEventStatusEl.textContent = "Safety episode resolved. Normal actions are available again.";
  } catch (error) {
    renderInlineError(safetyEventErrorEl, error.message || "Safety episode could not be resolved.");
  } finally {
    submitButton.disabled = false;
  }
}

function safetyPlanFromForm() {
  const contacts = [];
  if (safetyContactNameEl.value.trim() || safetyContactPhoneEl.value.trim()) {
    contacts.push({
      name: safetyContactNameEl.value.trim(),
      relationship: safetyContactRelationshipEl.value.trim(),
      phone: safetyContactPhoneEl.value.trim()
    });
  }

  return {
    warningSigns: splitList(safetyWarningSignsEl.value),
    steps: splitList(safetyStepsEl.value),
    contacts,
    crisisResources: [{
      label: safetyResourceLabelEl.value.trim(),
      value: safetyResourceValueEl.value.trim()
    }].filter(resource => resource.label && resource.value)
  };
}

function validateSafetyPlan(safetyPlan) {
  if (!safetyPlan.warningSigns.length) return "At least one warning sign is required.";
  if (!safetyPlan.steps.length) return "At least one safety step is required.";
  if (!safetyPlan.crisisResources.length) return "At least one crisis resource is required.";
  return "";
}

function renderSafetyPlan(safetyPlan) {
  const firstContact = safetyPlan.contacts?.[0] || {};
  const firstResource = safetyPlan.crisisResources?.[0] || {};
  safetyWarningSignsEl.value = (safetyPlan.warningSigns || []).join(", ");
  safetyStepsEl.value = (safetyPlan.steps || []).join(", ");
  safetyContactNameEl.value = firstContact.name || "";
  safetyContactRelationshipEl.value = firstContact.relationship || "";
  safetyContactPhoneEl.value = firstContact.phone || "";
  safetyResourceLabelEl.value = firstResource.label || "Call or text 988";
  safetyResourceValueEl.value = firstResource.value || "988";
  renderSafetyResources(safetyPlan.crisisResources || []);
}

function renderSafetyResources(resources) {
  safetyResourcesListEl.innerHTML = "";
  if (!resources.length) {
    safetyResourcesEl.hidden = true;
    return;
  }

  resources.forEach(resource => {
    const item = document.createElement("li");
    item.textContent = `${resource.label}: ${resource.value}`;
    safetyResourcesListEl.append(item);
  });
  safetyResourcesEl.hidden = false;
}

function hideSafetyPlanMessages() {
  safetyPlanErrorEl.hidden = true;
  safetyPlanErrorEl.textContent = "";
  safetyPlanStatusEl.hidden = true;
  safetyPlanStatusEl.textContent = "";
}

function hideSafetyEventMessages({ keepResolution = false } = {}) {
  safetyEventErrorEl.hidden = true;
  safetyEventErrorEl.textContent = "";
  safetyEventStatusEl.hidden = true;
  safetyEventStatusEl.textContent = "";
  if (!keepResolution && !activeSafetyEventId) {
    safetyResolutionForm.hidden = true;
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
  closeActiveVoiceConnection();
  voiceErrorEl.hidden = true;
  voiceStatusEl.hidden = true;
  voicePreviewEl.hidden = true;
  voiceEndStatusEl.hidden = true;
  window.anchorVoiceEvents = [];
  activeVoiceSessionId = "";
  activeVoiceUsedRealtime = false;
  let connection = null;
  const useLiveRealtime = shouldUseRealWebRtc();

  try {
    const formData = new FormData(voiceForm);
    connection = useLiveRealtime
      ? await createRealtimeWebRtcOffer()
      : null;
    const result = await postJson("/api/voice/client-secret", {
      mode: "skill",
      doNotSave: formData.get("doNotSave") === "on",
      useLiveRealtime,
      contextRefs: {},
      sdpOffer: connection?.offerSdp ?? await createLocalSdpOffer()
    });
    if (connection) {
      await connectRealtimeWebRtc(connection, result.sdpAnswer);
      activeVoiceConnection = connection;
      connection = null;
    }
    activeVoiceSessionId = result.voiceSessionId;
    activeVoiceUsedRealtime = useLiveRealtime;
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
    closeVoiceConnection(connection);
    activeVoiceSessionId = "";
    activeVoiceUsedRealtime = false;
    voiceEndButton.hidden = true;
    voiceStatusEl.hidden = true;
    voicePreviewEl.hidden = true;
    renderInlineError(voiceErrorEl, error.message || "Voice session could not start.");
  }
}

function shouldUseRealWebRtc() {
  const available = publicConfig?.voice?.liveRealtimeAvailable === true;
  return available && (
    voiceUseLiveAgentEl.checked ||
    localStorage.getItem("anchor_live_webrtc") === "1" ||
    new URLSearchParams(location.search).get("liveWebrtc") === "1"
  );
}

async function createLocalSdpOffer() {
  return "v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=Anchor Browser Offer\r\n";
}

async function createRealtimeWebRtcOffer() {
  if (!("RTCPeerConnection" in window) || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Realtime voice needs browser WebRTC and microphone support.");
  }

  const peerConnection = new RTCPeerConnection();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getAudioTracks().forEach(track => peerConnection.addTrack(track, stream));
  peerConnection.ontrack = event => {
    voiceRemoteAudioEl.srcObject = event.streams[0];
    voiceRemoteAudioEl.hidden = false;
  };

  const dataChannel = peerConnection.createDataChannel("oai-events");
  dataChannel.addEventListener("message", event => {
    try {
      window.anchorVoiceEvents.push(JSON.parse(event.data));
    } catch {
      window.anchorVoiceEvents.push({ type: "unparsed", raw: String(event.data) });
    }
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  await waitForIceGathering(peerConnection);

  return {
    peerConnection,
    stream,
    dataChannel,
    offerSdp: peerConnection.localDescription?.sdp || offer.sdp
  };
}

async function connectRealtimeWebRtc(connection, sdpAnswer) {
  await connection.peerConnection.setRemoteDescription({
    type: "answer",
    sdp: sdpAnswer
  });
  await waitForDataChannel(connection.dataChannel);
  connection.dataChannel.send(JSON.stringify({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: "Generated Anchor live browser test. Please give one short grounding instruction."
        }
      ]
    }
  }));
  connection.dataChannel.send(JSON.stringify({
    type: "response.create",
    response: {
      modalities: ["text", "audio"],
      instructions: "Reply with one short grounding instruction for the generated Anchor live test."
    }
  }));
}

function waitForIceGathering(peerConnection) {
  if (peerConnection.iceGatheringState === "complete") return Promise.resolve();
  return new Promise(resolve => {
    const timeout = setTimeout(done, 2000);
    function done() {
      clearTimeout(timeout);
      peerConnection.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    }
    function onChange() {
      if (peerConnection.iceGatheringState === "complete") done();
    }
    peerConnection.addEventListener("icegatheringstatechange", onChange);
  });
}

function waitForDataChannel(dataChannel) {
  if (dataChannel.readyState === "open") return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Realtime data channel did not open."));
    }, 10000);
    function cleanup() {
      clearTimeout(timeout);
      dataChannel.removeEventListener("open", onOpen);
      dataChannel.removeEventListener("error", onError);
    }
    function onOpen() {
      cleanup();
      resolve();
    }
    function onError() {
      cleanup();
      reject(new Error("Realtime data channel failed."));
    }
    dataChannel.addEventListener("open", onOpen);
    dataChannel.addEventListener("error", onError);
  });
}

async function endVoiceSession() {
  if (!activeVoiceSessionId) {
    closeActiveVoiceConnection();
    voiceEndButton.hidden = true;
    return;
  }
  voiceEndStatusEl.hidden = true;
  voiceEndStatusEl.textContent = "Voice session ended.";
  voiceEndStatusEl.hidden = false;
  try {
    await postJson(`/api/voice/sessions/${activeVoiceSessionId}/end`, {
      endedAt: new Date().toISOString(),
      savedSummary: activeVoiceUsedRealtime
        ? "Generated live voice test completed with Realtime events."
        : "Practiced one paced breathing cycle.",
      transcriptOptIn: activeVoiceUsedRealtime
    });
    voiceEndButton.hidden = true;
  } catch (error) {
    voiceEndStatusEl.hidden = true;
    renderInlineError(voiceErrorEl, error.message || "Voice session could not end.");
  } finally {
    closeActiveVoiceConnection();
  }
}

function closeVoiceConnection(connection) {
  if (!connection) return;
  connection.stream?.getTracks().forEach(track => track.stop());
  try {
    connection.dataChannel?.close();
  } catch {
    // Already closed.
  }
  try {
    connection.peerConnection?.close();
  } catch {
    // Already closed.
  }
}

function closeActiveVoiceConnection() {
  closeVoiceConnection(activeVoiceConnection);
  activeVoiceConnection = null;
  activeVoiceUsedRealtime = false;
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

import { expect, test } from "@playwright/test";

test("shows safety boundaries and crisis guidance before consent is saved", async ({ page }) => {
  await page.goto("/");
  const authRegion = page.getByRole("region", { name: "Account access" });

  await expect(authRegion.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(authRegion.getByText("not therapy or emergency care")).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 911" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Call or text 988" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.locator("#auth-mode-signin")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Forgot password?" })).toBeVisible();
});

test("blocks progression until account fields and required consents are complete", async ({ page }) => {
  await page.goto("/");

  await page.locator("#auth-mode-signup").click();
  await page.locator("#auth-submit").click();
  await expect(page.getByRole("alert")).toContainText("Enter a valid email");

  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.locator("#auth-submit").click();

  await expect(page.getByRole("alert")).toContainText("Privacy choices consent is required");
});

test("creates an account, saves consent, and keeps the Today snapshot working", async ({ page }) => {
  await page.goto("/");

  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(`pass1-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();

  await expect(page.getByRole("status")).toContainText("Consent saved");
  await expect(page.getByTestId("snapshot-summary")).toContainText("Morning anchor");
});

test("returning user can sign in and resume app state without recreating consent", async ({ page }) => {
  const email = `returning-${Date.now()}@example.com`;

  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();
  await expect(page.getByRole("heading", { name: "Build your starting rhythm" })).toBeVisible();

  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("stability, routine");
  await page.getByLabel("Hardest moments").fill("mornings, avoidance");
  await page.getByLabel("Therapy status").selectOption("self_directed");
  await page.getByRole("button", { name: "Create my day" }).click();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.locator("#auth-submit").click();

  await expect(page.locator("#auth-section")).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await expect(page.getByText("I understand Anchor is not emergency care")).toBeHidden();
});

test("authenticated refresh waits for bootstrap without flashing account creation", async ({ page }) => {
  const email = `refresh-${Date.now()}@example.com`;

  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();
  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("stability, routine");
  await page.getByLabel("Hardest moments").fill("mornings, avoidance");
  await page.getByLabel("Therapy status").selectOption("self_directed");
  await page.getByRole("button", { name: "Create my day" }).click();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

  let releaseBootstrap;
  const bootstrapGate = new Promise(resolve => {
    releaseBootstrap = resolve;
  });
  await page.route("**/api/app/bootstrap", async route => {
    await bootstrapGate;
    await route.continue();
  });

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#auth-section")).toBeHidden();
  await expect(page.getByText("Checking your Anchor session...")).toBeVisible();
  releaseBootstrap();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
});

test("guided app shell shows one product section, switches navigation, and logs out", async ({ page }) => {
  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(`guided-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();
  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("stability, routine");
  await page.getByLabel("Hardest moments").fill("mornings, avoidance");
  await page.getByLabel("Therapy status").selectOption("self_directed");
  await page.getByRole("button", { name: "Create my day" }).click();

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Morning quick check-in" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Full Diary Card" })).toBeHidden();

  await page.getByRole("button", { name: "Check-in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Morning quick check-in" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Full Diary Card" })).toBeHidden();

  await page.getByRole("button", { name: "Diary" }).click();
  await expect(page.getByRole("heading", { name: "Full Diary Card" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Morning quick check-in" })).toBeHidden();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
});

test("existing session with missing consent can complete consent without creating a duplicate account", async ({ page }) => {
  const email = `consent-resume-${Date.now()}@example.com`;

  await page.goto("/");
  await page.evaluate(async account => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: account.email,
        password: "passphrase-123",
        timezone: "America/Detroit",
        locale: "en-US"
      })
    });
    if (!response.ok) throw new Error("signup failed");
  }, { email });

  await page.reload();
  await expect(page.getByRole("heading", { name: "Complete consent" })).toBeVisible();
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();

  await expect(page.getByRole("heading", { name: "Build your starting rhythm" })).toBeVisible();
  await expect(page.getByText("An account already exists for this email.")).toBeHidden();
});

test("stale live voice preference does not bypass unavailable OpenAI config", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("anchor_live_webrtc", "1"));
  await page.route("**/api/config/public", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      ok: true,
      data: { voice: { liveRealtimeAvailable: false } }
    })
  }));

  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(`voice-local-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();
  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("stability, routine");
  await page.getByLabel("Hardest moments").fill("mornings, avoidance");
  await page.getByLabel("Therapy status").selectOption("self_directed");
  await page.getByRole("button", { name: "Create my day" }).click();
  await page.getByRole("button", { name: "Voice", exact: true }).click();

  await expect(page.getByLabel("Use real OpenAI voice agent")).toBeDisabled();
  await page.getByRole("button", { name: "Start Voice Session" }).click();

  await expect(page.getByText("Voice session ready. Client secret ready.")).toBeVisible();
  await expect(page.getByText("Server-mediated WebRTC connected.")).toBeVisible();
  await expect(page.getByRole("alert")).toBeHidden();
});

test("service worker removes stale app shell caches", async ({ page }) => {
  await page.goto("/");
  await expect.poll(async () => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
  await expect.poll(async () => page.evaluate(async () => (await caches.keys()).some(name => name.startsWith("anchor-app-shell-")))).toBe(true);
  const cacheNames = await page.evaluate(async () => caches.keys());
  expect(cacheNames).not.toContain("anchor-app-shell-v1");
});

test("forgot-password dialog resets a local prototype password and returns to sign in", async ({ page }) => {
  const email = `forgot-${Date.now()}@example.com`;

  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();
  await expect(page.getByRole("status")).toContainText("Consent saved");

  await page.context().clearCookies();
  await page.goto("/");
  await page.getByRole("button", { name: "Forgot password?" }).click();

  const dialog = page.locator("#password-reset-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  await dialog.getByLabel("Account address").fill(email);
  await dialog.getByRole("button", { name: "Get reset code" }).click();
  await expect(dialog.getByText("Prototype reset code:")).toBeVisible();
  const codeText = await dialog.locator("#reset-dev-code").textContent();
  expect(codeText).not.toBeNull();
  const code = codeText.trim();

  await dialog.getByLabel("Reset code").fill(code);
  await dialog.getByLabel("New passphrase").fill("new-passphrase-123");
  await dialog.getByRole("button", { name: "Reset password" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("status")).toContainText("Password reset");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("new-passphrase-123");
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-section")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Build your starting rhythm" })).toBeVisible();
});

test("forgot-password dialog explains missing prototype codes and closes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Forgot password?" }).click();

  const dialog = page.locator("#password-reset-dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Account address").fill(`missing-${Date.now()}@example.com`);
  await dialog.getByRole("button", { name: "Get reset code" }).click();

  await expect(dialog.getByText("No prototype reset code was returned for this address.")).toBeVisible();
  await expect(dialog.getByText("Prototype reset code:")).toBeHidden();
  await expect(dialog.getByRole("button", { name: "Reset password" })).toBeHidden();

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});

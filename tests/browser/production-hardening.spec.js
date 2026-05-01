import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page, prefix) {
  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(`${prefix}-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();
  await expect(page.getByText("Consent saved. Next: onboarding setup.")).toBeVisible();

  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("stability, routine");
  await page.getByLabel("Hardest moments").fill("mornings, avoidance");
  await page.getByLabel("Therapy status").selectOption("self_directed");
  await page.getByRole("button", { name: "Create my day" }).click();
  await expect(page.getByText("Your three anchors are ready.")).toBeVisible();
}

test("hardening voice flow uses server-mediated session setup", async ({ page }) => {
  await completeRoutineSetup(page, "hardening-voice");
  await page.getByRole("button", { name: "Voice", exact: true }).click();

  await page.getByLabel("Do not save this voice session").check();
  await page.getByRole("button", { name: "Start Voice Session" }).click();

  await expect(page.getByText("Voice session ready.")).toBeVisible();
  await expect(page.getByText("Transcript preview enabled.")).toBeVisible();
  await expect(page.getByText("Server-mediated WebRTC connected.")).toBeVisible();

  await page.getByRole("button", { name: "End Voice Session" }).click();
  await expect(page.getByText("Voice session ended.")).toBeVisible();
});

test("hardening export generates an authenticated JSON download", async ({ page }) => {
  await completeRoutineSetup(page, "hardening-export");
  await page.getByRole("button", { name: "Exports" }).click();

  await page.getByLabel("Include diary").check();
  await page.getByLabel("Include skills").check();
  await page.getByLabel("Include chain analyses").check();
  await page.getByLabel("Redact notes").check();
  await page.getByRole("button", { name: "Generate Packet" }).click();

  await expect(page.getByText("Packet ready.")).toBeVisible();
  const href = await page.getByRole("link", { name: "Download packet" }).getAttribute("href");
  expect(href).toContain("/api/exports/");
  expect(href).toContain("/download");
});

test("hardening deletion executes the privacy delete request", async ({ page }) => {
  await completeRoutineSetup(page, "hardening-delete");
  await page.getByRole("button", { name: "Privacy" }).click();

  await page.getByLabel("Delete confirmation").fill("DELETE");
  await page.getByRole("button", { name: "Request Delete" }).click();
  await expect(page.getByText("Deletion scheduled for 2026-05-05.")).toBeVisible();

  await page.getByRole("button", { name: "Execute Delete" }).click();
  await expect(page.getByText("Deletion completed.")).toBeVisible();
});

test("hardening PWA registers service worker and offline queue retries", async ({ page }) => {
  await completeRoutineSetup(page, "hardening-offline");
  await page.getByRole("button", { name: "Offline" }).click();

  await expect.poll(async () => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
  await page.route("**/api/sync/offline-queue", route => route.abort());
  await page.getByLabel("Client mutation id").fill("offline-hardening-1");
  await page.getByRole("button", { name: "Sync Offline Queue" }).click();
  await expect(page.getByText("Queued offline: offline-hardening-1")).toBeVisible();

  await page.unroute("**/api/sync/offline-queue");
  await page.getByRole("button", { name: "Sync Offline Queue" }).click();
  await expect(page.getByText("Accepted: offline-hardening-1")).toBeVisible();
});

test("hardening page has no console errors", async ({ page }) => {
  const issues = [];
  page.on("console", message => {
    if (["error", "warning"].includes(message.type())) issues.push(message.text());
  });
  page.on("pageerror", error => issues.push(error.message));

  await completeRoutineSetup(page, "hardening-console");
  await page.getByRole("button", { name: "Offline" }).click();
  await expect(page.getByRole("heading", { name: "Notifications and Offline Capture" })).toBeVisible();
  expect(issues).toEqual([]);
});

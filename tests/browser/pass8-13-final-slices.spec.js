import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page, prefix) {
  await page.goto("/");
  await page.getByLabel("Email").fill(`${prefix}-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.getByRole("button", { name: "Create account and save consent" }).click();
  await expect(page.getByText("Consent saved. Next: onboarding setup.")).toBeVisible();

  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("stability, routine");
  await page.getByLabel("Hardest moments").fill("mornings, avoidance");
  await page.getByLabel("Therapy status").selectOption("self_directed");
  await page.getByRole("button", { name: "Create my day" }).click();
  await expect(page.getByText("Your three anchors are ready.")).toBeVisible();
}

test("Pass 8 creates and completes a chain analysis", async ({ page }) => {
  await completeRoutineSetup(page, "pass8");

  await expect(page.getByRole("heading", { name: "Chain Analysis" })).toBeVisible();
  await page.getByLabel("Prompting event").fill("Avoided the afternoon anchor.");
  await page.getByRole("button", { name: "Create Chain Analysis" }).click();
  await expect(page.getByText("Chain draft saved.")).toBeVisible();

  await page.getByLabel("Vulnerabilities").fill("low sleep");
  await page.getByLabel("Links").fill("urge to isolate");
  await page.getByLabel("Consequences").fill("missed anchor");
  await page.getByLabel("Alternatives").fill("text support person");
  await page.getByRole("button", { name: "Complete Chain Analysis" }).click();

  await expect(page.getByText("Chain analysis complete.")).toBeVisible();
  await expect(page.getByText("Use STOP before the next high-risk link.")).toBeVisible();
});

test("Pass 9 starts and ends a voice coach session with transcript preview", async ({ page }) => {
  await completeRoutineSetup(page, "pass9");

  await expect(page.getByRole("heading", { name: "Live Voice Coach" })).toBeVisible();
  await page.getByLabel("Do not save this voice session").check();
  await page.getByRole("button", { name: "Start Voice Session" }).click();

  await expect(page.getByText("Client secret ready.")).toBeVisible();
  await expect(page.getByText("Transcript preview enabled.")).toBeVisible();

  await page.getByRole("button", { name: "End Voice Session" }).click();
  await expect(page.getByText("Voice session ended.")).toBeVisible();
});

test("Pass 10 renders insights and weekly review", async ({ page }) => {
  await completeRoutineSetup(page, "pass10");

  await expect(page.getByRole("heading", { name: "Insights and Weekly Review" })).toBeVisible();
  await page.getByRole("button", { name: "Load Insights" }).click();

  await expect(page.getByText("Structure score: 72")).toBeVisible();
  await expect(page.getByText("Structure supports mood")).toBeVisible();
  await expect(page.getByText("Keep morning anchor small")).toBeVisible();
});

test("Pass 11 generates a redacted session prep packet", async ({ page }) => {
  await completeRoutineSetup(page, "pass11");

  await expect(page.getByRole("heading", { name: "Session Prep Export" })).toBeVisible();
  await page.getByLabel("Include diary").check();
  await page.getByLabel("Include skills").check();
  await page.getByLabel("Include chain analyses").check();
  await page.getByLabel("Redact notes").check();
  await page.getByRole("button", { name: "Generate Packet" }).click();

  await expect(page.getByText("Packet ready.")).toBeVisible();
  await expect(page.getByText("Download packet")).toBeVisible();
});

test("Pass 12 saves privacy controls and queues export/delete", async ({ page }) => {
  await completeRoutineSetup(page, "pass12");

  await expect(page.getByRole("heading", { name: "Privacy and Data Controls" })).toBeVisible();
  await page.getByLabel("Transcript retention").selectOption("0");
  await page.getByLabel("Trace retention").selectOption("30");
  await page.getByRole("button", { name: "Save Privacy Settings" }).click();
  await expect(page.getByText("Privacy settings saved.")).toBeVisible();

  await page.getByRole("button", { name: "Export Data" }).click();
  await expect(page.getByText("Export queued.")).toBeVisible();

  await page.getByLabel("Delete confirmation").fill("DELETE");
  await page.getByRole("button", { name: "Request Delete" }).click();
  await expect(page.getByText("Deletion scheduled for 2026-05-05.")).toBeVisible();
});

test("Pass 13 saves notification settings and syncs offline capture", async ({ page }) => {
  await completeRoutineSetup(page, "pass13");

  await expect(page.getByRole("heading", { name: "Notifications and Offline Capture" })).toBeVisible();
  await page.getByLabel("Notification opt-in").check();
  await page.getByLabel("Quiet hours start").fill("22:00");
  await page.getByLabel("Quiet hours end").fill("07:00");
  await page.getByRole("button", { name: "Save Notification Settings" }).click();
  await expect(page.getByText("Notification settings saved.")).toBeVisible();

  await page.getByLabel("Client mutation id").fill("mutation-1");
  await page.getByRole("button", { name: "Sync Offline Queue" }).click();
  await expect(page.getByText("Accepted: mutation-1")).toBeVisible();
});

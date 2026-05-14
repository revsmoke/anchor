import { expect, test } from "@playwright/test";

test.skip(process.env.OPENAI_REALTIME_LIVE_TEST !== "1", "OpenAI live tests require explicit opt-in.");

test("live OpenAI full-function seeded prototype workflow works in the browser", async ({ page }) => {
  const issues = [];
  page.on("console", message => {
    if (
      ["error", "warning"].includes(message.type()) &&
      !message.text().includes("Failed to load resource: net::ERR_FAILED")
    ) {
      issues.push(message.text());
    }
  });
  page.on("pageerror", error => issues.push(error.message));

  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("anchor_live_webrtc", "1"));

  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(`browser-live-${Date.now()}@anchor.test`);
  await page.getByLabel("Password").fill("anchor-live-test-passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.locator("#auth-submit").click();
  await expect(page.getByText("Consent saved. Next: onboarding setup.")).toBeVisible();

  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("generated stability, generated routine");
  await page.getByLabel("Hardest moments").fill("generated mornings, generated avoidance");
  await page.getByLabel("Therapy status").selectOption("self_directed");
  await page.getByRole("button", { name: "Create my day" }).click();
  await expect(page.getByText("Your three anchors are ready.")).toBeVisible();

  await page.getByRole("button", { name: "Check-in", exact: true }).click();
  await page.locator("#check-in-section").getByLabel("Mood").selectOption("2");
  await page.locator("#check-in-section").getByLabel("Primary urge").selectOption("1");
  await page.locator("#check-in-section").getByLabel("Energy").selectOption("medium");
  await page.getByLabel("Check-in note").fill("Generated live browser check-in.");
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();
  await expect(page.getByText("Morning anchor complete.")).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByLabel("Must-do").fill("generated therapy prep");
  await page.getByLabel("Deferred items").fill("generated errands");
  await page.getByLabel("Regulation action").fill("generated paced breathing");
  await page.getByLabel("Reset mode").selectOption("minimum_viable_day");
  await page.getByRole("button", { name: "Apply Reset" }).click();
  await expect(page.getByText("Minimum viable day set.")).toBeVisible();

  await page.getByRole("button", { name: "Diary" }).click();
  await page.getByLabel("Anxiety/fear").selectOption("2");
  await page.getByLabel("Sadness").selectOption("1");
  await page.getByLabel("Anger").selectOption("1");
  await page.getByLabel("Shame").selectOption("0");
  await page.getByLabel("Guilt").selectOption("1");
  await page.getByLabel("Numbness").selectOption("0");
  await page.getByLabel("Joy/calm").selectOption("3");
  await page.getByLabel("Self-harm urge").selectOption("0");
  await page.getByLabel("Suicidality urge").selectOption("0");
  await page.getByLabel("Substance use urge").selectOption("0");
  await page.getByLabel("Binge/restrict/purge urge").selectOption("0");
  await page.getByLabel("Isolate/avoid urge").selectOption("2");
  await page.getByLabel("Quit/give-up urge").selectOption("1");
  await page.getByLabel("Lash out urge").selectOption("0");
  await page.getByLabel("Target occurrence").selectOption("urge_only");
  await page.getByLabel("Skills used").fill("paced_breathing, stop");
  await page.getByLabel("Overall day difficulty").selectOption("2");
  await page.getByLabel("Diary notes").fill("Generated live browser diary note for export redaction.");
  await page.getByRole("button", { name: "Complete Diary Card" }).click();
  await expect(page.getByText("Diary card saved.")).toBeVisible();

  await page.getByRole("button", { name: "Skills" }).click();
  await page.getByLabel("Search skills").fill("paced");
  await page.getByRole("button", { name: "Open Paced Breathing" }).click();
  await page.getByRole("button", { name: "Start Exercise" }).click();
  await page.getByLabel("Helpfulness rating").selectOption("4");
  await page.getByRole("button", { name: "Complete Exercise" }).click();
  await expect(page.getByText("Skill session saved.")).toBeVisible();

  await page.getByRole("button", { name: "Coach" }).click();
  await page.getByLabel("Coach message").fill("Generated live browser test: choose one next action.");
  await page.getByRole("button", { name: "Send coach message" }).click();
  await expect(page.getByText(/Coach:/)).toBeVisible();

  await page.getByRole("button", { name: "Chain" }).click();
  await page.getByLabel("Prompting event").fill("Generated live browser prompting event.");
  await page.getByRole("button", { name: "Create Chain Analysis" }).click();
  await expect(page.getByText("Chain draft saved.")).toBeVisible();
  await page.getByLabel("Vulnerabilities").fill("generated low sleep");
  await page.getByLabel("Links").fill("generated urge to avoid");
  await page.getByLabel("Consequences").fill("generated missed anchor");
  await page.getByLabel("Alternatives").fill("generated text support");
  await page.getByRole("button", { name: "Complete Chain Analysis" }).click();
  await expect(page.getByText("Chain analysis complete.")).toBeVisible();

  await page.getByRole("button", { name: "Voice", exact: true }).click();
  await page.getByRole("button", { name: "Start Voice Session" }).click();
  await expect(page.getByText("Voice session ready.")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Server-mediated WebRTC connected.")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => window.anchorVoiceEvents?.length ?? 0), {
    timeout: 30000
  }).toBeGreaterThan(0);
  await page.getByRole("button", { name: "End Voice Session" }).click();
  await expect(page.getByText("Voice session ended.")).toBeVisible();

  await page.getByRole("button", { name: "Insights" }).click();
  await page.getByRole("button", { name: "Load Insights" }).click();
  await expect(page.getByText("Structure score: 72")).toBeVisible();

  await page.getByRole("button", { name: "Exports" }).click();
  await page.getByLabel("Include diary").check();
  await page.getByLabel("Include skills").check();
  await page.getByLabel("Include chain analyses").check();
  await page.getByLabel("Redact notes").check();
  await page.getByRole("button", { name: "Generate Packet" }).click();
  await expect(page.getByText("Packet ready.")).toBeVisible();

  await page.getByRole("button", { name: "Privacy" }).click();
  await page.getByRole("button", { name: "Export Data" }).click();
  await expect(page.getByText("Export queued.")).toBeVisible();

  await page.getByRole("button", { name: "Offline" }).click();
  await expect.poll(async () => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
  await page.route("**/api/sync/offline-queue", route => route.abort());
  await page.getByLabel("Client mutation id").fill(`live-offline-${Date.now()}`);
  await page.getByRole("button", { name: "Sync Offline Queue" }).click();
  await expect(page.getByText(/Queued offline:/)).toBeVisible();
  await page.unroute("**/api/sync/offline-queue");
  await page.getByRole("button", { name: "Sync Offline Queue" }).click();
  await expect(page.getByText(/Accepted:/)).toBeVisible();

  await page.getByRole("button", { name: "Privacy" }).click();
  await page.getByLabel("Delete confirmation").fill("DELETE");
  await page.getByRole("button", { name: "Request Delete" }).click();
  await expect(page.getByText("Deletion scheduled for 2026-05-05.")).toBeVisible();
  await page.getByRole("button", { name: "Execute Delete" }).click();
  await expect(page.getByText("Deletion completed.")).toBeVisible();

  expect(issues).toEqual([]);
});

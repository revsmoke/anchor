import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page) {
  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(`pass3-${Date.now()}@example.com`);
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
  await page.getByRole("button", { name: "Check-in", exact: true }).click();
}

test("completes morning quick check-in and marks first anchor complete", async ({ page }) => {
  const startedAt = Date.now();
  await completeRoutineSetup(page);

  await expect(page.getByRole("heading", { name: "Morning quick check-in" })).toBeVisible();
  await page.getByLabel("Mood").selectOption("2");
  await page.getByLabel("Primary urge").selectOption("1");
  await page.getByLabel("Energy").selectOption("medium");
  await page.getByLabel("Check-in note").fill("I can start small.");
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();

  await expect(page.getByText("Morning anchor complete.")).toBeVisible();
  await expect(page.getByText("Choose one focus and cope ahead.")).toBeVisible();
  await expect(page.getByText("Midday anchor is next.")).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(30000);
});

test("quick check-in validates score fields before saving", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();

  await expect(page.getByRole("alert")).toContainText("Mood is required");
});

test("quick check-in renders Safety Mode for elevated urge fixture", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByLabel("Mood").selectOption("5");
  await page.getByLabel("Primary urge").selectOption("5");
  await page.getByLabel("Energy").selectOption("high");
  await page.getByLabel("Next action status").selectOption("deferred");
  await page.getByLabel("Check-in note").fill("I am not sure I can stay safe.");
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();

  await expect(page.getByRole("region", { name: "Safety Mode" })).toBeVisible();
  await expect(page.getByText("Pause normal coaching and check whether you are safe right now.")).toBeVisible();
});

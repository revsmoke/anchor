import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page) {
  await page.goto("/");
  await page.getByLabel("Email").fill(`pass6-${Date.now()}@example.com`);
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

test("browses skills, searches locally, and completes a guided exercise", async ({ page }) => {
  await completeRoutineSetup(page);

  await expect(page.getByRole("heading", { name: "Skills Library" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "STOP" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Paced Breathing" })).toBeVisible();

  await page.getByRole("button", { name: "Emotion Regulation" }).click();
  await expect(page.getByRole("heading", { name: "Opposite Action" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Paced Breathing" })).toBeHidden();

  await page.getByRole("button", { name: "All Skills" }).click();
  await page.getByLabel("Search skills").fill("breath");
  await expect(page.getByRole("heading", { name: "Paced Breathing" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "STOP" })).toBeHidden();

  await page.getByRole("button", { name: "Open Paced Breathing" }).click();
  await expect(page.getByRole("heading", { name: "Paced Breathing" })).toBeVisible();
  await expect(page.getByText("Inhale for four.")).toBeVisible();
  await expect(page.getByText("Duration: 2 minutes")).toBeVisible();

  await page.getByRole("button", { name: "Start Exercise" }).click();
  await expect(page.getByText("Exercise running.")).toBeVisible();
  await page.getByLabel("Helpfulness rating").selectOption("4");
  await page.getByRole("button", { name: "Complete Exercise" }).click();

  await expect(page.getByText("Skill session saved.")).toBeVisible();
  await expect(page.getByText("What changed after paced breathing?")).toBeVisible();
  await expect(page.getByText("Recent: paced_breathing")).toBeVisible();
});

test("guided exercise validates helpfulness before completion", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByRole("button", { name: "Open STOP" }).click();
  await page.getByRole("button", { name: "Start Exercise" }).click();
  await page.getByRole("button", { name: "Complete Exercise" }).click();

  await expect(page.getByRole("alert")).toContainText("Helpfulness rating is required");
});

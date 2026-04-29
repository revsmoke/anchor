import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page) {
  await page.goto("/");
  await page.getByLabel("Email").fill(`pass5-${Date.now()}@example.com`);
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

async function fillDiary(page) {
  await page.getByLabel("Anxiety/fear").selectOption("3");
  await page.getByLabel("Sadness").selectOption("2");
  await page.getByLabel("Anger").selectOption("1");
  await page.getByLabel("Shame").selectOption("4");
  await page.getByLabel("Guilt").selectOption("2");
  await page.getByLabel("Numbness").selectOption("0");
  await page.getByLabel("Joy/calm").selectOption("2");
  await page.getByLabel("Self-harm urge").selectOption("0");
  await page.getByLabel("Suicidality urge").selectOption("0");
  await page.getByLabel("Substance use urge").selectOption("1");
  await page.getByLabel("Binge/restrict/purge urge").selectOption("0");
  await page.getByLabel("Isolate/avoid urge").selectOption("3");
  await page.getByLabel("Quit/give-up urge").selectOption("2");
  await page.getByLabel("Lash out urge").selectOption("0");
  await page.getByLabel("Overall day difficulty").selectOption("3");
  await page.getByLabel("Target occurrence").selectOption("urge_only");
  await page.getByLabel("Skills used").fill("stop, paced_breathing");
  await page.getByLabel("Sleep minutes").fill("420");
  await page.getByLabel("Sleep quality").selectOption("3");
  await page.getByLabel("Medication adherence").selectOption("taken");
  await page.getByLabel("Diary notes").fill("Kept the day workable.");
}

test("saves the evening diary card and renders the next step", async ({ page }) => {
  await completeRoutineSetup(page);

  await expect(page.getByRole("heading", { name: "Full Diary Card" })).toBeVisible();
  await expect(page.getByLabel("Morning completion")).toBeVisible();
  await expect(page.getByLabel("Joy/calm")).toBeVisible();
  await expect(page.getByLabel("Lash out urge")).toBeVisible();

  await fillDiary(page);
  await page.getByRole("button", { name: "Complete Diary Card" }).click();

  await expect(page.getByText("Diary card saved.")).toBeVisible();
  await expect(page.getByText("Diary saved. Choose one small setup step for tomorrow.")).toBeVisible();
  await expect(page.getByText("Top target: isolate_avoid")).toBeVisible();
});

test("evening diary card validates required stable scores", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByRole("button", { name: "Complete Diary Card" }).click();

  await expect(page.getByRole("alert")).toContainText("Anxiety/fear is required");
});

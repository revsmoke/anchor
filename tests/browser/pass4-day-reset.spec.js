import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page) {
  await page.goto("/");
  await page.getByLabel("Email").fill(`pass4-${Date.now()}@example.com`);
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

test("applies minimum viable day reset with non-shaming missed-anchor copy", async ({ page }) => {
  await completeRoutineSetup(page);

  await expect(page.getByRole("heading", { name: "Reset Today" })).toBeVisible();
  await expect(page.getByText("Missing an anchor is information, not failure.")).toBeVisible();

  await page.getByLabel("Must-do").fill("therapy");
  await page.getByLabel("Deferred items").fill("errands, long messages");
  await page.getByLabel("Regulation action").fill("10-min walk");
  await page.getByLabel("Reset mode").selectOption("minimum_viable_day");
  await page.getByRole("button", { name: "Apply Reset" }).click();

  await expect(page.getByText("Minimum viable day set.")).toBeVisible();
  await expect(page.getByText("Minimum viable day set: do therapy, then take 10-min walk.")).toBeVisible();
  await expect(page.getByText("Deferred: errands, long messages")).toBeVisible();
  await expect(page.getByTestId("reset-anchor-list")).toContainText("Morning");
  await expect(page.getByTestId("reset-anchor-list")).toContainText("Midday");
  await expect(page.getByTestId("reset-anchor-list")).toContainText("Evening");
});

test("day reset validates required must-do before saving", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByLabel("Regulation action").fill("10-min walk");
  await page.getByRole("button", { name: "Apply Reset" }).click();

  await expect(page.getByRole("alert")).toContainText("One must-do is required");
});

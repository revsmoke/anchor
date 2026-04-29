import { expect, test } from "@playwright/test";

async function createConsentedAccount(page) {
  await page.goto("/");
  await page.getByLabel("Email").fill(`pass2-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.getByRole("button", { name: "Create account and save consent" }).click();
  await expect(page.getByRole("status")).toContainText("Consent saved");
}

test("keeps onboarding setup hidden until required consent is saved", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Build your starting rhythm" })).toBeHidden();
});

test("creates profile rhythm and three daily anchors after consent", async ({ page }) => {
  await createConsentedAccount(page);

  await expect(page.getByRole("heading", { name: "Build your starting rhythm" })).toBeVisible();
  await page.getByLabel("Wake time").fill("07:00");
  await page.getByLabel("Sleep time").fill("23:00");
  await page.getByLabel("Top goals").fill("stability, routine");
  await page.getByLabel("Hardest moments").fill("mornings, avoidance");
  await page.getByLabel("Therapy status").selectOption("in_therapy");

  await page.getByLabel("Morning anchor time").fill("07:30");
  await page.getByLabel("Midday anchor time").fill("12:30");
  await page.getByLabel("Evening anchor time").fill("21:00");
  await page.getByRole("button", { name: "Create my day" }).click();

  await expect(page.getByText("Your three anchors are ready.")).toBeVisible();
  await expect(page.getByTestId("anchor-list")).toContainText("Morning");
  await expect(page.getByTestId("anchor-list")).toContainText("Midday");
  await expect(page.getByTestId("anchor-list")).toContainText("Evening");
  await expect(page.getByText("Start your morning anchor.")).toBeVisible();
});

test("onboarding setup validates required rhythm fields before saving", async ({ page }) => {
  await createConsentedAccount(page);

  await page.getByRole("button", { name: "Create my day" }).click();

  await expect(page.getByRole("alert")).toContainText("Wake time is required");
});

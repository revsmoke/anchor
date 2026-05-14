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

async function fillMorningCheckIn(page, { mood = "2", urge = "1", energy = "medium" } = {}) {
  const checkInSection = page.locator("#check-in-section");
  await checkInSection.getByLabel("Mood").selectOption(mood);
  await checkInSection.getByLabel("Primary urge").selectOption(urge);
  await checkInSection.getByLabel("Energy").selectOption(energy);
}

test("completes morning quick check-in and marks first anchor complete", async ({ page }) => {
  const startedAt = Date.now();
  await completeRoutineSetup(page);

  await expect(page.getByRole("heading", { name: "Morning quick check-in" })).toBeVisible();
  await fillMorningCheckIn(page);
  await page.getByLabel("Check-in note").fill("I can start small.");
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();

  await expect(page.getByText("Morning anchor complete.")).toBeVisible();
  await expect(page.getByText("Pick one focus and make a cope-ahead plan.")).toBeVisible();
  await expect(page.getByText("Cope ahead means choose one likely hard moment")).toBeVisible();
  await expect(page.getByText("Midday anchor is next.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pick focus" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Go to Midday anchor" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Practice a skill" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset today" })).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(30000);
});

test("loads the Today view through the canonical today endpoint", async ({ page }) => {
  let todayRequests = 0;
  page.on("request", request => {
    if (new URL(request.url()).pathname === "/api/today") {
      todayRequests += 1;
    }
  });

  await completeRoutineSetup(page);

  await expect(page.getByRole("heading", { name: "Morning quick check-in" })).toBeVisible();
  await expect.poll(() => todayRequests).toBeGreaterThan(0);
});

test("saves a focus and cope-ahead plan and shows it on Today", async ({ page }) => {
  await completeRoutineSetup(page);

  await fillMorningCheckIn(page);
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();
  await page.getByRole("button", { name: "Pick focus" }).click();

  await expect(page).toHaveURL(/#focus-plan$/);
  await expect(page.getByRole("heading", { name: "Focus and cope-ahead plan" })).toBeVisible();
  await page.getByLabel("One focus").fill("email therapist");
  await page.getByLabel("Likely hard moment").fill("after lunch energy drop");
  await page.getByLabel("Skill or support step").fill("paced breathing before opening messages");
  await page.getByRole("button", { name: "Save focus plan" }).click();

  await expect(page).toHaveURL(/#today$/);
  await expect(page.getByText("email therapist")).toBeVisible();
  await expect(page.getByText("after lunch energy drop")).toBeVisible();
  await expect(page.getByText("paced breathing before opening messages")).toBeVisible();
});

test("uses browser history between morning result and Midday anchor", async ({ page }) => {
  await completeRoutineSetup(page);

  await fillMorningCheckIn(page);
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();
  await page.getByRole("button", { name: "Go to Midday anchor" }).click();

  await expect(page).toHaveURL(/#midday$/);
  await expect(page.getByRole("heading", { name: "Midday anchor" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/#check-in$/);
  await expect(page.getByText("Morning anchor complete.")).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/#midday$/);
  await expect(page.getByRole("heading", { name: "Midday anchor" })).toBeVisible();
});

test("completes the Midday anchor and updates Today progress", async ({ page }) => {
  await completeRoutineSetup(page);

  await fillMorningCheckIn(page);
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();
  await page.getByRole("button", { name: "Go to Midday anchor" }).click();

  await page.getByLabel("Midday mood").selectOption("3");
  await page.getByLabel("Midday urge").selectOption("1");
  await page.getByLabel("Midday energy").selectOption("low");
  await page.getByLabel("Midday note").fill("I need to simplify.");
  await page.getByRole("button", { name: "Complete Midday anchor" }).click();

  await expect(page.getByText("Midday anchor complete.")).toBeVisible();
  await page.getByRole("button", { name: "Back to Today" }).click();
  await expect(page).toHaveURL(/#today$/);
  await expect(page.getByTestId("anchor-progress")).toContainText("Morning");
  await expect(page.getByTestId("anchor-progress")).toContainText("Midday");
  await expect(page.getByTestId("anchor-progress")).toContainText("Evening");
  await expect(page.getByTestId("anchor-progress")).toContainText("Complete");
  await expect(page.getByTestId("anchor-progress")).toContainText("Current");
});

test("quick check-in validates score fields before saving", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();

  await expect(page.getByRole("alert")).toContainText("Mood is required");
});

test("quick check-in renders Safety Mode for elevated urge fixture", async ({ page }) => {
  await completeRoutineSetup(page);

  await fillMorningCheckIn(page, { mood: "5", urge: "5", energy: "high" });
  await page.getByLabel("Next action status").selectOption("deferred");
  await page.getByLabel("Check-in note").fill("I am not sure I can stay safe.");
  await page.getByRole("button", { name: "Save check-in and complete morning anchor" }).click();

  await expect(page.getByRole("region", { name: "Safety Mode" })).toBeVisible();
  await expect(page.getByText("Pause normal coaching and check whether you are safe right now.")).toBeVisible();
});

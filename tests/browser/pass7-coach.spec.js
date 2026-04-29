import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page) {
  await page.goto("/");
  await page.getByLabel("Email").fill(`pass7-${Date.now()}@example.com`);
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

test("sends a normal text coach message and renders next action", async ({ page }) => {
  await completeRoutineSetup(page);

  await expect(page.getByRole("heading", { name: "Text Coach" })).toBeVisible();
  await page.getByLabel("Coach mode").selectOption("reset");
  await page.getByLabel("Coach message").fill("I missed the morning and feel behind.");
  await page.getByRole("button", { name: "Send coach message" }).click();

  await expect(page.getByText("Coach: Let's reduce the day to one must-do.")).toBeVisible();
  await expect(page.getByText("Next action: Choose one must-do")).toBeVisible();
  await expect(page.getByText("Specialist: Structure Coach")).toBeVisible();
});

test("elevated coach message renders Safety Mode instead of normal coaching", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByLabel("Coach mode").selectOption("skill");
  await page.getByLabel("Coach message").fill("I am not sure I can stay safe tonight.");
  await page.getByRole("button", { name: "Send coach message" }).click();

  const safetyMode = page.getByRole("region", { name: "Coach Safety Mode" });
  await expect(safetyMode).toBeVisible();
  await expect(safetyMode.getByText("Are you safe right now?")).toBeVisible();
  await expect(safetyMode.getByText("Grounding skill: Paced Breathing")).toBeVisible();
  await expect(safetyMode.getByRole("link", { name: "Call 911" })).toBeVisible();
  await expect(page.getByText("Coach: Let's reduce the day to one must-do.")).toBeHidden();
});

test("acute coach message locks normal coaching for the session", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByLabel("Coach message").fill("I have a plan to kill myself tonight and cannot stay safe.");
  await page.getByRole("button", { name: "Send coach message" }).click();

  const safetyMode = page.getByRole("region", { name: "Coach Safety Mode" });
  await expect(safetyMode).toBeVisible();
  await expect(safetyMode.getByRole("heading", { name: "Emergency support now" })).toBeVisible();
  await expect(safetyMode.getByText("Normal coaching is locked for this session.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send coach message" })).toBeDisabled();
});

import { expect, test } from "@playwright/test";

async function completeRoutineSetup(page) {
  await page.goto("/");
  await page.locator("#auth-mode-signup").click();
  await page.getByLabel("Email").fill(`safety-ui-${Date.now()}@example.com`);
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

test("manages a safety plan and resolves a Help Now acute episode", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", message => {
    const text = message.text();
    if (message.type() === "error" && !text.includes("status of 423")) {
      consoleErrors.push(text);
    }
  });

  await completeRoutineSetup(page);

  await page.getByRole("button", { name: "Safety", exact: true }).click();
  await expect(page).toHaveURL(/#safety$/);
  await expect(page.getByRole("heading", { name: "Safety Plan" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 911" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Call or text 988" })).toBeVisible();

  await page.getByLabel("Warning signs").fill("urge spike, shutting down");
  await page.getByLabel("Safety steps").fill("paced breathing, text Taylor");
  await page.getByLabel("Support contact name").fill("Taylor");
  await page.getByLabel("Support contact relationship").fill("Friend");
  await page.getByLabel("Support contact phone").fill("555-0100");
  await page.getByLabel("Crisis resource label").fill("Call or text 988");
  await page.getByLabel("Crisis resource value").fill("988");
  await page.getByRole("button", { name: "Save Safety Plan" }).click();
  await expect(page.getByText("Safety plan saved.")).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Safety", exact: true }).click();
  await expect(page.getByLabel("Warning signs")).toHaveValue("urge spike, shutting down");
  await expect(page.getByLabel("Safety steps")).toHaveValue("paced breathing, text Taylor");
  await expect(page.getByLabel("Support contact name")).toHaveValue("Taylor");

  await page.getByRole("button", { name: "Help Now" }).click();
  await expect(page.getByText("Help Now safety event logged. Normal actions are locked until this is resolved.")).toBeVisible();

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Must-do").fill("call support");
  await page.getByLabel("Regulation action").fill("paced breathing");
  await page.getByLabel("Reset mode").selectOption("minimum_viable_day");
  await page.getByRole("button", { name: "Apply Reset" }).click();
  await expect(page.getByRole("alert")).toContainText("Normal actions are locked until the active safety episode is resolved.");

  await page.getByRole("button", { name: "Safety", exact: true }).click();
  await page.getByLabel("Resolution note").fill("I reached Taylor and moved to a safer place.");
  await page.getByRole("button", { name: "Resolve safety episode" }).click();
  await expect(page.getByText("Safety episode resolved. Normal actions are available again.")).toBeVisible();

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Apply Reset" }).click();
  await expect(page.getByText("Minimum viable day set.")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("resolves an acute episode that started from coach safety mode", async ({ page }) => {
  await completeRoutineSetup(page);

  await page.getByRole("button", { name: "Coach" }).click();
  await page.getByLabel("Coach message").fill("I have a plan to kill myself tonight and cannot stay safe.");
  await page.getByRole("button", { name: "Send coach message" }).click();
  await expect(page.getByRole("region", { name: "Coach Safety Mode" })).toBeVisible();

  await page.getByRole("button", { name: "Safety", exact: true }).click();
  await expect(page.getByText("Active safety episode found. Resolve it after support is reached.")).toBeVisible();
  await page.getByLabel("Resolution note").fill("I contacted support and am with another person.");
  await page.getByRole("button", { name: "Resolve safety episode" }).click();
  await expect(page.getByText("Safety episode resolved. Normal actions are available again.")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Safety", exact: true }).click();
  await expect(page.locator("#safety-resolution-form")).toBeHidden();
  await expect(page.getByLabel("Resolution note")).toHaveValue("");
  await expect(page.getByText("Active safety episode found. Resolve it after support is reached.")).toBeHidden();

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Must-do").fill("drink water");
  await page.getByLabel("Regulation action").fill("paced breathing");
  await page.getByLabel("Reset mode").selectOption("minimum_viable_day");
  await page.getByRole("button", { name: "Apply Reset" }).click();
  await expect(page.getByText("Minimum viable day set.")).toBeVisible();
});

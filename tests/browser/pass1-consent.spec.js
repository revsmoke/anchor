import { expect, test } from "@playwright/test";

test("shows safety boundaries and crisis guidance before consent is saved", async ({ page }) => {
  await page.goto("/");
  const consentRegion = page.getByRole("region", { name: "Before you begin" });

  await expect(consentRegion.getByRole("heading", { name: "Before you begin" })).toBeVisible();
  await expect(consentRegion.getByText("not therapy or emergency care")).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 911" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Call or text 988" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("blocks progression until account fields and required consents are complete", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Create account and save consent" }).click();
  await expect(page.getByRole("alert")).toContainText("Enter a valid email");

  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByRole("button", { name: "Create account and save consent" }).click();

  await expect(page.getByRole("alert")).toContainText("Privacy choices consent is required");
});

test("creates an account, saves consent, and keeps the Today snapshot working", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Email").fill(`pass1-${Date.now()}@example.com`);
  await page.getByLabel("Password").fill("passphrase-123");
  await page.getByLabel("I understand Anchor is not emergency care").check();
  await page.getByLabel("I understand privacy choices and data retention settings").check();
  await page.getByLabel("I understand voice audio and transcript choices").check();
  await page.getByRole("button", { name: "Create account and save consent" }).click();

  await expect(page.getByRole("status")).toContainText("Consent saved");
  await expect(page.getByTestId("snapshot-summary")).toContainText("Morning anchor");
});

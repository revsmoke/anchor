import { expect, test } from "@playwright/test";

test("renders the seeded Today snapshot from the API", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Anchor" })).toBeVisible();
  await expect(page.getByTestId("snapshot-product")).toHaveText("Anchor");
  await expect(page.getByTestId("snapshot-date")).not.toBeEmpty();
  await expect(page.getByTestId("snapshot-summary")).toContainText("Morning anchor");
});

test("loads the Pass 0 page without console errors", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");
  await expect(page.getByTestId("snapshot-summary")).toContainText("Morning anchor");

  expect(consoleErrors).toEqual([]);
});

test("serves a favicon response so the browser does not log a missing resource", async ({ page }) => {
  const response = await page.request.get("/favicon.ico");

  expect([200, 204]).toContain(response.status());
});

test("renders a visible error when the Today snapshot request fails", async ({ page }) => {
  await page.route("**/api/today/snapshot", async route => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "snapshot_unavailable",
          message: "Today snapshot is unavailable.",
          requestId: "req_browser"
        }
      })
    });
  });

  await page.goto("/");

  await expect(page.getByRole("alert")).toContainText("Today snapshot is unavailable.");
});

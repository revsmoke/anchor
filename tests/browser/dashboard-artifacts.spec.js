import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const dashboardPath = `${process.cwd()}/vertical-slice-dashboard.html`;

function readDashboardDefaultState() {
  const html = readFileSync(dashboardPath, "utf8");
  const match = html.match(/const DEFAULT_STATE = (\{[\s\S]*?\n\});\n\nfunction normalizeStateShape/);
  if (!match) throw new Error("Could not locate DEFAULT_STATE");
  return JSON.parse(match[1]);
}

test("vertical slice dashboard renders SPEC-compatible evidence-labeled hardening state", async ({ page }) => {
  const issues = [];
  page.on("console", message => {
    if (["error", "warning"].includes(message.type())) issues.push(message.text());
  });
  page.on("pageerror", error => issues.push(error.message));

  const state = readDashboardDefaultState();
  expect(state.evidence.schemaVersion).toBe("anchor-evidence-v1");
  expect(state.evidence.labels.map((entry) => entry.label)).toEqual([
    "verified",
    "prototype",
    "settings-only",
    "demo-fixture",
    "blocked"
  ]);

  await page.goto(pathToFileURL(dashboardPath).href);
  await page.evaluate(() => localStorage.removeItem("vsd-v2"));
  await page.reload();

  await expect(page.locator("#project-name")).toHaveValue("Anchor Production Hardening");
  await expect(page.locator("#stat-done")).toHaveText("60");
  await expect(page.locator("#stat-active")).toHaveText("0");
  await expect(page.locator("#stat-total")).toHaveText("60");
  await expect(page.getByText("Status →")).toBeVisible();
  await expect(page.locator(".legend-item").filter({ hasText: /^Done$/ })).toBeVisible();
  await expect(page.locator(".status-pill")).toHaveCount(60);

  expect(issues).toEqual([]);
});

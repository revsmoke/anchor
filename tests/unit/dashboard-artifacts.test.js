import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const repoRoot = new URL("../..", import.meta.url).pathname;
const validStatuses = new Set(["todo", "active", "done"]);

function readJson(path) {
  return JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
}

function readDashboardDefaultState() {
  const html = readFileSync(join(repoRoot, "vertical-slice-dashboard.html"), "utf8");
  const match = html.match(/const DEFAULT_STATE = (\{[\s\S]*?\n\});\n\nfunction normalizeStateShape/);
  if (!match) {
    throw new Error("Could not locate DEFAULT_STATE in vertical-slice-dashboard.html");
  }
  return JSON.parse(match[1]);
}

function validateStateShape(fileName, state) {
  expect(Array.isArray(state.passes), `${fileName} passes`).toBe(true);
  expect(Array.isArray(state.layers), `${fileName} layers`).toBe(true);
  expect(Array.isArray(state.tasks), `${fileName} tasks`).toBe(true);
  expect(Array.isArray(state.statuses), `${fileName} statuses`).toBe(true);
  expect(state.tasks.length, `${fileName} task rows`).toBe(state.layers.length);
  expect(state.statuses.length, `${fileName} status rows`).toBe(state.layers.length);

  state.layers.forEach((_, layerIndex) => {
    expect(state.tasks[layerIndex].length, `${fileName} task columns ${layerIndex}`).toBe(state.passes.length);
    expect(state.statuses[layerIndex].length, `${fileName} status columns ${layerIndex}`).toBe(state.passes.length);
    state.statuses[layerIndex].forEach((status, passIndex) => {
      expect(validStatuses.has(status), `${fileName} status ${layerIndex}/${passIndex}`).toBe(true);
    });
  });
}

function labelsFor(state) {
  return new Set((state.evidence?.labels ?? []).map((entry) => entry.label));
}

function evidenceText(state) {
  return JSON.stringify(state.evidence ?? {}).toLowerCase();
}

describe("vertical-slice dashboard artifacts", () => {
  test("all dashboard artifacts preserve the SPEC status contract and dimensions", () => {
    const artifactFiles = readdirSync(repoRoot)
      .filter((file) => /^vertical-slice-dashboard-anchor-.*\.json$/.test(file))
      .sort();

    expect(artifactFiles.length).toBeGreaterThan(0);

    for (const file of artifactFiles) {
      validateStateShape(file, readJson(file));
    }

    validateStateShape("vertical-slice-dashboard.html DEFAULT_STATE", readDashboardDefaultState());
  });

  test("active dashboard default state matches the hardening artifact", () => {
    const defaultState = readDashboardDefaultState();
    const hardeningState = readJson("vertical-slice-dashboard-anchor-hardening.json");

    expect(defaultState.projectName).toBe(hardeningState.projectName);
    expect(defaultState.passes).toEqual(hardeningState.passes);
    expect(defaultState.layers).toEqual(hardeningState.layers);
    expect(defaultState.tasks).toEqual(hardeningState.tasks);
    expect(defaultState.statuses).toEqual(hardeningState.statuses);
    expect(defaultState.evidence).toEqual(hardeningState.evidence);
  });

  test("current dashboard artifacts label known prototype and blocked surfaces without changing status enum", () => {
    const required = {
      "vertical-slice-dashboard-anchor-hardening.json": [
        "settings-only",
        "demo-fixture",
        "prototype",
        "blocked",
        "verified"
      ],
      "vertical-slice-dashboard-anchor-pass13.json": [
        "settings-only",
        "demo-fixture",
        "prototype",
        "blocked"
      ]
    };

    const requiredSurfaceText = {
      "vertical-slice-dashboard-anchor-hardening.json": [
        "notifications",
        "offline capture",
        "voice controls",
        "privacy controls",
        "therapist sharing",
        "passcode",
        "april 2026"
      ],
      "vertical-slice-dashboard-anchor-pass13.json": [
        "notifications",
        "offline capture",
        "skill timer",
        "voice controls",
        "privacy controls",
        "therapist sharing",
        "passcode",
        "april 2026"
      ]
    };

    for (const [file, expectedLabels] of Object.entries(required)) {
      const state = readJson(file);
      expect(state.evidence?.schemaVersion, `${basename(file)} evidence schema`).toBe("anchor-evidence-v1");

      const labelSet = labelsFor(state);
      for (const label of expectedLabels) {
        expect(labelSet.has(label), `${basename(file)} missing ${label}`).toBe(true);
      }

      const text = evidenceText(state);
      for (const surface of requiredSurfaceText[file]) {
        expect(text.includes(surface), `${basename(file)} missing surface ${surface}`).toBe(true);
      }
    }
  });
});

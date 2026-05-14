import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

const MATRIX_PATH = new URL("../../CAPABILITY_TOOL_MATRIX.md", import.meta.url);

const REQUIRED_COLUMNS = [
  "capability",
  "UI surface",
  "route/service",
  "tool name",
  "auth",
  "voice availability",
  "safety eligibility",
  "offline behavior",
  "dataClasses",
  "consentRequired",
  "status"
];

const REQUIRED_STATUSES = [
  "covered",
  "deferred with reason",
  "blocked",
  "intentionally_unavailable"
];

describe("capability tool matrix", () => {
  test("documents the required parity columns and allowed statuses", async () => {
    const markdown = await readFile(MATRIX_PATH, "utf8");
    const header = markdown.split("\n").find(line => line.startsWith("| capability |"));

    expect(header).toBeTruthy();
    for (const column of REQUIRED_COLUMNS) {
      expect(header).toContain(` ${column} `);
    }

    const rows = markdown
      .split("\n")
      .filter(line => line.startsWith("|") && !line.includes("---") && !line.startsWith("| capability |"));

    expect(rows.length).toBeGreaterThan(20);
    for (const row of rows) {
      const cells = row.split("|").slice(1, -1).map(cell => cell.trim());
      expect(cells).toHaveLength(REQUIRED_COLUMNS.length);
      expect(REQUIRED_STATUSES).toContain(cells.at(-1));
    }
  });

  test("captures critical gaps and voice credential boundaries", async () => {
    const markdown = await readFile(MATRIX_PATH, "utf8");

    expect(markdown).toContain("Canonical Today read model");
    expect(markdown).toContain("Safety plan management");
    expect(markdown).toContain("Safety event resolution");
    expect(markdown).toContain("Prompt registry administration");
    expect(markdown).toContain("Tool manifest discovery");
    expect(markdown).toContain("intentionally_unavailable_for_voice");
    expect(markdown).toContain("assist_only");
  });
});

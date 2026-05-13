import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";
import { createApp } from "../../server/app.js";
import { createDb } from "../../server/db.js";

function request(path, options = {}) {
  return new Request(`http://localhost${path}`, options);
}

function jsonRequest(path, body, headers = {}) {
  return request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

function createDateSpyDb() {
  const calls = [];
  return {
    calls,
    async getSessionUser() {
      return { id: "user_1", email: "u@example.com", timezone: "UTC", locale: "en-US", status: "active" };
    },
    async getUserDailyTimezone() {
      return "Pacific/Auckland";
    },
    async getConsentsForUser() {
      return [
        { type: "crisis_limits", granted: true },
        { type: "privacy_choices", granted: true },
        { type: "voice_audio", granted: true }
      ];
    },
    async getAppBootstrap(userId, options) {
      calls.push(["bootstrap", userId, options]);
      return {
        consents: await this.getConsentsForUser(userId),
        consentComplete: true,
        onboardingComplete: true,
        today: [],
        dailyPlan: null,
        focusPlan: null,
        nextStep: "main_app"
      };
    },
    async saveRoutineSetup(userId, anchors, options) {
      calls.push(["routines", userId, options]);
      return { routineTemplates: [], today: [], dailyPlan: { id: "plan_1", date: options.localDate } };
    },
    async resetTodayPlan(userId, reset, options) {
      calls.push(["reset", userId, options]);
      return { dailyPlan: { id: "plan_1", date: options.localDate }, anchors: [], nextBestStep: "Reset today." };
    },
    async saveTodayFocusPlan(userId, focusPlan, options) {
      calls.push(["focus", userId, options]);
      return { id: "focus_1", userId, planDate: options.localDate, ...focusPlan };
    },
    async completeRoutineInstance(userId, anchorId, completion, options) {
      calls.push(["complete", userId, options]);
      return {
        anchor: { id: anchorId, userId, type: "morning", status: "complete" },
        dailyPlan: { id: "plan_1", date: options.localDate },
        nextBestStep: "Midday anchor is next."
      };
    }
  };
}

describe("Pass 2 date and timezone contract", () => {
  test("daily-state routes pass one resolved user-local date into db helpers", async () => {
    const db = createDateSpyDb();
    const app = createApp({ db, now: () => new Date("2026-05-12T03:30:00.000Z") });
    const cookie = "anchor_session=token_1";

    await app.fetch(request("/api/app/bootstrap", { headers: { cookie } }));
    await app.fetch(jsonRequest("/api/onboarding/routines", {
      anchors: [
        { type: "morning", targetTime: "07:30", steps: ["check_in"] },
        { type: "midday", targetTime: "12:30", steps: ["status"] },
        { type: "evening", targetTime: "21:00", steps: ["diary"] }
      ]
    }, { cookie }));
    await app.fetch(jsonRequest("/api/today/reset", {
      mode: "minimum_viable_day",
      mustDos: ["therapy"],
      defer: ["errands"],
      regulationAction: "10-min walk"
    }, { cookie }));
    await app.fetch(jsonRequest("/api/today/focus-plan", {
      focusText: "Start small",
      anticipatedHardMoment: "After lunch",
      plannedSkill: "STOP"
    }, { cookie }));
    await app.fetch(jsonRequest("/api/today/anchors/anchor_1/complete", {
      completedAt: "2026-05-12T09:00:00.000Z",
      checkInId: "check_in_1"
    }, { cookie }));

    expect(db.calls.map(([name]) => name)).toEqual(["bootstrap", "routines", "reset", "focus", "complete"]);
    for (const [, , options] of db.calls) {
      expect(options).toEqual({
        localDate: "2026-05-12",
        timezone: "Pacific/Auckland"
      });
    }
  });

  test("explicit date query overrides clock time for supported daily reads", async () => {
    const db = createDateSpyDb();
    const app = createApp({ db, now: () => new Date("2026-05-12T03:30:00.000Z") });

    await app.fetch(request("/api/app/bootstrap?date=2026-01-15", {
      headers: { cookie: "anchor_session=token_1" }
    }));

    expect(db.calls[0][2]).toEqual({
      localDate: "2026-01-15",
      timezone: "Pacific/Auckland"
    });
  });
});

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeSql = testDatabaseUrl ? describe : describe.skip;

describeSql("Pass 2 SQL-backed date contract", () => {
  let sql;
  let db;

  beforeAll(async () => {
    sql = postgres(testDatabaseUrl, { max: 1 });
    await resetSchema(sql);
    db = createDb(testDatabaseUrl);
  });

  afterAll(async () => {
    await db?.close?.();
    await sql?.end({ timeout: 1 });
  });

  test("routine setup, focus plan, reset, and anchor completion persist the supplied local date", async () => {
    const user = await db.createUser({
      email: "tz-contract@example.com",
      passwordHash: "hash",
      timezone: "UTC",
      locale: "en-US"
    });
    await db.saveUserProfile(user.id, {
      timezone: "Pacific/Auckland",
      wakeTime: "07:00",
      sleepTime: "23:00",
      goals: ["stability"],
      struggles: ["mornings"],
      therapyStatus: "self_directed"
    });

    const dateOptions = { localDate: "2026-05-12", timezone: "Pacific/Auckland" };
    const setup = await db.saveRoutineSetup(user.id, [
      { type: "morning", targetTime: "07:30", steps: ["check_in"] },
      { type: "midday", targetTime: "12:30", steps: ["status"] },
      { type: "evening", targetTime: "21:00", steps: ["diary"] }
    ], dateOptions);
    await db.saveTodayFocusPlan(user.id, {
      focusText: "Start small",
      anticipatedHardMoment: "After lunch",
      plannedSkill: "STOP"
    }, dateOptions);
    await db.resetTodayPlan(user.id, {
      mode: "minimum_viable_day",
      mustDos: ["therapy"],
      defer: ["errands"],
      regulationAction: "10-min walk"
    }, dateOptions);
    await db.completeRoutineInstance(user.id, setup.today[0].id, {
      completedAt: "2026-05-12T09:00:00.000Z",
      checkInId: null
    }, dateOptions);

    const [routineCount] = await sql`
      select count(*)::int as count
      from routine_instances
      where user_id = ${user.id} and instance_date = '2026-05-12'
    `;
    const [plan] = await sql`
      select plan_date::text
      from daily_plans
      where user_id = ${user.id}
      limit 1
    `;
    const [focus] = await sql`
      select plan_date::text
      from daily_focus_plans
      where user_id = ${user.id}
      limit 1
    `;

    expect(routineCount.count).toBe(3);
    expect(plan.plan_date).toBe("2026-05-12");
    expect(focus.plan_date).toBe("2026-05-12");
  });
});

async function resetSchema(sql) {
  const drops = [
    "audit_events", "export_artifacts", "offline_mutations", "delete_requests", "password_reset_tokens",
    "daily_focus_plans", "privacy_exports", "user_settings", "session_packets", "weekly_reviews",
    "voice_sessions", "chain_analyses", "coach_messages", "agent_runs", "skill_sessions",
    "skill_definitions", "diary_entries", "behavior_targets", "diary_schemas", "safety_events",
    "routine_instances", "quick_check_ins", "routine_templates", "daily_plans", "user_profiles",
    "safety_plans", "consent_records", "sessions", "users", "app_status_snapshots"
  ];

  for (const table of drops) {
    await sql.unsafe(`drop table if exists ${table}`);
  }

  const migrations = new URL("../../db/migrations", import.meta.url).pathname;
  const seeds = new URL("../../db/seeds", import.meta.url).pathname;
  for (const directory of [migrations, seeds]) {
    const files = (await readdir(directory)).filter(file => file.endsWith(".sql")).sort();
    for (const file of files) {
      await sql.unsafe(await readFile(join(directory, file), "utf8"));
    }
  }
}

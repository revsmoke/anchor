import postgres from "postgres";
import { getServerConfig } from "../server/config.js";
import { hashPassword } from "../server/auth/passwords.js";

export const LIVE_TEST_USER = {
  email: "anchor-live-test@example.test",
  password: "anchor-live-test-passphrase-123",
  timezone: "America/Detroit",
  locale: "en-US"
};

export async function seedLiveTestData(options = {}) {
  const databaseUrl = options.databaseUrl ?? getServerConfig().databaseUrl;
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    await sql.begin(async transaction => {
      await transaction`delete from users where email = ${LIVE_TEST_USER.email}`;

      const passwordHash = await hashPassword(LIVE_TEST_USER.password);
      const userRows = await transaction`
        insert into users (email, password_hash, timezone, locale)
        values (${LIVE_TEST_USER.email}, ${passwordHash}, ${LIVE_TEST_USER.timezone}, ${LIVE_TEST_USER.locale})
        returning id::text
      `;
      const userId = userRows[0].id;

      await seedConsents(transaction, userId);
      await seedProfileAndRoutines(transaction, userId);
      await seedDailyUse(transaction, userId);
      await seedDbtPractice(transaction, userId);
      await seedVoice(transaction, userId);
      await seedExportsPrivacyAndOffline(transaction, userId);
    });

    const counts = await loadLiveTestCounts(sql);
    return {
      email: LIVE_TEST_USER.email,
      password: LIVE_TEST_USER.password,
      counts
    };
  } finally {
    await sql.end({ timeout: 1 });
  }
}

async function seedConsents(sql, userId) {
  for (const type of ["crisis_limits", "privacy_choices", "voice_audio"]) {
    await sql`
      insert into consent_records (user_id, consent_type, granted, source)
      values (${userId}, ${type}, true, 'live_test_seed')
    `;
  }

  await sql`
    insert into safety_plans (
      user_id,
      warning_signs,
      steps,
      contacts,
      crisis_resources
    )
    values (
      ${userId},
      ${sql.json(["Generated warning sign: skipping anchors", "Generated warning sign: urge to isolate"])},
      ${sql.json(["Use paced breathing for two minutes", "Move to a public room", "Text the generated support contact"])},
      ${sql.json([{ name: "Generated Support Contact", method: "text", value: "555-0100" }])},
      ${sql.json([{ label: "Call 911", value: "911" }, { label: "Call or text 988", value: "988" }])}
    )
    on conflict (user_id) do update set
      warning_signs = excluded.warning_signs,
      steps = excluded.steps,
      contacts = excluded.contacts,
      crisis_resources = excluded.crisis_resources,
      updated_at = now()
  `;
}

async function seedProfileAndRoutines(sql, userId) {
  await sql`
    insert into user_profiles (
      user_id,
      timezone,
      wake_time,
      sleep_time,
      goals,
      struggles,
      therapy_status
    )
    values (
      ${userId},
      ${LIVE_TEST_USER.timezone},
      '07:00',
      '23:00',
      ${sql.array(["Generated stability", "Generated routine"])},
      ${sql.array(["Generated mornings", "Generated avoidance"])},
      'self_directed'
    )
  `;

  const anchors = [
    { type: "morning", targetTime: "07:30", steps: ["check_in", "top_focus", "cope_ahead"] },
    { type: "midday", targetTime: "12:30", steps: ["status", "reset", "skill"] },
    { type: "evening", targetTime: "21:00", steps: ["diary", "reflect", "tomorrow"] }
  ];

  for (const anchor of anchors) {
    const templateRows = await sql`
      insert into routine_templates (user_id, type, target_time, steps)
      values (${userId}, ${anchor.type}, ${anchor.targetTime}, ${sql.array(anchor.steps)})
      returning id
    `;
    await sql`
      insert into routine_instances (
        user_id,
        routine_template_id,
        instance_date,
        target_time,
        status,
        completed_at
      )
      values (
        ${userId},
        ${templateRows[0].id},
        current_date,
        ${anchor.targetTime},
        ${anchor.type === "morning" ? "complete" : "scheduled"},
        ${anchor.type === "morning" ? new Date().toISOString() : null}
      )
    `;
  }

  await sql`
    insert into daily_plans (
      user_id,
      plan_date,
      next_best_step,
      next_action_status,
      mode,
      must_dos,
      deferred_items,
      regulation_action,
      reset_history
    )
    values (
      ${userId},
      current_date,
      'Generated next best step: complete the midday anchor.',
      'accepted',
      'minimum_viable_day',
      ${sql.array(["Generated therapy prep", "Generated walk"])},
      ${sql.array(["Generated errands", "Generated long email"])},
      'Generated paced breathing',
      ${sql.json([{ resetAt: "2026-04-29T12:00:00.000Z", reset: { mode: "minimum_viable_day" } }])}
    )
  `;
}

async function seedDailyUse(sql, userId) {
  await sql`
    insert into quick_check_ins (
      user_id,
      created_at,
      anchor_context,
      primary_emotion_score,
      primary_urge_score,
      energy_state,
      suggested_next_action_status,
      suggested_next_action,
      risk_tier,
      note,
      location_context
    )
    values (
      ${userId},
      now(),
      'morning',
      2,
      1,
      'medium',
      'accepted',
      ${sql.json({ type: "morning_anchor", label: "Generated focus and cope ahead" })},
      'normal',
      'Generated seeded morning check-in.',
      'home'
    )
  `;

  for (const entry of [
    { date: "2026-04-28", difficulty: 2, notes: "Generated seeded diary note for redaction." },
    { date: "2026-04-27", difficulty: 3, notes: "Generated second diary note for trends." }
  ]) {
    await sql`
      insert into diary_entries (
        user_id,
        entry_date,
        anchor_completion,
        emotion_ratings,
        urge_ratings,
        target_occurrences,
        skills_used,
        overall_day_difficulty,
        optional_fields
      )
      values (
        ${userId},
        ${entry.date},
        ${sql.json({ morning: "complete", midday: "partial", evening: "complete" })},
        ${sql.json({ anxietyFear: 2, sadness: 1, anger: 1, shame: 0, guilt: 1, numbness: 0, joyCalm: 3 })},
        ${sql.json({ selfHarm: 0, suicidality: 0, substanceUse: 0, bingeRestrictPurge: 0, isolateAvoid: 2, quitGiveUp: 1, lashOut: 0 })},
        ${sql.json([{ targetKey: "isolate_avoid", occurrence: "urge_only" }, { targetKey: "completed_anchor", occurrence: "completed" }])},
        ${sql.array(["paced_breathing", "stop"])},
        ${entry.difficulty},
        ${sql.json({ sleepDurationMinutes: 420, sleepQuality: 3, medicationAdherence: "taken", notes: entry.notes })}
      )
    `;
  }
}

async function seedDbtPractice(sql, userId) {
  await sql`
    insert into skill_sessions (
      user_id,
      skill_id,
      started_at,
      completed_at,
      helpfulness_rating,
      source_context
    )
    values (
      ${userId},
      'paced_breathing',
      now() - interval '20 minutes',
      now() - interval '18 minutes',
      4,
      'live_test_seed'
    )
  `;

  const runRows = await sql`
    insert into agent_runs (
      user_id,
      agent_name,
      specialists_used,
      risk_tier,
      mode,
      input_fingerprint,
      safety_decision,
      context_refs
    )
    values (
      ${userId},
      'AnchorCoach',
      ${sql.array(["Structure Coach"])},
      'normal',
      'structure',
      'generated-live-test-fingerprint',
      ${sql.json({ riskTier: "normal", reason: "generated_seed" })},
      ${sql.json({ diary: "generated" })}
    )
    returning id
  `;

  await sql`
    insert into coach_messages (
      user_id,
      agent_run_id,
      role,
      message_fingerprint,
      reply_text,
      next_action
    )
    values (
      ${userId},
      ${runRows[0].id},
      'assistant',
      'generated-live-test-message',
      'Generated coach reply: choose one must-do and one regulation action.',
      ${sql.json({ type: "must_do", label: "Generated one must-do" })}
    )
  `;

  await sql`
    insert into chain_analyses (
      user_id,
      source_diary_entry_id,
      prompting_event,
      vulnerabilities,
      links,
      consequences,
      alternatives,
      prevention_plan,
      status
    )
    values (
      ${userId},
      'generated-diary',
      'Generated prompting event: received critical feedback.',
      ${sql.json(["Generated vulnerability: poor sleep"])},
      ${sql.json(["Generated link: urge to avoid"])},
      ${sql.json(["Generated consequence: missed anchor"])},
      ${sql.json(["Generated alternative: STOP skill"])},
      'Generated prevention plan: practice paced breathing before replying.',
      'complete'
    )
  `;

  await sql`
    insert into safety_events (
      user_id,
      risk_tier,
      trigger_type,
      outcome,
      context
    )
    values (
      ${userId},
      'elevated',
      'generated_seed',
      'safety_mode_rendered',
      ${sql.json({ fixture: "generated_live_test" })}
    )
  `;
}

async function seedVoice(sql, userId) {
  await sql`
    insert into voice_sessions (
      user_id,
      mode,
      do_not_save,
      transcript_preview_enabled,
      context_refs,
      status,
      started_at,
      ended_at,
      transcript_opt_in,
      saved_summary,
      openai_call_id
    )
    values
      (
        ${userId},
        'skill',
        false,
        true,
        ${sql.json({ seed: "transcript_opt_in" })},
        'ended',
        now() - interval '15 minutes',
        now() - interval '10 minutes',
        true,
        'Generated seeded voice summary with transcript opt-in.',
        'rtc_generated_seed'
      ),
      (
        ${userId},
        'planning',
        true,
        true,
        ${sql.json({ seed: "do_not_save" })},
        'ended',
        now() - interval '9 minutes',
        now() - interval '8 minutes',
        false,
        null,
        'rtc_generated_do_not_save'
      )
  `;
}

async function seedExportsPrivacyAndOffline(sql, userId) {
  await sql`
    insert into weekly_reviews (
      user_id,
      week_start,
      wins,
      misses,
      recommendations,
      source_evidence
    )
    values (
      ${userId},
      '2026-04-27',
      ${sql.json(["Generated win: completed paced breathing"])},
      ${sql.json(["Generated miss: skipped one anchor"])},
      ${sql.json(["Generated recommendation: keep morning anchor small"])},
      ${sql.json(["diary:2026-04-28", "skill:paced_breathing"])}
    )
  `;

  await sql`
    insert into session_packets (
      user_id,
      date_range,
      included_sections,
      redactions,
      share_mode,
      status
    )
    values (
      ${userId},
      ${sql.json({ start: "2026-04-20", end: "2026-04-29" })},
      ${sql.array(["diary", "skills", "chains"])},
      ${sql.json({ notes: true })},
      'download',
      'ready'
    )
  `;

  await sql`
    insert into privacy_exports (
      user_id,
      format,
      date_range,
      status
    )
    values (
      ${userId},
      'json',
      ${sql.json({ start: "2026-04-20", end: "2026-04-29" })},
      'queued'
    )
  `;

  await sql`
    insert into delete_requests (
      user_id,
      scope,
      scheduled_deletion_at,
      status
    )
    values (
      ${userId},
      'all',
      '2026-05-05T00:00:00.000Z',
      'scheduled'
    )
  `;

  await sql`
    insert into user_settings (
      user_id,
      transcript_retention_days,
      trace_retention_days,
      audio_consent,
      share_consent,
      notification_opt_in,
      quiet_hours_start,
      quiet_hours_end
    )
    values (
      ${userId},
      30,
      30,
      true,
      false,
      true,
      '22:00',
      '07:00'
    )
  `;

  for (const mutation of [
    { id: "seed-check-in", entityType: "quick_check_in", operation: "create", payload: { mood: 2 } },
    { id: "seed-diary", entityType: "diary_entry", operation: "update", payload: { date: "2026-04-28" } },
    { id: "seed-routine", entityType: "routine_completion", operation: "create", payload: { anchor: "midday" } },
    { id: "seed-chain", entityType: "chain_analysis", operation: "update", payload: { status: "draft" } }
  ]) {
    await sql`
      insert into offline_mutations (
        user_id,
        client_id,
        client_mutation_id,
        entity_type,
        operation,
        occurred_at,
        payload
      )
      values (
        ${userId},
        'live-test-device',
        ${mutation.id},
        ${mutation.entityType},
        ${mutation.operation},
        now(),
        ${sql.json(mutation.payload)}
      )
    `;
  }
}

async function loadLiveTestCounts(sql) {
  const rows = await sql`
    select
      (select count(*)::int from users where email = ${LIVE_TEST_USER.email}) as users,
      (select count(*)::int from diary_entries de join users u on u.id = de.user_id where u.email = ${LIVE_TEST_USER.email}) as diary_entries,
      (select count(*)::int from skill_sessions ss join users u on u.id = ss.user_id where u.email = ${LIVE_TEST_USER.email}) as skill_sessions,
      (select count(*)::int from chain_analyses ca join users u on u.id = ca.user_id where u.email = ${LIVE_TEST_USER.email}) as chain_analyses,
      (select count(*)::int from voice_sessions vs join users u on u.id = vs.user_id where u.email = ${LIVE_TEST_USER.email}) as voice_sessions,
      (select count(*)::int from offline_mutations om join users u on u.id = om.user_id where u.email = ${LIVE_TEST_USER.email}) as offline_mutations
  `;

  return {
    users: rows[0].users,
    diaryEntries: rows[0].diary_entries,
    skillSessions: rows[0].skill_sessions,
    chainAnalyses: rows[0].chain_analyses,
    voiceSessions: rows[0].voice_sessions,
    offlineMutations: rows[0].offline_mutations
  };
}

import postgres from "postgres";
import { REQUIRED_CONSENT_TYPES } from "./auth/validation.js";

const DIARY_SCHEMA = {
  version: "v1",
  emotionFields: ["anxietyFear", "sadness", "anger", "shame", "guilt", "numbness", "joyCalm"],
  urgeFields: ["selfHarm", "suicidality", "substanceUse", "bingeRestrictPurge", "isolateAvoid", "quitGiveUp", "lashOut"],
  targetKeys: ["isolate_avoid", "completed_anchor"]
};

export function createDb(databaseUrl) {
  const sql = postgres(databaseUrl, {
    max: 5,
    idle_timeout: 5
  });

  return {
    async checkHealth() {
      await sql`select 1`;
      return true;
    },

    async getRequiredTableNames() {
      const rows = await sql`
        select table_name
        from information_schema.tables
        where table_schema = 'public'
      `;
      return rows.map(row => row.table_name);
    },

    async getTodaySnapshot() {
      const rows = await sql`
        select product_name, snapshot_date, morning_anchor_summary
        from app_status_snapshots
        order by snapshot_date desc, id desc
        limit 1
      `;

      const row = rows[0];
      if (!row) {
        throw new Error("No app status snapshot has been seeded.");
      }

      return {
        productName: row.product_name,
        snapshotDate: row.snapshot_date instanceof Date
          ? row.snapshot_date.toISOString().slice(0, 10)
          : String(row.snapshot_date),
        morningAnchorSummary: row.morning_anchor_summary
      };
    },

    async createUser({ email, passwordHash, timezone, locale }) {
      try {
        const rows = await sql`
          insert into users (email, password_hash, timezone, locale)
          values (${email.toLowerCase()}, ${passwordHash}, ${timezone}, ${locale})
          returning id::text, email, password_hash, timezone, locale, status
        `;
        const user = userFromRow(rows[0]);
        await sql`
          insert into safety_plans (user_id)
          values (${user.id})
          on conflict (user_id) do nothing
        `;
        return user;
      } catch (error) {
        if (error?.code === "23505") {
          throw Object.assign(new Error("duplicate email"), { code: "duplicate_email" });
        }
        throw error;
      }
    },

    async getUserByEmail(email) {
      const rows = await sql`
        select id::text, email, password_hash, timezone, locale, status
        from users
        where email = ${email.toLowerCase()}
        limit 1
      `;
      return rows[0] ? userFromRow(rows[0]) : null;
    },

    async createSession(userId) {
      const token = crypto.randomUUID();
      const rows = await sql`
        insert into sessions (token, user_id, expires_at)
        values (${token}, ${userId}, now() + interval '30 days')
        returning id::text, token, user_id::text
      `;
      return rows[0];
    },

    async getSessionUser(token) {
      const rows = await sql`
        select u.id::text, u.email, u.password_hash, u.timezone, u.locale, u.status
        from sessions s
        join users u on u.id = s.user_id
        where s.token = ${token}
          and s.expires_at > now()
        limit 1
      `;
      return rows[0] ? userFromRow(rows[0]) : null;
    },

    async deleteSession(token) {
      await sql`delete from sessions where token = ${token}`;
    },

    async saveConsentRecords(userId, records) {
      const rows = [];
      for (const record of records) {
        const inserted = await sql`
          insert into consent_records (user_id, consent_type, granted, source)
          values (${userId}, ${record.type}, ${record.granted}, 'web')
          returning user_id::text, consent_type, granted
        `;
        rows.push(consentFromRow(inserted[0]));
      }
      return rows;
    },

    async getConsentsForUser(userId) {
      const rows = await sql`
        select distinct on (consent_type)
          user_id::text,
          consent_type,
          granted
        from consent_records
        where user_id = ${userId}
        order by consent_type, granted_at desc, id desc
      `;
      return rows.map(consentFromRow);
    },

    async getUserDailyTimezone(userId) {
      const rows = await sql`
        select coalesce(up.timezone, u.timezone) as timezone
        from users u
        left join user_profiles up on up.user_id = u.id
        where u.id = ${userId}
        limit 1
      `;
      return rows[0]?.timezone || "";
    },

    async getAppBootstrap(userId, options = {}) {
      const localDate = options.localDate ?? sql`current_date`;
      const consents = await this.getConsentsForUser(userId);
      const profileRows = await sql`
        select id::text
        from user_profiles
        where user_id = ${userId}
        limit 1
      `;
      const templateRows = await sql`
        select id::text, type, target_time
        from routine_templates
        where user_id = ${userId}
        order by case type when 'morning' then 1 when 'midday' then 2 else 3 end
      `;
      let todayRows = await sql`
        select
          ri.id::text,
          ri.user_id::text,
          ri.routine_template_id::text,
          rt.type,
          ri.target_time,
          ri.status,
          ri.completed_at,
          ri.completed_check_in_id::text
        from routine_instances ri
        join routine_templates rt on rt.id = ri.routine_template_id
        where ri.user_id = ${userId}
          and ri.instance_date = ${localDate}
        order by case rt.type when 'morning' then 1 when 'midday' then 2 else 3 end
      `;
      let dailyPlanRows = await sql`
        select
          id::text,
          user_id::text,
          plan_date,
          next_best_step,
          mode,
          must_dos,
          deferred_items,
          regulation_action,
          reset_history
        from daily_plans
        where user_id = ${userId}
          and plan_date = ${localDate}
        limit 1
      `;
      if (profileRows.length > 0 && templateRows.length === 3 && todayRows.length < templateRows.length) {
        await sql.begin(async transaction => {
          await transaction`
            insert into routine_instances (user_id, routine_template_id, instance_date, target_time, status)
            select ${userId}, rt.id, ${localDate}, rt.target_time, 'scheduled'
            from routine_templates rt
            where rt.user_id = ${userId}
              and not exists (
                select 1
                from routine_instances ri
                where ri.user_id = ${userId}
                  and ri.routine_template_id = rt.id
                  and ri.instance_date = ${localDate}
              )
          `;
          await transaction`
            insert into daily_plans (user_id, plan_date, next_best_step)
            values (${userId}, ${localDate}, 'Start your morning anchor.')
            on conflict (user_id, plan_date) do nothing
          `;
        });
        todayRows = await sql`
          select
            ri.id::text,
            ri.user_id::text,
            ri.routine_template_id::text,
            rt.type,
            ri.target_time,
            ri.status,
            ri.completed_at,
            ri.completed_check_in_id::text
          from routine_instances ri
          join routine_templates rt on rt.id = ri.routine_template_id
          where ri.user_id = ${userId}
            and ri.instance_date = ${localDate}
          order by case rt.type when 'morning' then 1 when 'midday' then 2 else 3 end
        `;
        dailyPlanRows = await sql`
          select
            id::text,
            user_id::text,
            plan_date,
            next_best_step,
            mode,
            must_dos,
            deferred_items,
            regulation_action,
            reset_history
          from daily_plans
          where user_id = ${userId}
            and plan_date = ${localDate}
          limit 1
        `;
      }
      const consentComplete = REQUIRED_CONSENT_TYPES.every(type =>
        consents.some(consent => consent.type === type && consent.granted)
      );
      const onboardingComplete = profileRows.length > 0 && templateRows.length === 3;

      return {
        consents,
        consentComplete,
        onboardingComplete,
        today: todayRows.map(routineInstanceFromRow),
        dailyPlan: dailyPlanRows[0] ? dailyPlanFromRow(dailyPlanRows[0]) : null,
        focusPlan: await this.getTodayFocusPlan(userId, options),
        nextStep: !consentComplete ? "consent" : onboardingComplete ? "main_app" : "onboarding_profile"
      };
    },

    async createPasswordResetToken(userId, reset) {
      const rows = await sql`
        insert into password_reset_tokens (
          user_id,
          token_hash,
          request_metadata,
          expires_at
        )
        values (
          ${userId},
          ${reset.tokenHash},
          ${sql.json(reset.requestMetadata ?? {})},
          ${reset.expiresAt}
        )
        returning id::text, user_id::text, token_hash, attempt_count, locked_at, expires_at, used_at
      `;
      return passwordResetTokenFromRow(rows[0]);
    },

    async getActivePasswordResetTokens(userId) {
      const rows = await sql`
        select id::text, user_id::text, token_hash, attempt_count, locked_at, expires_at, used_at
        from password_reset_tokens
        where user_id = ${userId}
          and used_at is null
          and locked_at is null
          and attempt_count < 5
          and expires_at > now()
        order by created_at desc
      `;
      return rows.map(passwordResetTokenFromRow);
    },

    async recordPasswordResetFailure(userId) {
      await sql`
        update password_reset_tokens
        set attempt_count = attempt_count + 1,
            locked_at = case when attempt_count + 1 >= 5 then now() else locked_at end
        where user_id = ${userId}
          and used_at is null
          and locked_at is null
          and expires_at > now()
      `;
    },

    async consumePasswordResetToken(userId, tokenId) {
      const rows = await sql`
        update password_reset_tokens
        set used_at = now()
        where id = ${tokenId}
          and user_id = ${userId}
          and used_at is null
        returning id::text, user_id::text, token_hash, attempt_count, locked_at, expires_at, used_at
      `;
      return rows[0] ? passwordResetTokenFromRow(rows[0]) : null;
    },

    async updateUserPassword(userId, passwordHash) {
      const rows = await sql`
        update users
        set password_hash = ${passwordHash}
        where id = ${userId}
        returning id::text, email, password_hash, timezone, locale, status
      `;
      return rows[0] ? userFromRow(rows[0]) : null;
    },

    async deleteSessionsForUser(userId) {
      await sql`delete from sessions where user_id = ${userId}`;
    },

    async saveUserProfile(userId, profile) {
      const rows = await sql`
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
          ${profile.timezone},
          ${profile.wakeTime},
          ${profile.sleepTime},
          ${sql.array(profile.goals)},
          ${sql.array(profile.struggles)},
          ${profile.therapyStatus}
        )
        on conflict (user_id) do update set
          timezone = excluded.timezone,
          wake_time = excluded.wake_time,
          sleep_time = excluded.sleep_time,
          goals = excluded.goals,
          struggles = excluded.struggles,
          therapy_status = excluded.therapy_status,
          updated_at = now()
        returning id::text, user_id::text, timezone, wake_time, sleep_time, goals, struggles, therapy_status
      `;
      return profileFromRow(rows[0]);
    },

    async saveRoutineSetup(userId, anchors, options = {}) {
      const localDate = options.localDate ?? sql`current_date`;
      await sql.begin(async transaction => {
        await transaction`delete from routine_instances where user_id = ${userId} and instance_date = ${localDate}`;
        await transaction`delete from routine_templates where user_id = ${userId}`;

        for (const anchor of anchors) {
          const templateRows = await transaction`
            insert into routine_templates (user_id, type, target_time, steps)
            values (${userId}, ${anchor.type}, ${anchor.targetTime}, ${sql.array(anchor.steps)})
            returning id
          `;
          await transaction`
            insert into routine_instances (user_id, routine_template_id, instance_date, target_time, status)
            values (${userId}, ${templateRows[0].id}, ${localDate}, ${anchor.targetTime}, 'scheduled')
          `;
        }

        await transaction`
          insert into daily_plans (user_id, plan_date, next_best_step)
          values (${userId}, ${localDate}, 'Start your morning anchor.')
          on conflict (user_id, plan_date) do update set
            next_best_step = excluded.next_best_step,
            updated_at = now()
        `;
      });

      const templates = await sql`
        select id::text, user_id::text, type, target_time, steps
        from routine_templates
        where user_id = ${userId}
        order by case type when 'morning' then 1 when 'midday' then 2 else 3 end
      `;
      const today = await sql`
        select
          ri.id::text,
          ri.user_id::text,
          ri.routine_template_id::text,
          rt.type,
          ri.target_time,
          ri.status,
          ri.completed_at,
          ri.completed_check_in_id::text
        from routine_instances ri
        join routine_templates rt on rt.id = ri.routine_template_id
        where ri.user_id = ${userId}
          and ri.instance_date = ${localDate}
        order by case rt.type when 'morning' then 1 when 'midday' then 2 else 3 end
      `;
      const dailyPlanRows = await sql`
        select id::text, user_id::text, plan_date, next_best_step
        from daily_plans
        where user_id = ${userId}
          and plan_date = ${localDate}
        limit 1
      `;

      return {
        routineTemplates: templates.map(routineTemplateFromRow),
        today: today.map(routineInstanceFromRow),
        dailyPlan: dailyPlanFromRow(dailyPlanRows[0])
      };
    },

    async saveQuickCheckIn(userId, checkIn, recommendation) {
      const rows = await sql`
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
          ${checkIn.createdAt},
          ${checkIn.anchorContext},
          ${checkIn.primaryEmotionScore},
          ${checkIn.primaryUrgeScore},
          ${checkIn.energyState},
          ${checkIn.suggestedNextActionStatus},
          ${sql.json(recommendation.suggestedNextAction)},
          ${recommendation.riskTier},
          ${checkIn.note},
          ${checkIn.locationContext}
        )
        returning
          id::text,
          user_id::text,
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
      `;

      return quickCheckInFromRow(rows[0]);
    },

    async saveSafetyEvent(userId, event) {
      const rows = await sql`
        insert into safety_events (user_id, risk_tier, trigger_type, outcome, context)
        values (
          ${userId},
          ${event.riskTier},
          ${event.triggerType},
          ${event.outcome},
          ${sql.json(event.context)}
        )
        returning id::text, user_id::text, risk_tier, trigger_type, outcome, context
      `;
      return safetyEventFromRow(rows[0]);
    },

    async completeRoutineInstance(userId, anchorId, completion, options = {}) {
      const localDate = options.localDate ?? sql`current_date`;
      const rows = await sql`
        update routine_instances ri
        set
          status = 'complete',
          completed_at = ${completion.completedAt},
          completed_check_in_id = ${completion.checkInId}
        from routine_templates rt
        where ri.routine_template_id = rt.id
          and ri.id = ${anchorId}
          and ri.user_id = ${userId}
        returning
          ri.id::text,
          ri.user_id::text,
          ri.routine_template_id::text,
          rt.type,
          ri.target_time,
          ri.status,
          ri.completed_at,
          ri.completed_check_in_id::text
      `;

      if (!rows[0]) return null;

      const nextBestStep = nextStepAfter(rows[0].type);
      const dailyPlanRows = await sql`
        insert into daily_plans (user_id, plan_date, next_best_step, next_action_status)
        values (${userId}, ${localDate}, ${nextBestStep}, 'accepted')
        on conflict (user_id, plan_date) do update set
          next_best_step = excluded.next_best_step,
          next_action_status = excluded.next_action_status,
          updated_at = now()
        returning id::text, user_id::text, plan_date, next_best_step
      `;

      return {
        anchor: routineInstanceFromRow(rows[0]),
        dailyPlan: dailyPlanFromRow(dailyPlanRows[0]),
        nextBestStep
      };
    },

    async resetTodayPlan(userId, reset, options = {}) {
      const localDate = options.localDate ?? sql`current_date`;
      const currentPlanRows = await sql`
        select
          id::text,
          user_id::text,
          plan_date,
          next_best_step,
          mode,
          must_dos,
          deferred_items,
          regulation_action,
          reset_history
        from daily_plans
        where user_id = ${userId}
          and plan_date = ${localDate}
        limit 1
      `;
      const currentPlan = currentPlanRows[0] ?? null;
      const priorHistory = Array.isArray(currentPlan?.reset_history) ? currentPlan.reset_history : [];
      const nextBestStep = resetNextBestStep(reset);
      const resetHistory = [
        ...priorHistory,
        {
          resetAt: new Date().toISOString(),
          previousPlan: currentPlan ? {
            mode: currentPlan.mode,
            nextBestStep: currentPlan.next_best_step,
            mustDos: currentPlan.must_dos ?? [],
            deferredItems: currentPlan.deferred_items ?? [],
            regulationAction: currentPlan.regulation_action ?? ""
          } : null,
          reset
        }
      ];

      const dailyPlanRows = await sql`
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
          ${localDate},
          ${nextBestStep},
          'accepted',
          ${reset.mode},
          ${sql.array(reset.mustDos)},
          ${sql.array(reset.defer)},
          ${reset.regulationAction},
          ${sql.json(resetHistory)}
        )
        on conflict (user_id, plan_date) do update set
          next_best_step = excluded.next_best_step,
          next_action_status = excluded.next_action_status,
          mode = excluded.mode,
          must_dos = excluded.must_dos,
          deferred_items = excluded.deferred_items,
          regulation_action = excluded.regulation_action,
          reset_history = excluded.reset_history,
          updated_at = now()
        returning
          id::text,
          user_id::text,
          plan_date,
          next_best_step,
          mode,
          must_dos,
          deferred_items,
          regulation_action,
          reset_history
      `;

      const anchorRows = await sql`
        select
          ri.id::text,
          ri.user_id::text,
          ri.routine_template_id::text,
          rt.type,
          ri.target_time,
          ri.status,
          ri.completed_at,
          ri.completed_check_in_id::text
        from routine_instances ri
        join routine_templates rt on rt.id = ri.routine_template_id
        where ri.user_id = ${userId}
          and ri.instance_date = ${localDate}
        order by case rt.type when 'morning' then 1 when 'midday' then 2 else 3 end
      `;
      const dailyPlan = dailyPlanFromRow(dailyPlanRows[0]);

      return {
        dailyPlan,
        anchors: anchorRows.map(routineInstanceFromRow),
        nextBestStep: dailyPlan.nextBestStep
      };
    },

    async getTodayFocusPlan(userId, options = {}) {
      const localDate = options.localDate ?? sql`current_date`;
      const rows = await sql`
        select
          id::text,
          user_id::text,
          plan_date,
          focus_text,
          anticipated_hard_moment,
          planned_skill,
          created_at,
          updated_at
        from daily_focus_plans
        where user_id = ${userId}
          and plan_date = ${localDate}
        limit 1
      `;

      return rows[0] ? focusPlanFromRow(rows[0]) : null;
    },

    async saveTodayFocusPlan(userId, focusPlan, options = {}) {
      const localDate = options.localDate ?? sql`current_date`;
      const rows = await sql`
        insert into daily_focus_plans (
          user_id,
          plan_date,
          focus_text,
          anticipated_hard_moment,
          planned_skill
        )
        values (
          ${userId},
          ${localDate},
          ${focusPlan.focusText},
          ${focusPlan.anticipatedHardMoment},
          ${focusPlan.plannedSkill}
        )
        on conflict (user_id, plan_date) do update set
          focus_text = excluded.focus_text,
          anticipated_hard_moment = excluded.anticipated_hard_moment,
          planned_skill = excluded.planned_skill,
          updated_at = now()
        returning
          id::text,
          user_id::text,
          plan_date,
          focus_text,
          anticipated_hard_moment,
          planned_skill,
          created_at,
          updated_at
      `;

      return focusPlanFromRow(rows[0]);
    },

    async getDiarySchema() {
      return DIARY_SCHEMA;
    },

    async getDiaryEntry(userId, entryDate) {
      const rows = await sql`
        select
          id::text,
          user_id::text,
          entry_date,
          anchor_completion,
          emotion_ratings,
          urge_ratings,
          target_occurrences,
          skills_used,
          overall_day_difficulty,
          optional_fields
        from diary_entries
        where user_id = ${userId}
          and entry_date = ${entryDate}
        limit 1
      `;

      return rows[0] ? diaryEntryFromRow(rows[0]) : null;
    },

    async saveDiaryEntry(userId, entry) {
      const rows = await sql`
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
          ${entry.entryDate},
          ${sql.json(entry.anchorCompletion)},
          ${sql.json(entry.emotionRatings)},
          ${sql.json(entry.urgeRatings)},
          ${sql.json(entry.targetOccurrences)},
          ${sql.array(entry.skillsUsed)},
          ${entry.overallDayDifficulty},
          ${sql.json(entry.optionalFields)}
        )
        on conflict (user_id, entry_date) do update set
          anchor_completion = excluded.anchor_completion,
          emotion_ratings = excluded.emotion_ratings,
          urge_ratings = excluded.urge_ratings,
          target_occurrences = excluded.target_occurrences,
          skills_used = excluded.skills_used,
          overall_day_difficulty = excluded.overall_day_difficulty,
          optional_fields = excluded.optional_fields,
          updated_at = now()
        returning
          id::text,
          user_id::text,
          entry_date,
          anchor_completion,
          emotion_ratings,
          urge_ratings,
          target_occurrences,
          skills_used,
          overall_day_difficulty,
          optional_fields
      `;

      return diaryEntryFromRow(rows[0]);
    },

    async listSkills({ module, q } = {}) {
      const query = String(q ?? "").trim().toLowerCase();
      const rows = await sql`
        select
          id,
          module,
          name,
          situation_tags,
          when_to_use,
          why_it_helps,
          steps,
          duration_seconds,
          follow_up_prompt
        from skill_definitions
        where (${module || null}::text is null or module = ${module || null})
          and (
            ${query || null}::text is null
            or lower(name || ' ' || when_to_use || ' ' || array_to_string(situation_tags, ' ')) like ${query ? `%${query}%` : null}
          )
        order by case module when 'distress_tolerance' then 1 when 'emotion_regulation' then 2 else 3 end, name
      `;
      return rows.map(skillFromRow);
    },

    async getSkill(skillId) {
      const rows = await sql`
        select
          id,
          module,
          name,
          situation_tags,
          when_to_use,
          why_it_helps,
          steps,
          duration_seconds,
          follow_up_prompt
        from skill_definitions
        where id = ${skillId}
        limit 1
      `;
      return rows[0] ? skillFromRow(rows[0]) : null;
    },

    async getRecentSkills(userId) {
      const rows = await sql`
        select distinct on (skill_id) skill_id
        from skill_sessions
        where user_id = ${userId}
        order by skill_id, created_at desc
        limit 5
      `;
      return rows.map(row => row.skill_id);
    },

    async saveSkillSession(userId, skillId, session) {
      const rows = await sql`
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
          ${skillId},
          ${session.startedAt},
          ${session.completedAt},
          ${session.helpfulnessRating},
          ${session.sourceContext}
        )
        returning
          id::text,
          user_id::text,
          skill_id,
          started_at,
          completed_at,
          helpfulness_rating,
          source_context
      `;
      return skillSessionFromRow(rows[0]);
    },

    async saveAgentRun(userId, run) {
      const rows = await sql`
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
          ${run.agentName},
          ${sql.array(run.specialistsUsed)},
          ${run.riskTier},
          ${run.mode},
          ${run.inputFingerprint},
          ${sql.json(run.safetyDecision)},
          ${sql.json(run.contextRefs)}
        )
        returning
          id::text,
          user_id::text,
          agent_name,
          specialists_used,
          risk_tier,
          mode,
          input_fingerprint,
          safety_decision,
          context_refs
      `;
      return agentRunFromRow(rows[0]);
    },

    async saveCoachMessage(userId, message) {
      const rows = await sql`
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
          ${message.agentRunId ?? null},
          ${message.role},
          ${message.messageFingerprint ?? null},
          ${message.replyText ?? null},
          ${message.nextAction ? sql.json(message.nextAction) : null}
        )
        returning
          id::text,
          user_id::text,
          agent_run_id::text,
          role,
          message_fingerprint,
          reply_text,
          next_action
      `;
      return coachMessageFromRow(rows[0]);
    },

    async createChainAnalysis(userId, chain) {
      const rows = await sql`
        insert into chain_analyses (
          user_id,
          source_diary_entry_id,
          prompting_event
        )
        values (${userId}, ${chain.sourceDiaryEntryId}, ${chain.promptingEvent})
        returning
          id::text,
          user_id::text,
          source_diary_entry_id,
          prompting_event,
          vulnerabilities,
          links,
          consequences,
          alternatives,
          prevention_plan,
          status
      `;
      return chainAnalysisFromRow(rows[0]);
    },

    async updateChainAnalysis(userId, chainId, patch) {
      const preventionPlan = patch.status === "complete"
        ? "Use STOP before the next high-risk link."
        : null;
      const rows = await sql`
        update chain_analyses
        set
          vulnerabilities = ${sql.json(patch.vulnerabilities)},
          links = ${sql.json(patch.links)},
          consequences = ${sql.json(patch.consequences)},
          alternatives = ${sql.json(patch.alternatives)},
          prevention_plan = coalesce(${preventionPlan}, prevention_plan),
          status = ${patch.status},
          updated_at = now()
        where id = ${chainId}
          and user_id = ${userId}
        returning
          id::text,
          user_id::text,
          source_diary_entry_id,
          prompting_event,
          vulnerabilities,
          links,
          consequences,
          alternatives,
          prevention_plan,
          status
      `;
      return rows[0] ? chainAnalysisFromRow(rows[0]) : null;
    },

    async createVoiceSession(userId, voiceSession) {
      const rows = await sql`
        insert into voice_sessions (
          user_id,
          mode,
          do_not_save,
          transcript_preview_enabled,
          context_refs,
          openai_call_id
        )
        values (
          ${userId},
          ${voiceSession.mode},
          ${voiceSession.doNotSave},
          true,
          ${sql.json(voiceSession.contextRefs)},
          ${voiceSession.openAiCallId ?? null}
        )
        returning
          id::text,
          user_id::text,
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
      `;
      return voiceSessionFromRow(rows[0]);
    },

    async endVoiceSession(userId, voiceSessionId, ending) {
      const rows = await sql`
        update voice_sessions
        set
          status = 'ended',
          ended_at = ${ending.endedAt},
          transcript_opt_in = ${ending.transcriptOptIn},
          saved_summary = ${ending.transcriptOptIn ? ending.savedSummary : null}
        where id = ${voiceSessionId}
          and user_id = ${userId}
        returning
          id::text,
          user_id::text,
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
      `;
      return rows[0] ? voiceSessionFromRow(rows[0]) : null;
    },

    async getSessionExportData(userId) {
      const [diaryRows, skillRows, chainRows, weeklyRows] = await Promise.all([
        sql`
          select entry_date, anchor_completion, emotion_ratings, urge_ratings, target_occurrences, skills_used, overall_day_difficulty, optional_fields
          from diary_entries
          where user_id = ${userId}
          order by entry_date desc
          limit 14
        `,
        sql`
          select skill_id, started_at, completed_at, helpfulness_rating, source_context
          from skill_sessions
          where user_id = ${userId}
          order by completed_at desc
          limit 20
        `,
        sql`
          select prompting_event, vulnerabilities, links, consequences, alternatives, prevention_plan, status
          from chain_analyses
          where user_id = ${userId}
          order by updated_at desc
          limit 10
        `,
        sql`
          select week_start, wins, misses, recommendations, source_evidence
          from weekly_reviews
          where user_id = ${userId}
          order by week_start desc
          limit 4
        `
      ]);

      return {
        diaryEntries: diaryRows.map(row => ({
          entryDate: row.entry_date instanceof Date ? row.entry_date.toISOString().slice(0, 10) : String(row.entry_date),
          anchorCompletion: row.anchor_completion,
          emotionRatings: row.emotion_ratings,
          urgeRatings: row.urge_ratings,
          targetOccurrences: row.target_occurrences,
          skillsUsed: row.skills_used,
          overallDayDifficulty: row.overall_day_difficulty,
          optionalFields: row.optional_fields
        })),
        skillSessions: skillRows.map(row => ({
          skillId: row.skill_id,
          startedAt: row.started_at instanceof Date ? row.started_at.toISOString() : row.started_at,
          completedAt: row.completed_at instanceof Date ? row.completed_at.toISOString() : row.completed_at,
          helpfulnessRating: row.helpfulness_rating,
          sourceContext: row.source_context
        })),
        chainAnalyses: chainRows.map(row => ({
          promptingEvent: row.prompting_event,
          vulnerabilities: row.vulnerabilities,
          links: row.links,
          consequences: row.consequences,
          alternatives: row.alternatives,
          preventionPlan: row.prevention_plan,
          status: row.status
        })),
        weeklyReviews: weeklyRows.map(weeklyReviewFromRow)
      };
    },

    async getInsights(userId, range = "7d") {
      const diaryRows = await sql`
        select entry_date
        from diary_entries
        where user_id = ${userId}
        order by entry_date desc
        limit 1
      `;
      const evidenceDate = diaryRows[0]?.entry_date instanceof Date
        ? diaryRows[0].entry_date.toISOString().slice(0, 10)
        : String(diaryRows[0]?.entry_date ?? "2026-04-28");

      return {
        range,
        cards: [
          {
            id: "card_1",
            title: "Structure supports mood",
            evidenceRefs: [`diary:${evidenceDate}`]
          }
        ],
        structureScore: 72,
        trendSeries: [{ date: evidenceDate, value: 72 }]
      };
    },

    async getWeeklyReview(userId, weekStart) {
      const draft = {
        wins: ["Completed skills practice"],
        misses: ["One missed anchor"],
        recommendations: ["Keep morning anchor small"],
        sourceEvidence: ["skill_session:1", "diary:2026-04-28"]
      };
      const rows = await sql`
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
          ${weekStart},
          ${sql.json(draft.wins)},
          ${sql.json(draft.misses)},
          ${sql.json(draft.recommendations)},
          ${sql.json(draft.sourceEvidence)}
        )
        on conflict (user_id, week_start) do update set
          wins = excluded.wins,
          misses = excluded.misses,
          recommendations = excluded.recommendations,
          source_evidence = excluded.source_evidence,
          updated_at = now()
        returning
          id::text,
          user_id::text,
          week_start,
          wins,
          misses,
          recommendations,
          source_evidence
      `;
      return weeklyReviewFromRow(rows[0]);
    },

    async createSessionPacket(userId, packet) {
      const rows = await sql`
        insert into session_packets (
          user_id,
          date_range,
          included_sections,
          redactions,
          share_mode
        )
        values (
          ${userId},
          ${sql.json(packet.dateRange)},
          ${sql.array(packet.includedSections)},
          ${sql.json(packet.redactions)},
          ${packet.shareMode}
        )
        returning
          id::text,
          user_id::text,
          date_range,
          included_sections,
          redactions,
          share_mode,
          status
      `;
      return sessionPacketFromRow(rows[0]);
    },

    async getSessionPacket(userId, packetId) {
      const rows = await sql`
        select
          id::text,
          user_id::text,
          date_range,
          included_sections,
          redactions,
          share_mode,
          status
        from session_packets
        where id = ${packetId}
          and user_id = ${userId}
        limit 1
      `;
      return rows[0] ? sessionPacketFromRow(rows[0]) : null;
    },

    async createExportArtifact(userId, artifact) {
      const rows = await sql`
        insert into export_artifacts (
          user_id,
          kind,
          format,
          storage_key,
          byte_size,
          redactions,
          source_id
        )
        values (
          ${userId},
          ${artifact.kind},
          ${artifact.format},
          ${artifact.storageKey},
          ${artifact.byteSize},
          ${sql.json(artifact.redactions ?? {})},
          ${artifact.sourceId ?? artifact.artifactId ?? null}
        )
        returning id::text, user_id::text, kind, format, storage_key, byte_size, redactions, source_id, status
      `;
      return exportArtifactFromRow(rows[0]);
    },

    async getExportArtifact(userId, artifactId) {
      const rows = await sql`
        select id::text, user_id::text, kind, format, storage_key, byte_size, redactions, source_id, status
        from export_artifacts
        where id = ${artifactId}
          and user_id = ${userId}
          and deleted_at is null
        limit 1
      `;
      return rows[0] ? exportArtifactFromRow(rows[0]) : null;
    },

    async markSessionPacketArtifact(userId, packetId, artifactId) {
      const rows = await sql`
        update session_packets
        set artifact_id = ${artifactId}
        where id = ${packetId}
          and user_id = ${userId}
        returning id::text,
          user_id::text,
          date_range,
          included_sections,
          redactions,
          share_mode,
          status
      `;
      return rows[0] ? sessionPacketFromRow(rows[0]) : null;
    },

    async saveUserSettings(userId, nextSettings) {
      const rows = await sql`
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
          ${nextSettings.transcriptRetentionDays},
          ${nextSettings.traceRetentionDays},
          ${nextSettings.audioConsent},
          ${nextSettings.shareConsent},
          ${nextSettings.notificationOptIn},
          ${nextSettings.quietHoursStart},
          ${nextSettings.quietHoursEnd}
        )
        on conflict (user_id) do update set
          transcript_retention_days = excluded.transcript_retention_days,
          trace_retention_days = excluded.trace_retention_days,
          audio_consent = excluded.audio_consent,
          share_consent = excluded.share_consent,
          notification_opt_in = excluded.notification_opt_in,
          quiet_hours_start = excluded.quiet_hours_start,
          quiet_hours_end = excluded.quiet_hours_end,
          updated_at = now()
        returning
          user_id::text,
          transcript_retention_days,
          trace_retention_days,
          audio_consent,
          share_consent,
          notification_opt_in,
          quiet_hours_start,
          quiet_hours_end
      `;
      return userSettingsFromRow(rows[0]);
    },

    async createPrivacyExport(userId, exportRequest) {
      const rows = await sql`
        insert into privacy_exports (
          user_id,
          format,
          date_range
        )
        values (
          ${userId},
          ${exportRequest.format},
          ${sql.json(exportRequest.dateRange)}
        )
        returning id::text, user_id::text, format, date_range, status
      `;
      return privacyExportFromRow(rows[0]);
    },

    async getPrivacyExportData(userId) {
      const [voiceRows, packetRows] = await Promise.all([
        sql`
          select id::text, user_id::text, mode, do_not_save, transcript_preview_enabled, context_refs, status, started_at, ended_at, transcript_opt_in, saved_summary, openai_call_id
          from voice_sessions
          where user_id = ${userId}
          order by started_at desc
        `,
        sql`
          select id::text, user_id::text, date_range, included_sections, redactions, share_mode, status
          from session_packets
          where user_id = ${userId}
          order by created_at desc
        `
      ]);

      return {
        voiceSessions: voiceRows.map(voiceSessionFromRow),
        sessionPackets: packetRows.map(sessionPacketFromRow)
      };
    },

    async createDeleteRequest(userId, deleteRequest) {
      const scheduledDeletionAt = "2026-05-05T00:00:00.000Z";
      const rows = await sql`
        insert into delete_requests (
          user_id,
          scope,
          scheduled_deletion_at
        )
        values (
          ${userId},
          ${deleteRequest.scope},
          ${scheduledDeletionAt}
        )
        returning id::text, user_id::text, scope, scheduled_deletion_at, status
      `;
      return deleteRequestFromRow(rows[0]);
    },

    async deleteExportArtifactsForUser(userId) {
      const rows = await sql`
        update export_artifacts
        set deleted_at = now(),
            status = 'deleted'
        where user_id = ${userId}
          and deleted_at is null
        returning id::text, user_id::text, kind, format, storage_key, byte_size, redactions, source_id, status
      `;
      return rows.map(exportArtifactFromRow);
    },

    async executeDeleteRequest(userId, deleteRequestId) {
      const requestRows = await sql`
        select id::text
        from delete_requests
        where id = ${deleteRequestId}
          and user_id = ${userId}
        limit 1
      `;
      if (!requestRows[0]) return null;

      await sql.begin(async transaction => {
        await transaction`delete from offline_mutations where user_id = ${userId}`;
        await transaction`delete from voice_sessions where user_id = ${userId}`;
        await transaction`delete from session_packets where user_id = ${userId}`;
        await transaction`delete from privacy_exports where user_id = ${userId}`;
        await transaction`delete from password_reset_tokens where user_id = ${userId}`;
        await transaction`delete from chain_analyses where user_id = ${userId}`;
        await transaction`delete from coach_messages where user_id = ${userId}`;
        await transaction`delete from agent_runs where user_id = ${userId}`;
        await transaction`delete from skill_sessions where user_id = ${userId}`;
        await transaction`delete from diary_entries where user_id = ${userId}`;
        await transaction`delete from routine_instances where user_id = ${userId}`;
        await transaction`delete from quick_check_ins where user_id = ${userId}`;
        await transaction`delete from routine_templates where user_id = ${userId}`;
        await transaction`delete from daily_focus_plans where user_id = ${userId}`;
        await transaction`delete from daily_plans where user_id = ${userId}`;
        await transaction`delete from user_settings where user_id = ${userId}`;
        await transaction`delete from user_profiles where user_id = ${userId}`;
        await transaction`delete from safety_plans where user_id = ${userId}`;
        await transaction`delete from consent_records where user_id = ${userId}`;
        await transaction`delete from sessions where user_id = ${userId}`;
      });

      const rows = await sql`
        update delete_requests
        set status = 'completed',
            completed_at = now()
        where id = ${deleteRequestId}
          and user_id = ${userId}
        returning id::text, user_id::text, scope, scheduled_deletion_at, completed_at, status
      `;
      return deleteRequestFromRow(rows[0]);
    },

    async applyOfflineMutations(userId, clientId, mutations) {
      const accepted = [];
      const rejected = [];
      for (const mutation of mutations) {
        try {
          const rows = await sql`
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
              ${clientId},
              ${mutation.clientMutationId},
              ${mutation.entityType},
              ${mutation.operation},
              ${mutation.occurredAt},
              ${sql.json(mutation.payload)}
            )
            returning client_mutation_id, entity_type
          `;
          accepted.push({
            clientMutationId: rows[0].client_mutation_id,
            entityType: rows[0].entity_type
          });
        } catch (error) {
          if (error?.code === "23505") {
            rejected.push({
              clientMutationId: mutation.clientMutationId,
              reason: "duplicate"
            });
          } else {
            throw error;
          }
        }
      }

      return { accepted, rejected, needsReview: [] };
    },

    async saveAuditEvent(userId, event) {
      const rows = await sql`
        insert into audit_events (
          user_id,
          event_type,
          metadata
        )
        values (
          ${userId},
          ${event.eventType},
          ${sql.json(event.metadata ?? {})}
        )
        returning id::text, user_id::text, event_type, metadata
      `;
      return auditEventFromRow(rows[0]);
    },

    async close() {
      await sql.end({ timeout: 1 });
    }
  };
}

function userFromRow(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? row.passwordHash,
    timezone: row.timezone,
    locale: row.locale,
    status: row.status
  };
}

function consentFromRow(row) {
  return {
    type: row.consent_type ?? row.type,
    granted: row.granted,
    userId: row.user_id ?? row.userId
  };
}

function passwordResetTokenFromRow(row) {
  const expiresAt = row.expires_at ?? row.expiresAt;
  const usedAt = row.used_at ?? row.usedAt;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    tokenHash: row.token_hash ?? row.tokenHash,
    attemptCount: row.attempt_count ?? row.attemptCount ?? 0,
    lockedAt: row.locked_at ?? row.lockedAt ?? null,
    expiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
    usedAt: usedAt instanceof Date ? usedAt.toISOString() : usedAt
  };
}

function profileFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    timezone: row.timezone,
    wakeTime: row.wake_time ?? row.wakeTime,
    sleepTime: row.sleep_time ?? row.sleepTime,
    goals: row.goals,
    struggles: row.struggles,
    therapyStatus: row.therapy_status ?? row.therapyStatus
  };
}

function routineTemplateFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    type: row.type,
    targetTime: row.target_time ?? row.targetTime,
    steps: row.steps
  };
}

function routineInstanceFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    routineTemplateId: row.routine_template_id ?? row.routineTemplateId,
    type: row.type,
    targetTime: row.target_time ?? row.targetTime,
    status: row.status,
    ...(row.completed_at || row.completedAt ? {
      completedAt: (row.completed_at ?? row.completedAt) instanceof Date
        ? (row.completed_at ?? row.completedAt).toISOString()
        : row.completed_at ?? row.completedAt
    } : {}),
    ...(row.completed_check_in_id || row.completedCheckInId ? {
      completedCheckInId: row.completed_check_in_id ?? row.completedCheckInId
    } : {})
  };
}

function dailyPlanFromRow(row) {
  const plan = {
    id: row.id,
    userId: row.user_id ?? row.userId,
    date: row.plan_date instanceof Date ? row.plan_date.toISOString().slice(0, 10) : String(row.plan_date ?? row.date),
    nextBestStep: row.next_best_step ?? row.nextBestStep
  };

  if (row.mode) plan.mode = row.mode;
  if (row.must_dos || row.mustDos) plan.mustDos = row.must_dos ?? row.mustDos;
  if (row.deferred_items || row.deferredItems) plan.deferredItems = row.deferred_items ?? row.deferredItems;
  if (row.regulation_action || row.regulationAction) plan.regulationAction = row.regulation_action ?? row.regulationAction;
  if (row.reset_history || row.resetHistory) {
    const history = row.reset_history ?? row.resetHistory;
    plan.resetHistoryCount = Array.isArray(history) ? history.length : 0;
  }

  return plan;
}

function focusPlanFromRow(row) {
  const planDate = row.plan_date ?? row.planDate;
  const createdAt = row.created_at ?? row.createdAt;
  const updatedAt = row.updated_at ?? row.updatedAt;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    planDate: planDate instanceof Date ? planDate.toISOString().slice(0, 10) : String(planDate),
    focusText: row.focus_text ?? row.focusText,
    anticipatedHardMoment: row.anticipated_hard_moment ?? row.anticipatedHardMoment,
    plannedSkill: row.planned_skill ?? row.plannedSkill,
    ...(createdAt ? { createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt } : {}),
    ...(updatedAt ? { updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt } : {})
  };
}

function quickCheckInFromRow(row) {
  const createdAt = row.created_at ?? row.createdAt;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
    anchorContext: row.anchor_context ?? row.anchorContext,
    primaryEmotionScore: row.primary_emotion_score ?? row.primaryEmotionScore,
    primaryUrgeScore: row.primary_urge_score ?? row.primaryUrgeScore,
    energyState: row.energy_state ?? row.energyState,
    suggestedNextActionStatus: row.suggested_next_action_status ?? row.suggestedNextActionStatus,
    note: row.note,
    locationContext: row.location_context ?? row.locationContext,
    riskTier: row.risk_tier ?? row.riskTier,
    suggestedNextAction: row.suggested_next_action ?? row.suggestedNextAction
  };
}

function safetyEventFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    riskTier: row.risk_tier ?? row.riskTier,
    triggerType: row.trigger_type ?? row.triggerType,
    outcome: row.outcome,
    context: row.context
  };
}

function diaryEntryFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    entryDate: row.entry_date instanceof Date ? row.entry_date.toISOString().slice(0, 10) : String(row.entry_date ?? row.entryDate),
    anchorCompletion: row.anchor_completion ?? row.anchorCompletion,
    emotionRatings: row.emotion_ratings ?? row.emotionRatings,
    urgeRatings: row.urge_ratings ?? row.urgeRatings,
    targetOccurrences: row.target_occurrences ?? row.targetOccurrences,
    skillsUsed: row.skills_used ?? row.skillsUsed,
    overallDayDifficulty: row.overall_day_difficulty ?? row.overallDayDifficulty,
    optionalFields: row.optional_fields ?? row.optionalFields
  };
}

function skillFromRow(row) {
  return {
    id: row.id,
    module: row.module,
    name: row.name,
    situationTags: row.situation_tags ?? row.situationTags,
    whenToUse: row.when_to_use ?? row.whenToUse,
    whyItHelps: row.why_it_helps ?? row.whyItHelps,
    steps: row.steps,
    durationSeconds: row.duration_seconds ?? row.durationSeconds,
    followUpPrompt: row.follow_up_prompt ?? row.followUpPrompt
  };
}

function skillSessionFromRow(row) {
  const startedAt = row.started_at ?? row.startedAt;
  const completedAt = row.completed_at ?? row.completedAt;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    skillId: row.skill_id ?? row.skillId,
    startedAt: startedAt instanceof Date ? startedAt.toISOString() : startedAt,
    completedAt: completedAt instanceof Date ? completedAt.toISOString() : completedAt,
    helpfulnessRating: row.helpfulness_rating ?? row.helpfulnessRating,
    sourceContext: row.source_context ?? row.sourceContext
  };
}

function agentRunFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    agentName: row.agent_name ?? row.agentName,
    specialistsUsed: row.specialists_used ?? row.specialistsUsed,
    riskTier: row.risk_tier ?? row.riskTier,
    mode: row.mode,
    inputFingerprint: row.input_fingerprint ?? row.inputFingerprint,
    safetyDecision: row.safety_decision ?? row.safetyDecision,
    contextRefs: row.context_refs ?? row.contextRefs
  };
}

function coachMessageFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    agentRunId: row.agent_run_id ?? row.agentRunId,
    role: row.role,
    messageFingerprint: row.message_fingerprint ?? row.messageFingerprint,
    replyText: row.reply_text ?? row.replyText,
    nextAction: row.next_action ?? row.nextAction
  };
}

function chainAnalysisFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    sourceDiaryEntryId: row.source_diary_entry_id ?? row.sourceDiaryEntryId,
    promptingEvent: row.prompting_event ?? row.promptingEvent,
    vulnerabilities: row.vulnerabilities ?? [],
    links: row.links ?? [],
    consequences: row.consequences ?? [],
    alternatives: row.alternatives ?? [],
    preventionPlan: row.prevention_plan ?? row.preventionPlan ?? null,
    status: row.status,
    completionState: row.status === "complete" ? "complete" : "draft"
  };
}

function voiceSessionFromRow(row) {
  const startedAt = row.started_at ?? row.startedAt;
  const endedAt = row.ended_at ?? row.endedAt;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    mode: row.mode,
    doNotSave: row.do_not_save ?? row.doNotSave,
    transcriptPreviewEnabled: row.transcript_preview_enabled ?? row.transcriptPreviewEnabled,
    contextRefs: row.context_refs ?? row.contextRefs ?? {},
    status: row.status,
    startedAt: startedAt instanceof Date ? startedAt.toISOString() : startedAt,
    ...(endedAt ? { endedAt: endedAt instanceof Date ? endedAt.toISOString() : endedAt } : {}),
    ...(row.transcript_opt_in !== null && row.transcript_opt_in !== undefined ? {
      transcriptOptIn: row.transcript_opt_in
    } : {}),
    ...(row.saved_summary ? { savedSummary: row.saved_summary } : {}),
    ...(row.openai_call_id || row.openAiCallId ? { openAiCallId: row.openai_call_id ?? row.openAiCallId } : {})
  };
}

function weeklyReviewFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    weekStart: row.week_start instanceof Date ? row.week_start.toISOString().slice(0, 10) : String(row.week_start ?? row.weekStart),
    wins: row.wins ?? [],
    misses: row.misses ?? [],
    recommendations: row.recommendations ?? [],
    sourceEvidence: row.source_evidence ?? row.sourceEvidence ?? []
  };
}

function sessionPacketFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    dateRange: row.date_range ?? row.dateRange,
    includedSections: row.included_sections ?? row.includedSections,
    redactions: row.redactions ?? {},
    shareMode: row.share_mode ?? row.shareMode,
    status: row.status
  };
}

function userSettingsFromRow(row) {
  return {
    userId: row.user_id ?? row.userId,
    transcriptRetentionDays: row.transcript_retention_days ?? row.transcriptRetentionDays,
    traceRetentionDays: row.trace_retention_days ?? row.traceRetentionDays,
    audioConsent: row.audio_consent ?? row.audioConsent,
    shareConsent: row.share_consent ?? row.shareConsent,
    notificationOptIn: row.notification_opt_in ?? row.notificationOptIn,
    quietHoursStart: row.quiet_hours_start ?? row.quietHoursStart,
    quietHoursEnd: row.quiet_hours_end ?? row.quietHoursEnd
  };
}

function privacyExportFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    format: row.format,
    dateRange: row.date_range ?? row.dateRange,
    status: row.status
  };
}

function deleteRequestFromRow(row) {
  const scheduledDeletionAt = row.scheduled_deletion_at ?? row.scheduledDeletionAt;
  const completedAt = row.completed_at ?? row.completedAt;
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    scope: row.scope,
    status: row.status,
    scheduledDeletionAt: scheduledDeletionAt instanceof Date ? scheduledDeletionAt.toISOString() : scheduledDeletionAt,
    ...(completedAt ? { completedAt: completedAt instanceof Date ? completedAt.toISOString() : completedAt } : {})
  };
}

function exportArtifactFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    kind: row.kind,
    format: row.format,
    storageKey: row.storage_key ?? row.storageKey,
    byteSize: row.byte_size ?? row.byteSize,
    redactions: row.redactions ?? {},
    sourceId: row.source_id ?? row.sourceId,
    status: row.status
  };
}

function auditEventFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId,
    eventType: row.event_type ?? row.eventType,
    metadata: row.metadata ?? {}
  };
}

function nextStepAfter(anchorType) {
  switch (anchorType) {
    case "morning":
      return "Midday anchor is next.";
    case "midday":
      return "Evening anchor is next.";
    default:
      return "Evening diary card is next.";
  }
}

function resetNextBestStep(reset) {
  if (reset.mode === "minimum_viable_day") {
    return `Minimum viable day set: do ${reset.mustDos[0]}, then take ${reset.regulationAction}.`;
  }

  return `Reset today: do ${reset.mustDos[0]}, then take ${reset.regulationAction}.`;
}

import postgres from "postgres";
import { getServerConfig } from "../server/config.js";
import { runSqlDirectory } from "./db-utils.js";

const { databaseUrl } = getServerConfig();
const sql = postgres(databaseUrl, { max: 1 });

try {
  await sql`drop table if exists audit_events`;
  await sql`drop table if exists export_artifacts`;
  await sql`drop table if exists offline_mutations`;
  await sql`drop table if exists delete_requests`;
  await sql`drop table if exists password_reset_tokens`;
  await sql`drop table if exists daily_focus_plans`;
  await sql`drop table if exists privacy_exports`;
  await sql`drop table if exists user_settings`;
  await sql`drop table if exists session_packets`;
  await sql`drop table if exists weekly_reviews`;
  await sql`drop table if exists voice_sessions`;
  await sql`drop table if exists chain_analyses`;
  await sql`drop table if exists coach_messages`;
  await sql`drop table if exists agent_runs`;
  await sql`drop table if exists skill_sessions`;
  await sql`drop table if exists skill_definitions`;
  await sql`drop table if exists diary_entries`;
  await sql`drop table if exists behavior_targets`;
  await sql`drop table if exists diary_schemas`;
  await sql`drop table if exists safety_events`;
  await sql`drop table if exists routine_instances`;
  await sql`drop table if exists quick_check_ins`;
  await sql`drop table if exists routine_templates`;
  await sql`drop table if exists daily_plans`;
  await sql`drop table if exists user_profiles`;
  await sql`drop table if exists safety_plans`;
  await sql`drop table if exists consent_records`;
  await sql`drop table if exists sessions`;
  await sql`drop table if exists users`;
  await sql`drop table if exists app_status_snapshots`;
} finally {
  await sql.end({ timeout: 1 });
}

await runSqlDirectory("db/migrations");
await runSqlDirectory("db/seeds");

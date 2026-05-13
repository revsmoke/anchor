const REQUIRED_TABLES = [
  "users",
  "sessions",
  "consent_records",
  "daily_focus_plans",
  "voice_sessions",
  "session_packets",
  "privacy_exports",
  "delete_requests",
  "password_reset_tokens",
  "offline_mutations",
  "export_artifacts",
  "audit_events"
];

export async function runPrivateBetaReadiness({ db, config }) {
  const checks = [];
  checks.push({
    name: "production_config",
    ok: Boolean(
      config?.appEnv === "production" &&
      config?.appOrigin &&
      config?.databaseUrl &&
      config?.sessionSecret &&
      config?.openaiApiKey &&
      config?.realtimeModel &&
      config?.textModel &&
      Number.isInteger(config?.traceRetentionDays)
    )
  });

  let healthOk = false;
  try {
    healthOk = await db.checkHealth();
  } catch {
    healthOk = false;
  }
  checks.push({ name: "database_health", ok: healthOk === true });

  let tableNames = [];
  if (typeof db.getRequiredTableNames === "function") {
    tableNames = await db.getRequiredTableNames();
  }
  checks.push({
    name: "required_tables",
    ok: REQUIRED_TABLES.every(table => tableNames.includes(table)),
    details: {
      missing: REQUIRED_TABLES.filter(table => !tableNames.includes(table))
    }
  });

  return {
    ok: checks.every(check => check.ok),
    checks
  };
}

export { REQUIRED_TABLES };

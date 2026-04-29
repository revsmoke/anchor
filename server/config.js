export function getPublicConfig() {
  return {
    appName: "Anchor",
    environment: process.env.APP_ENV ?? process.env.NODE_ENV ?? "test",
    supportLocale: "US",
    crisisResources: {
      emergency: "911",
      suicideCrisisLifeline: "988"
    }
  };
}

export function getServerConfig(env = process.env) {
  const appEnv = env.APP_ENV ?? env.NODE_ENV ?? "test";
  const config = {
    appEnv,
    appOrigin: env.APP_ORIGIN ?? `http://127.0.0.1:${env.PORT ?? 3000}`,
    port: Number(env.PORT ?? 3000),
    databaseUrl: env.DATABASE_URL ?? "postgres://localhost:5432/anchor_local",
    sessionSecret: env.SESSION_SECRET ?? "",
    openaiApiKey: env.OPENAI_API_KEY ?? "",
    realtimeModel: env.REALTIME_MODEL ?? "gpt-realtime",
    textModel: env.TEXT_MODEL ?? "gpt-4.1-mini",
    traceRetentionDays: Number(env.TRACE_RETENTION_DAYS ?? 30),
    exportDir: env.EXPORT_DIR ?? ".anchor-data/exports",
    openaiRealtimeCallsUrl: env.OPENAI_REALTIME_CALLS_URL ?? "https://api.openai.com/v1/realtime/calls"
  };

  config.secureCookies = appEnv === "production";
  config.csrfProtection = appEnv === "production";

  if (appEnv === "production") {
    const missing = [];
    for (const key of ["APP_ORIGIN", "DATABASE_URL", "SESSION_SECRET", "OPENAI_API_KEY", "REALTIME_MODEL", "TEXT_MODEL", "TRACE_RETENTION_DAYS"]) {
      if (!env[key]) missing.push(key);
    }
    if (missing.length) {
      throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
    }
  }

  return config;
}

import { loadDotEnv } from "./env-loader.js";

export function requireLiveOpenAiConfig(env = process.env) {
  loadDotEnv(".env", env);

  const enabled = env.OPENAI_REALTIME_LIVE_TEST === "1";
  if (!enabled) {
    throw new Error("OpenAI live tests require OPENAI_REALTIME_LIVE_TEST=1.");
  }

  const openaiApiKey = String(env.OPENAI_API_KEY ?? "").trim();
  if (!openaiApiKey) {
    throw new Error("OpenAI live tests require OPENAI_API_KEY.");
  }

  return {
    enabled,
    openaiApiKey,
    realtimeModel: String(env.REALTIME_MODEL ?? "gpt-realtime").trim(),
    textModel: String(env.TEXT_MODEL ?? "gpt-4.1-mini").trim(),
    openaiRealtimeCallsUrl: String(env.OPENAI_REALTIME_CALLS_URL ?? "https://api.openai.com/v1/realtime/calls").trim()
  };
}

export function redactSecretText(value, env = process.env) {
  const key = String(env.OPENAI_API_KEY ?? "");
  if (!key) return String(value ?? "");
  return String(value ?? "").split(key).join("[REDACTED_OPENAI_API_KEY]");
}

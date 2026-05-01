import { existsSync, readFileSync } from "node:fs";

export function loadDotEnv(path = ".env", target = process.env) {
  if (!existsSync(path)) return [];

  const loaded = [];
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    if (!key || target[key] !== undefined) continue;

    target[key] = unquoteValue(rawValue);
    loaded.push(key);
  }

  return loaded;
}

function unquoteValue(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

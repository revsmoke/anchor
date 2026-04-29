const SENSITIVE_KEYS = new Set([
  "message",
  "note",
  "notes",
  "transcript",
  "savedSummary",
  "promptingEvent",
  "safetyPlan"
]);

export function redactAuditMetadata(value) {
  if (Array.isArray(value)) {
    return value.map(redactAuditMetadata);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_KEYS.has(key) ? "[redacted]" : redactAuditMetadata(entry)
    ])
  );
}

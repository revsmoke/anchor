const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDateParam(value) {
  const date = String(value || "").trim();
  if (!DATE_RE.test(date)) {
    throw new Error("date must use YYYY-MM-DD");
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("date must be a real calendar date");
  }

  return date;
}

export function validateTimezone(value) {
  const timezone = String(value || "").trim();
  if (!timezone) {
    throw new Error("timezone is required");
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error("timezone must be a valid IANA timezone");
  }

  return timezone;
}

export function resolveUserTimezone({ profileTimezone, fallbackTimezone = "UTC" } = {}) {
  return validateTimezone(profileTimezone || fallbackTimezone || "UTC");
}

export function resolveUserLocalDate({ timezone, dateParam = "", now = new Date() } = {}) {
  if (dateParam) {
    return validateDateParam(dateParam);
  }

  const safeTimezone = validateTimezone(timezone || "UTC");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

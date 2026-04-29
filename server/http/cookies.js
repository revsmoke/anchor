const SESSION_COOKIE = "anchor_session";
const CSRF_COOKIE = "anchor_csrf";

export function readSessionToken(request) {
  return readCookie(request, SESSION_COOKIE);
}

export function readCsrfToken(request) {
  return readCookie(request, CSRF_COOKIE);
}

export function readCookie(request, name) {
  const cookie = request.headers.get("cookie") ?? "";
  const pairs = cookie.split(";").map(part => part.trim());
  const pair = pairs.find(part => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

export function sessionCookie(token, options = {}) {
  return cookieString(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: options.secure === true,
    sameSite: "Lax"
  });
}

export function csrfCookie(token, options = {}) {
  return cookieString(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: options.secure === true,
    sameSite: "Lax"
  });
}

export function clearSessionCookie(options = {}) {
  return cookieString(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: options.secure === true,
    sameSite: "Lax",
    maxAge: 0
  });
}

function cookieString(name, value, options) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/"
  ];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}

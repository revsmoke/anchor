export function jsonOk(data, options = {}) {
  const requestId = options.requestId ?? createRequestId();
  return Response.json(
    {
      ok: true,
      data
    },
    {
      status: options.status ?? 200,
      headers: responseHeaders(options.headers, requestId)
    }
  );
}

export function jsonError(code, message, options = {}) {
  const requestId = options.requestId ?? createRequestId();
  return Response.json(
    {
      ok: false,
      error: {
        code,
        message,
        requestId
      }
    },
    {
      status: options.status ?? 500,
      headers: responseHeaders(options.headers, requestId)
    }
  );
}

export function createRequestId() {
  return `req_${crypto.randomUUID()}`;
}

function responseHeaders(headers, requestId) {
  const next = new Headers(headers ?? {});
  next.set("x-request-id", requestId);
  return next;
}

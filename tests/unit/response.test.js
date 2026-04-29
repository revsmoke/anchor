import { describe, expect, test } from "bun:test";
import { jsonError, jsonOk } from "../../server/http/response.js";

describe("JSON response helpers", () => {
  test("jsonOk wraps response data in the standard envelope", async () => {
    const response = jsonOk({ status: "ok" }, { status: 201 });

    expect(response.status).toBe(201);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { status: "ok" }
    });
  });

  test("jsonError wraps safe errors with a request id", async () => {
    const response = jsonError("snapshot_unavailable", "Snapshot unavailable.", {
      requestId: "req_test",
      status: 503
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "snapshot_unavailable",
        message: "Snapshot unavailable.",
        requestId: "req_test"
      }
    });
  });
});

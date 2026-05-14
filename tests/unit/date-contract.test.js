import { describe, expect, test } from "bun:test";
import {
  resolveUserLocalDate,
  resolveUserTimezone,
  validateDateParam
} from "../../server/dates.js";

describe("user-local date contract", () => {
  test("resolves the same instant into different user-local dates", () => {
    const instant = new Date("2026-05-12T03:30:00.000Z");

    expect(resolveUserLocalDate({ timezone: "America/Detroit", now: instant })).toBe("2026-05-11");
    expect(resolveUserLocalDate({ timezone: "Pacific/Auckland", now: instant })).toBe("2026-05-12");
  });

  test("uses timezone rules across a DST boundary", () => {
    expect(resolveUserLocalDate({
      timezone: "America/Detroit",
      now: new Date("2026-03-08T04:30:00.000Z")
    })).toBe("2026-03-07");

    expect(resolveUserLocalDate({
      timezone: "America/Detroit",
      now: new Date("2026-03-08T07:30:00.000Z")
    })).toBe("2026-03-08");
  });

  test("accepts explicit YYYY-MM-DD date params without consulting server date", () => {
    expect(validateDateParam("2026-02-03")).toBe("2026-02-03");
    expect(() => validateDateParam("02/03/2026")).toThrow("date must use YYYY-MM-DD");
    expect(() => validateDateParam("2026-02-30")).toThrow("date must be a real calendar date");
  });

  test("uses profile timezone before explicit fallback timezone", () => {
    expect(resolveUserTimezone({
      profileTimezone: "America/Detroit",
      fallbackTimezone: "Pacific/Auckland"
    })).toBe("America/Detroit");

    expect(resolveUserTimezone({
      profileTimezone: "",
      fallbackTimezone: "Pacific/Auckland"
    })).toBe("Pacific/Auckland");
  });
});

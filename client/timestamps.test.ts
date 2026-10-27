import { describe, expect, it } from "vitest";
import { formatMessageDate, formatTimestamp, formatTimestampAccessibilityLabel } from "./timestamp-model";

describe("timestamp formatting", () => {
  const midnightUtc = new Date("2026-10-26T00:00:00.000Z");
  const shortUtc = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", timeStyle: "short" });
  const fullUtc = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    dateStyle: "full",
    timeStyle: "short",
  });

  it("formats the host timestamp with the supplied local formatter, including midnight", () => {
    expect(formatTimestamp(midnightUtc, shortUtc)).toBe("00:00");
    expect(formatTimestampAccessibilityLabel(midnightUtc, fullUtc)).toContain("00:00");
  });

  it("omits invalid timestamps", () => {
    expect(formatTimestamp(new Date("invalid"), shortUtc)).toBeNull();
    expect(formatTimestampAccessibilityLabel(new Date("invalid"), fullUtc)).toBeNull();
    expect(formatMessageDate(new Date("invalid"), midnightUtc, "en-US")).toBeNull();
  });

  it("formats today and yesterday with localized relative labels", () => {
    const now = new Date(2026, 9, 26, 12, 0);
    const today = new Date(2026, 9, 26, 0, 0);
    const yesterday = new Date(2026, 9, 25, 23, 59);

    for (const locale of ["de-DE", "en-US"]) {
      const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      expect(formatMessageDate(today, now, locale)).toBe(relative.format(0, "day"));
      expect(formatMessageDate(yesterday, now, locale)).toBe(relative.format(-1, "day"));
    }
  });

  it("formats older-month and older-year dates using the locale's medium date", () => {
    const now = new Date(2026, 9, 26, 12, 0);
    const olderMonth = new Date(2026, 8, 24, 9, 0);
    const nextYear = new Date(2027, 0, 2, 9, 0);

    for (const locale of ["de-DE", "en-US"]) {
      const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
      expect(formatMessageDate(olderMonth, now, locale)).toBe(formatter.format(olderMonth));
      expect(formatMessageDate(nextYear, now, locale)).toBe(formatter.format(nextYear));
    }
  });

  it("uses local calendar boundaries across midnight, month, year, and daylight saving time", () => {
    const relative = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
    expect(formatMessageDate(new Date(2026, 11, 31, 23, 59), new Date(2027, 0, 1, 0, 0), "en-US"))
      .toBe(relative.format(-1, "day"));
    expect(formatMessageDate(new Date(2026, 2, 29, 12, 0), new Date(2026, 2, 30, 12, 0), "en-US"))
      .toBe(relative.format(-1, "day"));
  });

  it("retains a complete accessible date and local timezone", () => {
    const label = formatTimestampAccessibilityLabel(new Date("2026-10-26T00:30:00Z"));
    expect(label).toMatch(/2026/);
    expect(label).toMatch(/(?:GMT|UTC|[A-Z]{2,5})/);
  });
});

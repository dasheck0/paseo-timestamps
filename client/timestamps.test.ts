import { describe, expect, it } from "vitest";
import {
  formatTimestamp,
  formatTimestampAccessibilityLabel,
  messageTimestampSchema,
  transformAssistantMessage,
  transformUserMessage,
} from "./timestamp-model";

describe("message transforms", () => {
  it("replaces a user message with exactly one stable plugin item", () => {
    const result = transformUserMessage({
      item: { text: "Keep **this** exactly\n", clientMessageId: "client-1" },
      phase: "complete",
    });

    expect(result).toEqual({
      items: [
        {
          type: "plugin",
          kind: "timestamped-message",
          version: 1,
          data: { text: "Keep **this** exactly\n", phase: "complete" },
        },
      ],
    });
    expect(messageTimestampSchema.parse(result?.items[0]?.data)).toEqual({
      text: "Keep **this** exactly\n",
      phase: "complete",
    });
  });

  it("keeps full accumulated assistant text while streaming", () => {
    const result = transformAssistantMessage({
      item: { text: "First chunk, then the full reply", messageId: "assistant-1" },
      phase: "streaming",
    });

    expect(result?.items).toEqual([
      {
        type: "plugin",
        kind: "timestamped-assistant-message",
        version: 1,
        data: { text: "First chunk, then the full reply", phase: "streaming" },
      },
    ]);
  });

  it("leaves encoded attachment text to the native row", () => {
    expect(
      transformUserMessage({
        item: { text: "data:text/plain;base64,SGVsbG8=" },
        phase: "complete",
      }),
    ).toBeUndefined();
  });
});

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
  });
});


describe("history and streaming boundaries", () => {
  it("lets Paseo derive identity from the source row rather than changing message IDs", () => {
    const live = transformAssistantMessage({ item: { text: "First\n\nSecond", clientMessageId: "local" }, phase: "streaming" });
    const done = transformAssistantMessage({ item: { text: "First\n\nSecond", messageId: "saved" }, phase: "complete" });
    expect(live?.items[0]).not.toHaveProperty("id");
    expect(done?.items[0]).not.toHaveProperty("id");
    expect(done?.items[0].data).toEqual({ text: "First\n\nSecond", phase: "complete" });
  });
  it("leaves empty attachment-only messages native", () => {
    expect(transformUserMessage({ item: { text: "" }, phase: "complete" })).toBeUndefined();
    expect(transformAssistantMessage({ item: { text: "  " }, phase: "streaming" })).toBeUndefined();
  });
  it("rejects malformed renderer payloads", () => {
    expect(messageTimestampSchema.safeParse({ text: 1, phase: "complete" }).success).toBe(false);
    expect(messageTimestampSchema.safeParse({ text: "x", phase: "loading" }).success).toBe(false);
  });
  it("uses the selected timezone across a date boundary", () => {
    const date = new Date("2026-10-26T00:30:00Z");
    const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "short" });
    const label = formatTimestampAccessibilityLabel(date, formatter);
    expect(label).toContain("25 October 2026");
    expect(label).toContain("17:30");
  });
});

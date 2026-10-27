import { describe, expect, it, vi } from "vitest";
import { transformMessage } from "./transform";

vi.mock("react-native", () => ({ View: "view", Text: "text" }));

describe("public timeline transformers", () => {
  it("preserves exact text and uses no fabricated item identity", () => {
    const text = "  Keep **all** text.\n\n[link](https://example.test)  ";
    const input = { item: { type: "user_message", text, messageId: "u-1" }, phase: "complete" } as const;
    const first = transformMessage("user")(input);
    expect(transformMessage("user")(input)).toEqual(first);
    expect(first?.items[0]).toMatchObject({ kind: "paseo-timestamps-message", data: { role: "user", text, phase: "complete" } });
    expect(first?.items[0]).not.toHaveProperty("id");
  });

  it("carries actual assistant message text and phase transitions", () => {
    const item = { type: "assistant_message", text: "unfinished **markdown", messageId: "a-1" } as const;
    const transform = transformMessage("assistant");
    expect(transform({ item, phase: "streaming" })?.items[0]?.data).toEqual({ role: "assistant", text: item.text, phase: "streaming" });
    expect(transform({ item, phase: "complete" })?.items[0]?.data).toEqual({ role: "assistant", text: item.text, phase: "complete" });
  });

  it("leaves malformed, empty and attachment-bearing items to native host", () => {
    const transform = transformMessage("user");
    expect(transform({ item: { type: "user_message", text: "" }, phase: "complete" })).toBeUndefined();
    expect(transform({ item: { type: "user_message", text: "file", attachments: [{}] } as never, phase: "complete" })).toBeUndefined();
    expect(transform({ item: { type: "user_message", text: 42 } as never, phase: "complete" })).toBeUndefined();
  });
});

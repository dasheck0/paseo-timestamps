import { describe, expect, it } from "vitest";
import { transformMessage } from "./transform";
import { messageReplacementSchema } from "./message-schema";

describe("public timeline transformers", () => {
  it("preserves exact text and uses no fabricated item identity", () => {
    const text = "  Keep **all** text.\n\n[link](https://example.test)  ";
    const input = { item: { type: "user_message", text, messageId: "u-1" }, phase: "complete" } as const;
    const first = transformMessage("user")(input);
    expect(transformMessage("user")(input)).toEqual(first);
    expect(first?.items[0]).toMatchObject({ kind: "paseo-timestamps-message", data: { role: "user", text, phase: "complete" } });
    expect(first?.items[0]).not.toHaveProperty("id");
  });

  it.each(["user", "assistant"] as const)("preserves complete %s source in both phases without metadata", (role) => {
    const text = "  # Heading\n\n```ts\nconst x = 1;\n```\n[link](https://example.test)\n  ";
    for (const phase of ["streaming", "complete"] as const) {
      expect(transformMessage(role)({ item: { type: `${role}_message`, text }, phase })?.items[0].data)
        .toEqual({ role, text, phase });
    }
  });

  it.each([
    { text: " \n\t " },
    { text: "data:image/png;base64,aGVsbG8=" },
    { text: "file", images: [] },
    { text: "file", content: [] },
    { text: "file", attachments: [] },
  ])("preserves native handling of exposed rich or empty payloads: %j", (payload) => {
    expect(transformMessage("user")({ item: { type: "user_message", ...payload } as never, phase: "complete" })).toBeUndefined();
  });

  it.each([null, {}, { role: "tool", text: "x", phase: "complete" }, { role: "user", text: 1, phase: "complete" }, { role: "assistant", text: "x", phase: "unknown" }])("rejects invalid renderer data %j", (data) => {
    expect(messageReplacementSchema.safeParse(data).success).toBe(false);
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

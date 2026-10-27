import type { AgentTimelineItem } from "@getpaseo/protocol/agent-types";
import { messageReplacementSchema } from "./timestamps";

type MessageItem = Extract<AgentTimelineItem, { type: "user_message" | "assistant_message" }>;

export function transformMessage(role: "user" | "assistant") {
  return ({ item, phase }: { item: MessageItem; phase: "streaming" | "complete" }) => {
    if (item.type !== `${role}_message` || typeof item.text !== "string" || item.text.length === 0) return undefined;
    // Attachments and richer payloads are not representable by the public renderer data contract.
    const extended = item as MessageItem & { attachments?: unknown; images?: unknown; content?: unknown };
    if (extended.attachments != null || extended.images != null || extended.content != null) return undefined;
    return {
      items: [{
        type: "plugin" as const,
        kind: "paseo-timestamps-message",
        version: 1,
        data: messageReplacementSchema.parse({ role, text: item.text, phase }),
      }],
    };
  };
}

import type { AgentTimelineItem } from "@getpaseo/protocol/agent-types";
import {
  MESSAGE_KIND,
  MESSAGE_VERSION,
  messageReplacementSchema,
} from "./message-schema";

type MessageItem = Extract<
  AgentTimelineItem,
  { type: "user_message" | "assistant_message" }
>;

export function transformMessage(role: "user" | "assistant") {
  return ({
    item,
    phase,
  }: {
    item: MessageItem;
    phase: "streaming" | "complete";
  }) => {
    if (
      item.type !== `${role}_message`
      || typeof item.text !== "string"
      || item.text.trim().length === 0
    ) {
      return undefined;
    }
    // Standalone encoded attachments must remain with the native host renderer.
    if (/^data:[^,\s]*;base64,[a-z\d+/=\s]+$/i.test(item.text.trim())) {
      return undefined;
    }
    // Attachments and richer payloads are not representable by the public renderer data contract.
    const extended = item as MessageItem & {
      attachments?: unknown;
      images?: unknown;
      content?: unknown;
    };
    if (
      extended.attachments != null
      || extended.images != null
      || extended.content != null
    ) {
      return undefined;
    }
    return {
      items: [
        {
          type: "plugin" as const,
          kind: MESSAGE_KIND,
          version: MESSAGE_VERSION,
          data: messageReplacementSchema.parse({ role, text: item.text, phase }),
        },
      ],
    };
  };
}

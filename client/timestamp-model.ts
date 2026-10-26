import { z } from "zod";

export const messageTimestampSchema = z.object({
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

type MessageItem = {
  text: string;
  messageId?: string;
  clientMessageId?: string;
};
type MessagePhase = z.output<typeof messageTimestampSchema>["phase"];

function isEncodedAttachmentText(text: string) {
  return /^data:[^,]+;base64,[A-Za-z0-9+/]+={0,2}$/.test(text);
}

function transformMessage(item: MessageItem, phase: MessagePhase, kind: string) {
  if (isEncodedAttachmentText(item.text)) return undefined;

  return {
    items: [
      {
        type: "plugin" as const,
        ...(item.messageId ?? item.clientMessageId ? { id: item.messageId ?? item.clientMessageId } : {}),
        kind,
        version: 1,
        data: { text: item.text, phase },
      },
    ],
  };
}

export function transformUserMessage({ item, phase }: { item: MessageItem; phase: MessagePhase }) {
  return transformMessage(item, phase, "timestamped-message");
}

export function transformAssistantMessage({ item, phase }: { item: MessageItem; phase: MessagePhase }) {
  return transformMessage(item, phase, "timestamped-assistant-message");
}

export function formatTimestamp(timestamp: Date, formatter = new Intl.DateTimeFormat(undefined, { timeStyle: "short" })) {
  return Number.isNaN(timestamp.getTime()) ? null : formatter.format(timestamp);
}

export function formatTimestampAccessibilityLabel(
  timestamp: Date,
  formatter = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }),
) {
  return Number.isNaN(timestamp.getTime()) ? null : formatter.format(timestamp);
}

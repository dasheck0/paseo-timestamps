import type { PluginClientContext } from "@getpaseo/plugin/client";
import {
  assistantMessageRenderer,
  messageTimestampSchema,
  transformAssistantMessage,
  transformUserMessage,
  userMessageRenderer,
} from "./client/timestamps";

export default function contribute(client: PluginClientContext) {
  client.addTimelineTransformer({
    id: "timestamp-user-message",
    query: { itemType: "user_message" },
    transform: transformUserMessage,
  });
  client.addTimelineTransformer({
    id: "timestamp-assistant-message",
    query: { itemType: "assistant_message" },
    transform: transformAssistantMessage,
  });
  client.addTimelineRenderer({
    kind: "timestamped-message",
    version: 1,
    schema: messageTimestampSchema,
    Component: userMessageRenderer,
  });
  client.addTimelineRenderer({
    kind: "timestamped-assistant-message",
    version: 1,
    schema: messageTimestampSchema,
    Component: assistantMessageRenderer,
  });
  return () => {};
}

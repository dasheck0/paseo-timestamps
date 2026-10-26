import type { PluginClientContext } from "@getpaseo/plugin/client";
import {
  AssistantMessage,
  messageTimestampSchema,
  transformAssistantMessage,
  transformUserMessage,
  UserMessage,
} from "./client/timestamps";

export default function contribute(client: PluginClientContext) {
  const removers = [client.addTimelineTransformer({
    id: "timestamp-user-message",
    query: { itemType: "user_message" },
    transform: transformUserMessage,
  }), client.addTimelineTransformer({
    id: "timestamp-assistant-message",
    query: { itemType: "assistant_message" },
    transform: transformAssistantMessage,
  }), client.addTimelineRenderer({
    kind: "timestamped-message",
    version: 1,
    schema: messageTimestampSchema,
    Component: UserMessage,
  }), client.addTimelineRenderer({
    kind: "timestamped-assistant-message",
    version: 1,
    schema: messageTimestampSchema,
    Component: AssistantMessage,
  })];
  return async () => {
    for (const remove of [...removers].reverse()) await remove();
  };
}

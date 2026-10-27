import type { PluginClientContext } from "@getpaseo/plugin/client";
import { MessageReplacement, messageReplacementSchema } from "./client/timestamps";
import { transformMessage } from "./client/transform";

export default function contribute(client: PluginClientContext) {
  const removers = [
    client.addTimelineTransformer({ id: "timestamp-user-message", query: { itemType: "user_message" }, transform: transformMessage("user") }),
    client.addTimelineTransformer({ id: "timestamp-assistant-message", query: { itemType: "assistant_message" }, transform: transformMessage("assistant") }),
    client.addTimelineRenderer({ kind: "paseo-timestamps-message", version: 1, schema: messageReplacementSchema, Component: MessageReplacement }),
  ];
  return () => { for (const remove of removers.reverse()) remove(); };
}

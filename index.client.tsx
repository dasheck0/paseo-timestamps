import type { PluginClientContext } from "@getpaseo/plugin/client";
import type { PluginCleanup } from "@getpaseo/plugin";
import { MessageReplacement } from "./client/timestamps";
import {
  MESSAGE_KIND,
  MESSAGE_VERSION,
  messageReplacementSchema,
} from "./client/message-schema";
import { transformMessage } from "./client/transform";

export default function contribute(client: PluginClientContext) {
  const removers: PluginCleanup[] = [];
  let cleanupPromise: Promise<void> | undefined;
  const cleanup = () => cleanupPromise ??= (async () => {
    const errors: unknown[] = [];
    while (removers.length) {
      try {
        await removers.pop()!();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) {
      throw new AggregateError(errors, "Timeline cleanup failed");
    }
  })();

  try {
    removers.push(client.addTimelineTransformer({
      id: "timestamp-user-message",
      query: { itemType: "user_message" },
      transform: transformMessage("user"),
    }));
    removers.push(client.addTimelineTransformer({
      id: "timestamp-assistant-message",
      query: { itemType: "assistant_message" },
      transform: transformMessage("assistant"),
    }));
    removers.push(client.addTimelineRenderer({
      kind: MESSAGE_KIND,
      version: MESSAGE_VERSION,
      schema: messageReplacementSchema,
      Component: MessageReplacement,
    }));
  } catch (error) {
    // Contribution is synchronous; start rollback without masking its original error.
    void cleanup().catch((cleanupError: unknown) => {
      console.warn("[paseo-timestamps] Registration rollback cleanup failed", cleanupError);
    });
    throw error;
  }
  return cleanup;
}

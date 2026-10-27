import { z } from "zod";

export const MESSAGE_KIND = "paseo-timestamps-message";
export const MESSAGE_VERSION = 1;

export const messageReplacementSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string(),
  phase: z.enum(["streaming", "complete"]),
});

export type MessageReplacementData = z.infer<typeof messageReplacementSchema>;

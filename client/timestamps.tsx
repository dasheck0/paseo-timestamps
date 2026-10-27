import { View, Text } from "react-native";
import { Markdown } from "@getpaseo/plugin/client/ui";
import { useRevealedText } from "@getpaseo/plugin/client/react-native";
import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { z } from "zod";
import { formatMessageDate, formatTimestamp, formatTimestampAccessibilityLabel } from "./timestamp-model";

export const messageReplacementSchema = z.object({ role: z.enum(["user", "assistant"]), text: z.string(), phase: z.enum(["streaming", "complete"]) });
export type MessageReplacementData = z.infer<typeof messageReplacementSchema>;

export function MessageReplacement({ item, timestamp, theme }: PluginTimelineItemProps<MessageReplacementData>) {
  const date = formatMessageDate(timestamp);
  const time = formatTimestamp(timestamp);
  const fullDate = formatTimestampAccessibilityLabel(timestamp);
  if (!date || !time || !fullDate) return <Body data={item.data} theme={theme} />;

  return (
    <View style={{ gap: 4 }}>
      <Body data={item.data} theme={theme} />
      <Text accessibilityLabel={fullDate} style={{ color: theme.colors.foregroundMuted, fontSize: 11, lineHeight: 16, textAlign: item.data.role === "user" ? "right" : "left" }}>{date} · {time}</Text>
    </View>
  );
}

function Body({ data, theme }: { data: MessageReplacementData; theme: PluginTimelineItemProps["theme"] }) {
  return data.role === "user" ? <UserBody text={data.text} theme={theme} /> : <AssistantBody text={data.text} phase={data.phase} />;
}

export function UserBody({ text, theme }: { text: string; theme: PluginTimelineItemProps["theme"] }) {
  return <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 }}><View style={{ maxWidth: "100%", backgroundColor: theme.colors.surface2, borderRadius: 16, borderTopRightRadius: 6, paddingHorizontal: 16, paddingVertical: 16, flexShrink: 1 }}><Text selectable style={{ color: theme.colors.foreground, fontSize: 16, lineHeight: 22 }}>{text}</Text></View></View>;
}

export function AssistantBody({ text, phase }: { text: string; phase: "streaming" | "complete" }) {
  const revealed = useRevealedText(text, phase);
  return <Markdown>{revealed}</Markdown>;
}

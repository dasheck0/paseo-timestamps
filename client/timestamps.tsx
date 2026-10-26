import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { useRevealedText } from "@getpaseo/plugin/client/react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import type { z } from "zod";
import { formatTimestamp, formatTimestampAccessibilityLabel, messageTimestampSchema } from "./timestamp-model";

export { messageTimestampSchema, transformAssistantMessage, transformUserMessage } from "./timestamp-model";

type MessageData = z.output<typeof messageTimestampSchema>;
type MessageProps = PluginTimelineItemProps<MessageData>;

function MessageFrame({ children, timestamp, theme, compact, role }: {
  children: ReactNode;
  timestamp: Date;
  theme: MessageProps["theme"];
  compact: boolean;
  role: "You" | "Assistant";
}) {
  const time = formatTimestamp(timestamp);
  const fullDate = formatTimestampAccessibilityLabel(timestamp);
  const isUser = role === "You";
  return (
    <View style={{ alignItems: isUser ? "flex-end" : "flex-start", paddingVertical: compact ? 6 : 8 }}>
      <View style={{
        maxWidth: isUser ? "92%" : "100%",
        gap: compact ? 6 : 8,
        paddingVertical: compact ? 10 : 12,
        paddingHorizontal: compact ? 12 : 16,
        borderRadius: 12,
        backgroundColor: isUser ? theme.colors.surface1 : theme.colors.surface0,
      }}>
        {children}
        <Text
          accessibilityLabel={fullDate ? `${role}, ${fullDate}` : role}
          style={{ color: theme.colors.foregroundMuted, fontSize: 11, lineHeight: 16, textAlign: isUser ? "right" : "left" }}
        >
          {role}{time ? ` · ${time}` : ""}
        </Text>
      </View>
    </View>
  );
}

export function UserMessage({ item, timestamp, theme, layout }: MessageProps) {
  return (
    <MessageFrame timestamp={timestamp} theme={theme} compact={layout.compact} role="You">
      <Text selectable style={{ color: theme.colors.foreground, fontSize: 15, lineHeight: 23 }}>{item.data.text}</Text>
    </MessageFrame>
  );
}

export function AssistantMessage({ item, timestamp, theme, layout }: MessageProps) {
  const text = useRevealedText(item.data.text, item.data.phase);
  return (
    <MessageFrame timestamp={timestamp} theme={theme} compact={layout.compact} role="Assistant">
      <Text selectable style={{ color: theme.colors.foreground, fontSize: 15, lineHeight: 23 }}>{text}</Text>
    </MessageFrame>
  );
}

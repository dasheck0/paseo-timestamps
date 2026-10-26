import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { useRevealedText } from "@getpaseo/plugin/client/react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import type { z } from "zod";
import {
  formatTimestamp,
  formatTimestampAccessibilityLabel,
  messageTimestampSchema,
} from "./timestamp-model";

export {
  formatTimestamp,
  formatTimestampAccessibilityLabel,
  messageTimestampSchema,
  transformAssistantMessage,
  transformUserMessage,
} from "./timestamp-model";

type MessageTimestampData = z.output<typeof messageTimestampSchema>;

function MessageTimestamp({ timestamp, theme }: Pick<PluginTimelineItemProps<MessageTimestampData>, "timestamp" | "theme">) {
  const time = formatTimestamp(timestamp);
  const fullDate = formatTimestampAccessibilityLabel(timestamp);

  if (!time || !fullDate) return null;

  return (
    <Text accessibilityLabel={fullDate} style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>
      {time}
    </Text>
  );
}

function MessageFrame({
  children,
  timestamp,
  theme,
  compact,
}: Pick<PluginTimelineItemProps<MessageTimestampData>, "timestamp" | "theme"> & {
  children: ReactNode;
  compact: boolean;
}) {
  return (
    <View
      style={{
        gap: compact ? 4 : 6,
        paddingVertical: compact ? 4 : 6,
        paddingHorizontal: compact ? 8 : 10,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.border,
        backgroundColor: theme.colors.surface1,
      }}
    >
      {children}
      <MessageTimestamp timestamp={timestamp} theme={theme} />
    </View>
  );
}

export function userMessageRenderer({ item, timestamp, theme, layout }: PluginTimelineItemProps<MessageTimestampData>) {
  return (
    <MessageFrame timestamp={timestamp} theme={theme} compact={layout.compact}>
      <Text selectable style={{ color: theme.colors.foreground }}>
        {item.data.text}
      </Text>
    </MessageFrame>
  );
}

export function assistantMessageRenderer({ item, timestamp, theme, layout }: PluginTimelineItemProps<MessageTimestampData>) {
  const text = useRevealedText(item.data.text, item.data.phase);

  return (
    <MessageFrame timestamp={timestamp} theme={theme} compact={layout.compact}>
      <Text selectable style={{ color: theme.colors.foreground }}>
        {text}
      </Text>
    </MessageFrame>
  );
}

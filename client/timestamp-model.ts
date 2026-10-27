export function formatTimestamp(
  timestamp: Date,
  formatter = new Intl.DateTimeFormat(undefined, { timeStyle: "short" }),
) {
  return Number.isNaN(timestamp.getTime()) ? null : formatter.format(timestamp);
}

export function formatMessageDate(
  timestamp: Date,
  now = new Date(),
  locale?: string,
) {
  if (Number.isNaN(timestamp.getTime())) return null;

  const isSameLocalDate = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (isSameLocalDate(timestamp, now)) return relative.format(0, "day");
  if (isSameLocalDate(timestamp, yesterday)) return relative.format(-1, "day");
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(timestamp);
}

export function formatTimestampAccessibilityLabel(
  timestamp: Date,
  formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  }),
) {
  return Number.isNaN(timestamp.getTime()) ? null : formatter.format(timestamp);
}

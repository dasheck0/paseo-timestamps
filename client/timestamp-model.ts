// Some JS engines (e.g. Hermes in the Paseo mobile app) ship without parts of
// Intl, such as Intl.RelativeTimeFormat. Feature-detect and fall back so a
// missing API never throws while rendering a message.
function relativeDayLabel(offset: 0 | -1, locale?: string) {
  if (typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function") {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(offset, "day");
  }
  return offset === 0 ? "Today" : "Yesterday";
}

function safeDateFormat(
  timestamp: Date,
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
  fallback: (date: Date) => string,
) {
  try {
    return new Intl.DateTimeFormat(locale, options).format(timestamp);
  } catch {
    return fallback(timestamp);
  }
}

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

  if (isSameLocalDate(timestamp, now)) return relativeDayLabel(0, locale);
  if (isSameLocalDate(timestamp, yesterday)) return relativeDayLabel(-1, locale);
  return safeDateFormat(timestamp, locale, { dateStyle: "medium" }, (date) => date.toDateString());
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

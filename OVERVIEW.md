# Paseo Timestamps

Paseo Timestamps replaces standard user and assistant timeline rows with compact, local-time timestamped rows. It is a client-only plugin: it has no server entry, network activity, settings, or data collection.

The host-provided message `Date` remains the source of truth. Invalid dates show no time. Assistant output uses Paseo 0.12's native text reveal hook; 0.12 does not expose host Markdown to plugins, so Markdown remains raw text.

Native attachment rows are preserved only when the message arrives as a base64 `data:` text payload. Replaced rows cannot retain native row actions under the 0.12 timeline-transform API.

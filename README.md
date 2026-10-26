# Paseo Timestamps

Compact, quiet timestamps for Paseo conversations. The plugin replaces ordinary user and assistant message rows with a native, selectable text row and a truthful local-time label.

## Behavior

- Uses the `Date` supplied by Paseo for the message; invalid dates show no label.
- Uses your device locale and timezone for a short visible time and a full accessible date.
- Keeps source text unchanged. Assistant streaming uses Paseo's `useRevealedText` hook so the renderer receives the complete accumulated reply.
- Supports light and dark themes through Paseo theme tokens and adapts spacing for compact layouts.
- Has no server entry, RPCs, network calls, settings, tracking, or data collection.

## Limits

Paseo 0.12 has no host Markdown renderer available to plugins, so assistant Markdown is displayed as native raw text. A timeline transform must replace the native row with plugin items; native row actions do not carry across. Base64 `data:` attachment text is left untouched so the native row remains available. Other attachment metadata is intentionally not exposed to the 0.12 transform API.

Timeline transforms are first-match wins. If Chat Polish (or another plugin) claims `assistant_message` first, disable its overlapping assistant renderer to see this plugin's timestamped row; this plugin does not alter another plugin's configuration.

## Development

```sh
npm install --ignore-scripts
npm run typecheck
npm test
```

## License

MIT

# Paseo Timestamps

Localized timestamps alongside Paseo user and assistant messages.

> **Experimental replacement renderer, not a native footer.** This version uses the public Paseo 0.13.2 Markdown component. It does not guarantee native styling, action or attachment parity. See the [feasibility notes](docs/feasibility.md) for the original API investigation and current scope.

![Illustrative light and dark preview](assets/preview.svg)

*Illustrative layout, not a product screenshot. Colors follow your Paseo theme.*

## Try the experimental renderer

Requires Paseo 0.13.2 or later and enabled plugins:

```sh
paseo plugin install /path/to/paseo-timestamps
```

## What to expect

The plugin adds localized date and time labels to both user and assistant messages. Today and yesterday use localized relative labels; other dates use the locale's medium date format. User text remains selectable plain text in a right-aligned, theme-colored bubble. Assistant text is passed unchanged to Paseo's own themed Markdown component, with the host's streaming reveal hook.

The public SDK does not expose native message components, so timestamps require replacement message renderers. Consequently, exact native layout and feature parity is not guaranteed: actions, attachments, special content, and streaming presentation can differ. The SDK transformer may not expose attachment metadata, in which case this plugin cannot render those attachments. Invalid timestamps leave the message visible without a timestamp.

Client-only: no backend, credentials, analytics, or additional network requests.

## Development

```sh
npm ci --ignore-scripts
npm run lint
npm run build
npm run typecheck
npm test
```

## License

MIT

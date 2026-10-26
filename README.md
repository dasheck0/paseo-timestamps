# Paseo Timestamps

Small timestamps for user and assistant messages. Local time, readable text, and room to breathe.

![Illustrative light and dark preview](assets/preview.svg)

*Illustrative preview with sample messages. Colors follow your Paseo theme.*

## Install

Requires **Paseo 0.12.0 or later** on both the daemon and client, with plugins enabled.

```sh
paseo plugin install git:dasheck0/paseo-timestamps --ref v0.1.1
```

This installs directly from GitHub. The plugin is not listed in Paseo's registry. To remove it: `paseo plugin remove paseo-timestamps`.

## What you get

- A subtle local-time label below each text message, with the full date available to assistive technology.
- User bubbles aligned right and assistant replies aligned left, in light, dark, and compact layouts.
- Original message text and Paseo's paced assistant streaming. History uses the message timestamp supplied by Paseo; invalid dates show no time.

Client-only: no backend, credentials, analytics, or additional network requests. Paseo's normal provider traffic is unchanged.

## Before you install

Paseo's timeline API replaces a message instead of decorating its native row. In this minimal version, **Markdown is shown as source text**, and native copy, rewind, and other row actions are unavailable on replaced messages. Text remains selectable.

Empty messages and standalone base64 `data:` payloads stay native. **Mixed text-and-attachment messages can lose their native attachment preview** because the transform API does not expose that metadata. Remove this plugin to restore native rendering; it does not rewrite message history.

The first matching timeline transformer wins. If another plugin, including Chat Polish, already renders assistant replies, turn off its overlapping renderer to see these timestamps. This plugin does not change other plugins' settings.

## Development

Node 22 or later:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
```

SDK types are pinned to Paseo 0.12.0. Tests cover transforms, streaming/completion, invalid dates, timezone boundaries, compact and theme variants, and teardown. Rendering tests mock the native primitives and streaming hook; they do not replace device testing.

GitFlow: `feature/*` → `develop` → `release/*` → `main`, with release tags on `main` and merges back into `develop`.

Built against the [official plugin API](https://paseo.sh/docs/plugins/reference#timeline-items). MIT licensed.

# Changelog

## 1.0.0 — 2026-10-27

- Require the public Paseo SDK 0.13.2; no patched client is needed.
- Render assistant Markdown through Paseo's host component instead of displaying Markdown source.
- Keep user text selectable in a distinct theme-colored bubble.
- Add localized today/yesterday labels and local dates for older or future messages.
- Add linting, TypeScript compilation, renderer/transform tests, and package checks.

Replacement rendering still does not provide full native action, style, or attachment parity. See [limitations](docs/feasibility.md).

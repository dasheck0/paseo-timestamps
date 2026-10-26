# Native timestamp footers: feasibility

**Status: blocked by the public plugin API. The repository contains a working replacement-renderer prototype, not the requested solution that preserves native messages.**

The intended behavior is to keep Paseo's original user and assistant message rendering, custom styles, Markdown, attachments and actions intact, adding only a localized date and time below it. Dates should use the user's locale and local calendar: today, yesterday, or a formatted date.

## Evidence

The installed `@getpaseo/plugin` 0.12.0 types provide `addTimelineTransformer` and `addTimelineRenderer`. A renderer receives the source `timestamp: Date`. A transformer either returns `undefined` to keep a native message or returns plugin items that replace it. It cannot return the original native row alongside a footer. There is no native-message render callback or message-footer registration in the checked API.

The current official source confirms the [replacement-only transform result](https://github.com/getpaseo/paseo/blob/e3bbed3c73fac7cbd2b5e340037ff6a9201206b8/packages/plugin/src/contracts.ts) and [host timeline projection](https://github.com/getpaseo/paseo/blob/e3bbed3c73fac7cbd2b5e340037ff6a9201206b8/packages/app/src/plugins/timeline/projection.ts). See also the [official timeline API reference](https://paseo.sh/docs/plugins/reference#timeline-items).

Paseo 0.12 does not export a host Markdown component to plugins. Newer documentation describes one, but rendering Markdown alone still would not preserve all native message styles, attachments and actions. Rebuilding native messages is not equivalent to decorating them.

## What was verified

The prototype typechecks against SDK 0.12.0 and passes 15 tests covering transforms, streaming/completion forwarding, timestamp formatting, invalid dates, timezone boundaries, mocked native rendering and teardown. It loaded successfully in Paseo and displayed timestamps on both roles. Source and Git history were scanned with Gitleaks without findings.

Those results verify the prototype. They do not satisfy the native-rendering acceptance requirement. The plugin was disabled after that requirement was established. No message history is rewritten by the plugin; disabling it restores native rendering.

## What is needed

Paseo must expose a supported footer or decoration slot around its existing message renderer. The host should retain ownership of the original body and actions and pass the source timestamp, role, locale and layout to the footer contribution. Localized calendar dates can then be added without replacing the message.

No DOM patch or private app import is included as a workaround. No upstream issue or pull request has been submitted on the user's behalf.

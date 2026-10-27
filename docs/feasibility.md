# Rendering and API constraints

## Current implementation

The plugin uses the **published Paseo SDK 0.13.2**: `addTimelineTransformer`, `addTimelineRenderer`, the host `Markdown` component, and `useRevealedText`. It requires no client patch, private app import, or DOM modification.

A transformer returns plugin rows that replace the source message. Returning `undefined` leaves the original native row in place. The renderer receives the source `timestamp: Date` from the host; the plugin never creates a substitute timestamp.

Assistant text goes through the host's Markdown renderer and reveal hook. User text remains selectable plain text in a right-aligned, theme-colored bubble. Source text is not rewritten or persisted by the plugin.

## Deliberate limitations

- The public SDK does not export native `UserMessage` / `AssistantMessage` components or a native-message footer slot. Rebuilding a row does not preserve every native style, font setting, action, or attachment feature.
- Native copy/rewind actions are not recreated. Text selection is not equivalent to retaining all row actions.
- Attachment/image metadata may be omitted from transformer input. Exposed unsupported payloads can be left native, but a mixed text-and-attachment row without that metadata cannot be detected reliably. Its attachment previews can be lost.
- User-bubble styling uses the subset of theme colors exposed to plugins. Exact matching to native or custom styles is not guaranteed.
- Another matching timeline transformer may take precedence.
- Relative day labels are calculated when rendered; an idle view is not guaranteed to update automatically at midnight.

If complete native behavior is required, leave the plugin off. Removing it restores the host renderer without changing conversation history.

## Earlier investigation

SDK 0.12 did not export a public Markdown component. A local footer API was prototyped in a separate Paseo checkout, but it is **not used or required by this plugin** and is not part of the published SDK. Updating Paseo alone does not make that experimental API public.

Supporting a true native footer would require an official host extension. The current distributable deliberately uses the supported replacement API instead.

Reference: [official plugin timeline API](https://paseo.sh/docs/plugins/reference#timeline-items). Public SDK declarations are the compatibility baseline; newer documentation may describe APIs absent from older releases.

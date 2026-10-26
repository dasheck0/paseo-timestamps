Paseo Timestamps adds small local-time labels to user and assistant text messages. User bubbles sit on the right and assistant replies on the left, using the current theme and compact layout. The full date is available to assistive technology.

Requires Paseo 0.12.0 or later on the daemon and client, with plugins enabled. It uses Paseo's source timestamps and assistant text reveal hook. Invalid dates show no time. The client contribution makes no additional network requests and has no backend or account setup; Paseo's normal provider traffic is unchanged.

The timeline API requires replacing native message rows. This version displays Markdown as source text and does not retain native row actions. Empty messages and standalone base64 data payloads stay native. Mixed text-and-attachment messages may lose their native attachment preview because that metadata is unavailable to the transformer. Removing the plugin restores native rendering without changing history.

Other plugins that transform the same message types can take precedence. Disable their overlapping renderer to use these timestamped rows.

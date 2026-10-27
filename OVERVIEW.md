Paseo Timestamps displays a localized date and time with user and assistant messages. It uses Paseo's public timeline transformer and Markdown renderer APIs (SDK 0.13.2+), not a custom host extension.

Because the public SDK does not expose native user/assistant message components, the plugin replaces those message rows. User text stays plain and selectable in a theme-colored bubble; assistant text is passed unchanged to Paseo's themed Markdown component. Dates use local calendar time, with localized today/yesterday labels and a medium date otherwise. Invalid timestamps do not hide message content.

This replacement does not guarantee parity with every native message feature: native actions, attachments, special content, layout details, and assistant streaming presentation may differ. Attachment metadata unavailable to the public transformer cannot be reproduced. No backend, credentials, analytics, or additional network requests are used.

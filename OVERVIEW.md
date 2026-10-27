Paseo Timestamps displays localized dates and times with user and assistant messages. It requires Paseo 0.13.2 or later on both client and daemon, with plugins enabled. No account or additional service is needed.

Because the public SDK does not expose native user/assistant message components, the plugin replaces those message rows. User text stays plain and selectable in a theme-colored bubble; assistant text is passed unchanged to Paseo's themed Markdown component. Dates use local calendar time, with localized today/yesterday labels and a medium date otherwise. Invalid timestamps do not hide message content.

This replacement does not guarantee parity with every native message feature: native actions, attachments, special content, layout details, and assistant streaming presentation may differ. Attachment metadata unavailable to the public transformer cannot be reproduced. No backend, credentials, analytics, or additional network requests are used.

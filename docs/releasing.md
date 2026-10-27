# Release checklist

This document prepares a release; it does not authorize publishing one.

## 1. Select the release

- Start from the reviewed, merged `develop` commit and follow the repository's GitFlow release branch process.
- Choose an unused version and tag. **`v0.1.0` and `v0.1.1` already exist. Do not move or reuse them.** The current manifest version alone does not mean this implementation has been released.
- Update `package.json` and the root package version in `package-lock.json` together. Move the relevant `Unreleased` changelog entries under the selected version.
- Keep the minimum Paseo requirement aligned with the public SDK APIs actually used. Current minimum: 0.13.2, client and daemon.

## 2. Run automated checks

```sh
npm ci --ignore-scripts
npm run lint
npm run build
npm run typecheck
npm test
TZ=Europe/Berlin npm test
TZ=America/Los_Angeles npm test
npm run check:package
npm audit
git diff --check
```

Review audit findings rather than applying breaking automatic upgrades. A development dependency finding is not proof of a runtime exploit, but it still needs a recorded disposition before release.

Inspect the package listing for missing source modules, tests, local paths, credentials, and agent state. `build` emits a compilation check into ignored `dist/`; Paseo loads and bundles the source entry point, not that directory. Dependency installation must keep `--ignore-scripts`.

Ensure GitHub Actions passes on the exact release commit. Local results do not establish remote CI success.

## 3. Manually test the public client

Use an unpatched Paseo client and daemon, with other message-transforming plugins disabled for the test:

- Both user and assistant history messages show their source date and time.
- Streaming completes without duplicate rows, truncated content, or a lost final response.
- Headings, emphasis, links, code blocks, and tables render as Markdown for assistant responses; user input stays literal text.
- Check light/dark themes, a narrow viewport, long words, multiline text, text selection, and the full accessible date label.
- Verify today/yesterday labels and older dates in at least two locales and around a local calendar boundary.
- Exercise attachments and confirm the documented preview limitations are acceptable. Do not claim native action or custom-style parity.
- Remove the plugin and verify native rendering returns with unchanged history.
- Label illustrative artwork accurately; only label real captures as screenshots.

The automated renderer tests mock host components. They do not certify device behavior. Earlier browser tests of a separate patched host footer do not certify this public replacement renderer.

## 4. Publish only after approval

- Merge the reviewed release branch following GitFlow; tag the intended release commit on `main` and merge back into `develop`.
- Update the README installation command to the new immutable tag and verify installation from that tag in a fresh test environment.
- Publish release notes that include the minimum Paseo version and replacement-renderer limitations.
- Git-based Paseo installation does not require an npm publication. Treat npm publication, marketplace listing, and GitHub release creation as separate explicit decisions.

Do not embed credentials or personal configuration in any release asset.

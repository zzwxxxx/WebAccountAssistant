# Repository Guidelines

## Project Structure & Module Organization

This repository contains a built Chrome Extension for "账号管理助手". Key entry points:

- `.my/ai/plans/`: AI-generated implementation plans and design notes. When planning work before implementation, write the plan files here.
- `manifest.json`: Manifest V3 configuration, permissions, action popup, background worker, and content scripts.
- `background.js`: Service worker for install-time initialization and `GET_APP_CONFIG` / `SAVE_APP_CONFIG` message handling.
- `content.js` and `page-guard.js`: Page-level scripts injected into matching sites.
- `popup.html` with `assets/popup.js` and `assets/popup.css`: Browser action popup UI.
- `extension.html` with `assets/extension.js` and `assets/extension.css`: Full configuration UI.
- `auth.html` with `assets/auth.js`: Extension-origin WebAuthn verification for sensitive operations.
- `assets/vault.js` and `assets/security-gate.js`: Sensitive field encryption helpers and 1-minute unlock gate.
- `assets/storage.js`: Shared storage helpers. App data is stored in `chrome.storage.local` under the `appConfig` key.

There is no `src/`, `tests/`, or package metadata in this checkout; files appear to be distribution artifacts.

## Build, Test, and Development Commands

No build scripts are present. Use Chrome's extension loader for local development:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked" and select this repository directory.
4. Use the extension card's reload button after editing files.

Helpful manual inspection commands:

- `rg "appConfig" .`: Find storage read/write paths.
- `rg --files`: List tracked project files.

## Coding Style & Naming Conventions

Keep edits scoped and preserve the current built-file style. JavaScript files in `assets/` are minified ES modules; avoid broad formatting changes unless regenerating the full build from source. Use `camelCase` for JavaScript identifiers and descriptive Chrome message names such as `GET_APP_CONFIG`. CSS classes use the `wm-` prefix and BEM-like modifiers, for example `wm-btn--primary`.

## Testing Guidelines

No automated test framework is configured. Validate changes manually in Chrome:

- Load the unpacked extension.
- Open the popup and configuration page.
- Add, edit, delete, import, and export account configuration where relevant.
- Verify target-page injection on a representative login page.
- Check the service worker console for runtime errors.

For storage-related changes, inspect data with:

```js
chrome.storage.local.get("appConfig").then(console.log)
```

## Commit & Pull Request Guidelines

This directory is not currently a Git repository, so no local commit history is available. Use concise, imperative commit messages, for example `Add account import validation` or `Fix popup account selection`. Pull requests should include a behavior summary, manual test steps, screenshots for UI changes, and notes about permission or storage schema changes.

## Security & Configuration Tips

Account values are stored locally in `chrome.storage.local` as part of `appConfig`. Sensitive account fields are encrypted at rest with the extension vault and appear as `__waaEncrypted` objects after migration. The vault uses a public key for write-time encryption, so add/edit/import can save encrypted sensitive values without unlocking after the first setup; viewing sensitive values and exporting decrypted JSON require the plugin passkey unlock. Do not commit exported account JSON, vault records, or real credentials. If changing sync behavior, document the remote endpoint, object key, and failure handling clearly.

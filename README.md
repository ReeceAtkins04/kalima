# Kalima · كلمة

A quiet, offline-first Arabic vocabulary trainer. Warm parchment in daylight,
deep green at night, with two starter decks (Modern Standard Arabic and
Qur'anic frequency), SM-2 lite scheduling, a full word manager, and CSV
import/export.

Built with Tauri 2, Rust, Svelte 5, and TypeScript. Designed phone-first in
portrait, with the UI chrome in English and the vocabulary in Arabic.

## Development

```bash
npm install
npm run dev      # http://localhost:1420
npm run check    # svelte-check
npm run smoke    # Playwright flow against the dev server
```

`npm run shots` regenerates the phone-sized screenshots in `shots/`.

Rust storage lives in `src-tauri/src/lib.rs` and uses two commands,
`load_library` and `save_library`, backed by an atomic `library.json` write in
the app data directory. The browser build falls back to `localStorage`; native
runs mirror the library to both.

## Android

The APK is built by GitHub Actions in `.github/workflows/android.yml` on pushes
to `main`, tags, or manual dispatch. Download `kalima-android-apk` from the run
summary, then install it over USB:

```bash
adb install -r app-universal-release.apk
```

The workflow needs three repository secrets:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 of `kalima-release.jks` |
| `ANDROID_KEY_ALIAS` | `kalima` |
| `ANDROID_KEYSTORE_PASSWORD` | Password from `.signing/README.txt` |

The one-time release keystore and its password live in the gitignored
`.signing/` directory. Back that directory up somewhere safe: Android only
accepts updates signed with the same key.

## CSV format

Import files with a header row. Only `arabic` and `english` are required.

```csv
arabic,transliteration,english,notes
شَمْس,shams,sun,Root: ش-م-س
```

UTF-8 with or without a BOM is accepted. Export writes a BOM so spreadsheet
apps open Arabic correctly.

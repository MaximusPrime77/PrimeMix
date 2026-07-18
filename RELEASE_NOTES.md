# PrimeMix 1.0.0

PrimeMix 1.0.0 is the first public-ready release of the local-first ambient sound mixer by Maximus Prime Software.

## Highlights

- Play and mix up to three sounds at once.
- Control track volume independently with smooth fades.
- Use sequential playlist mode for focused listening.
- Save, restore, import, and export personal mixes.
- Mark sounds as favorites and filter the library.
- Use integrated sleep and Pomodoro timers.
- Switch to a compact always-on-top mini player.
- Customize sound titles, categories, and cover artwork.
- Switch instantly between English and Turkish.
- Control playback from the Windows system tray and media keys.

## Security and reliability

- Upgraded to Electron 43.1.1 and electron-builder 26.15.3.
- Added renderer sandboxing and context isolation.
- Added a restrictive Content Security Policy.
- Removed inline event handlers and unsafe user-data rendering.
- Restricted local media access to the active sound directory.
- Added IPC sender, filename, URL, and path validation.
- Added atomic, queued metadata writes.
- Added structured validation for imported mix files.
- Added single-instance behavior and external navigation blocking.
- Added automated syntax, JSON, CSP, and security-boundary checks.

## Audio distribution policy

Official PrimeMix packages do not include third-party audio.

Users can import audio they created or are authorized to use. Future bundled audio must have complete license records and must be original, CC0 1.0, or covered by explicit written redistribution permission.

See `AUDIO_SOURCING_GUIDE.md` and the `licenses/` directory for the project policy and evidence format.

## Distribution

The release produces:

- `PrimeMix-1.0.0-win.zip`
- `PrimeMix 1.0.0.exe`

Both targets are designed for 64-bit Windows. The ZIP edition is recommended for predictable startup and transparent file placement.

## Verification

The release was validated with:

```powershell
npm run check
npm audit
npm run build
```

Expected security audit result:

```text
found 0 vulnerabilities
```

## Publisher

**Maximus Prime Software**

Developed by **Maximus Prime**

- GitHub: [@MaximusPrime](https://github.com/MaximusPrime)
- Organization: [@MaximusPrimeSoftware](https://github.com/MaximusPrimeSoftware)
- Website: [maximusprimesoftware.pages.dev](https://maximusprimesoftware.pages.dev/)
- Email: [b.maximus.prime@gmail.com](mailto:b.maximus.prime@gmail.com)
- Studio email: [maximusprimesoftware@gmail.com](mailto:maximusprimesoftware@gmail.com)

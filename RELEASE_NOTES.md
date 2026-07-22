# PrimeMix v1.0.0 Release Notes

> **PrimeMix v1.0.0** is the first official public release of the local-first, privacy-focused ambient sound mixer for Windows by Maximus Prime Software.

---

## 🚀 Highlights

- **Multi-Track Ambient Mixer:** Mix up to 3 ambient sounds simultaneously with individual volume sliders and smooth fade-in/fade-out transitions.
- **Bring Your Own Audio (BYOA):** Seamlessly import your own local audio files (MP3, WAV, OGG, FLAC, M4A) with real-time sound folder synchronization.
- **Focus & Sleep Timers:** Integrated 25/5 Pomodoro focus timer and customizable Sleep Timer (15 minutes to 2 hours) with automatic gradual fade-out.
- **Compact Mini Player:** Always-on-top compact mini player mode for uninterrupted workflow.
- **Preset Mix Import & Export:** Save custom sound combinations, export them as JSON presets, and restore them anytime.
- **Windows System Tray & Media Controls:** Background tray minimization, system tray controls, and global media key integration.
- **Bilingual Interface:** Instant switching between English and Turkish languages.
- **100% Privacy & Local-First:** No accounts, no cloud dependency, no telemetry—everything stays on your device.

---

## ✨ Features & Capabilities

### 🎛️ Sound Management & Audio Library
- **Independent Channel Controls:** Adjust track volumes individually or toggle mute on active sounds.
- **Playlist Mode & Filtering:** Filter sound libraries by category, perform real-time search, and play tracks sequentially.
- **Editable Metadata & Artwork:** Customize sound titles, categories, and cover images directly within the app.
- **Favorites System:** Mark sounds as favorites for instant access.

### ⏱️ Timers & Productivity
- **Pomodoro Focus Timer:** Pre-configured 25-minute work / 5-minute break cycle to boost concentration.
- **Sleep Timer:** Gradually fades out audio before stopping playback to help you fall asleep peacefully.

### 🖥️ Desktop & Window Integration
- **Mini Player:** Sleek, minimal UI option designed to stay visible without cluttering your screen.
- **Startup Option:** Launch PrimeMix automatically with Windows startup.
- **Global Media Keys:** Play, pause, and control playback using hardware keys.

---

## 🛡️ Security, Reliability & Architecture

- **Modern Tech Stack:** Built with Electron 43.1.1 and electron-builder 26.15.3.
- **Hardened Security Boundary:** Context isolation, renderer sandboxing, and strict IPC validation layer.
- **Restrictive Content Security Policy (CSP):** Disabled inline event handlers and restricted external resources.
- **Local File Security:** Enforced local media access boundaries and path containment checks.
- **Atomic Persistence:** Safe, atomic metadata queue writes to prevent state corruption.

---

## 📁 Audio Licensing Policy

Official PrimeMix distribution packages **do not bundle third-party audio tracks**.
- Users can freely import audio files they own or are authorized to use.
- Future bundled audio will adhere strictly to CC0 1.0 or explicit written commercial redistribution licenses.
- See [`AUDIO_SOURCING_GUIDE.md`](AUDIO_SOURCING_GUIDE.md) and [`licenses/`](licenses/) for complete project licensing rules and evidence standards.

---

## 📦 Distribution & Installation

PrimeMix v1.0.0 is packaged for 64-bit Windows in two distribution formats:

- **`PrimeMix-1.0.0-win.zip`** — Recommended portable folder archive. Extract and run `PrimeMix.exe`.
- **`PrimeMix 1.0.0.exe`** — Standalone single-file portable executable.

### 💻 System Requirements
- **OS:** Windows 10 or later (64-bit)
- **Dependencies:** None (Fully self-contained)

---

## 👥 Publisher & Contact

**Maximus Prime Software**  
Designed and developed by **Maximus Prime**

- **Official Website:** [maximusprimesoftware.pages.dev](https://maximusprimesoftware.pages.dev/)
- **Product Page:** [PrimeMix on Maximus Prime Software](https://maximusprimesoftware.pages.dev/projects/primemix/)
- **GitHub Repository:** [MaximusPrime/PrimeMix](https://github.com/MaximusPrime/PrimeMix)
- **Contact / Support:** [maximusprimesoftware@gmail.com](mailto:maximusprimesoftware@gmail.com)

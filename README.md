# Lupine

A full-featured podcast desktop player with complete [Podcasting 2.0](https://podcastindex.org) namespace support.

Built with Electron + React + TypeScript.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## Features

### Podcasting 2.0 Support
- **Chapters** - Navigate episodes with rich chapter markers
- **Transcripts** - Read along with synchronized transcripts
- **Soundbites** - Discover highlight clips from episodes
- **Value for Value** - View Lightning payment recipients and splits
- **People** - See hosts, guests, and contributors
- **Location** - Discover podcasts by geographic location
- **Alternate Enclosures** - Multiple audio/video formats
- **Live Items** - Live streaming support
- **Social Interact** - Social media links per episode
- **Funding** - Direct support links for creators

### Player
- Play/pause, seek, volume control
- Playback speed (0.5x - 2x)
- Episode queue
- Chapter navigation
- Transcript scrolling sync

### Cross-Platform
| Format | Windows | macOS | Linux |
|--------|---------|-------|-------|
| Installer | `.exe` (NSIS) | `.dmg` | `.deb`, `.rpm` |
| Portable | `.exe` (portable) | - | `AppImage` |
| Package | - | - | Snap |

## Install

### Download

Grab the latest release for your platform from [Releases](https://github.com/realgoldfang/Lupine/releases).

### macOS Gatekeeper Warning

The macOS `.dmg` is **unsigned** (no Apple Developer certificate). macOS will block it by default. To open:

1. Download the `.dmg`
2. Right-click (or Control-click) the `.dmg` file and select **Open**
3. Click **Open** in the dialog

Or go to **System Settings > Privacy & Security** and click **Open Anyway** next to the blocked message.

### Build from Source

```bash
# Clone
git clone https://github.com/realgoldfang/Lupine.git
cd Lupine

# Install dependencies
npm install

# Development
npm run dev              # Web only
npm run electron:dev     # Full desktop app

# Build for your platform
npm run build:win        # Windows .exe
npm run build:mac        # macOS .dmg
npm run build:linux      # All Linux formats

# Build all platforms (requires CI)
npm run build:all
```

### All Build Commands

```bash
# Windows
npm run build:win            # .exe installer (NSIS)
npm run build:win:portable   # Portable .exe

# macOS
npm run build:mac            # .dmg disk image (unsigned)

# Linux
npm run build:linux          # All formats
npm run build:appimage       # Portable AppImage
npm run build:deb            # Debian/Ubuntu
npm run build:snap           # Snap Store

# All platforms
npm run build:all
```

## Usage

1. **Add a podcast** - Click "Discover" and paste an RSS feed URL
2. **Browse episodes** - Scroll through the episode list
3. **Play** - Click play on any episode
4. **Features** - Click the icons in the player for chapters, transcripts, or V4V info
5. **Queue** - Add episodes to your queue for continuous playback

## Tech Stack

- [Electron](https://www.electronjs.org/) - Desktop shell
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - RSS/XML parsing

## Podcasting 2.0 Tags

Lupine supports all formalized tags from the [podcast namespace](https://github.com/Podcastindex-org/podcast-namespace):

| Tag | Description |
|-----|-------------|
| `podcast:chapters` | External chapter data |
| `podcast:transcript` | Episode transcripts |
| `podcast:soundbite` | Highlight clips |
| `podcast:person` | Hosts, guests, credits |
| `podcast:location` | Geographic tagging |
| `podcast:season` | Named seasons |
| `podcast:episode` | Episode numbering |
| `podcast:trailer` | Season trailers |
| `podcast:license` | Content licensing |
| `podcast:alternateEnclosure` | Multiple formats |
| `podcast:guid` | Unique feed identifier |
| `podcast:value` | V4V payment info |
| `podcast:medium` | Content medium type |
| `podcast:liveItem` | Live streams |
| `podcast:socialInteract` | Social links |
| `podcast:block` | Platform blocking |
| `podcast:funding` | Support links |
| `podcast:locked` | Feed locking |
| `podcast:txt` | Custom metadata |
| `podcast:remoteItem` | Cross-references |
| `podcast:podroll` | Recommended shows |
| `podcast:updateFrequency` | Release schedule |
| `podcast:podping` | Update notifications |
| `podcast:chat` | Live chat info |
| `podcast:publisher` | Publisher info |
| `podcast:image` | Multiple image formats |

## CI/CD

GitHub Actions builds for all platforms and creates a GitHub Release automatically on tag push:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers:
1. **Build** - Linux (AppImage, deb, rpm, snap), Windows (NSIS, portable), macOS (.dmg) run in parallel
2. **Release** - All artifacts are uploaded to a new GitHub Release with auto-generated notes

Manual builds (via `workflow_dispatch`) produce artifacts but do not create a release.

### Release Artifacts

| Platform | Files |
|----------|-------|
| Windows | `Lupine Setup *.exe` (NSIS installer), `Lupine *.exe` (portable) |
| macOS | `Lupine-*.dmg` (unsigned, see Gatekeeper note above) |
| Linux | `Lupine-*.AppImage`, `lupine_*.deb`, `lupine-*.rpm`, `lupine_*.snap` |

See [`.github/workflows/build.yml`](.github/workflows/build.yml) for configuration.

## License

MIT © Nathan Stallings

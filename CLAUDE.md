# rpg-soundboard

An Electron + React app for managing and playing audio groups during tabletop RPG sessions.

## Commands

```bash
npm run dev          # Start electron-vite dev server + Tailwind watcher (runs both in parallel)
npm test             # Run all vitest tests
npm run lint         # ESLint with auto-fix
npm run typecheck    # TypeScript check for both node and web tsconfigs
npm run build        # Typecheck + electron-vite build
```

## Architecture

### Process Separation

- **Main process** (`src/main/`) — Electron, registers the `aud://` protocol, handles file I/O
- **Preload** (`src/preload/`) — context bridge exposing `window.audio` (Groups, Sounds, Icons) and `window.electronApi` to the renderer
- **Renderer** (`src/renderer/src/`) — React UI, accesses backend exclusively through `window.audio`
- **APIs** (`src/apis/`) — backend logic; runs in the main process, never imported directly by the renderer

### Custom `aud://` Protocol

Audio files stored in app data are referenced with `aud://board-data/grp-<id>/<n>.mp3`. The protocol handler streams them from disk. Files are stored under `<AppData>/rpg-soundboard/board-data/<groupID>/`.

### AudioConfig Singleton

`src/apis/audio/utils/config.ts` exports an `AudioConfig` singleton. All reads and writes to the persisted board state go through `AudioConfig.Config` (getter/setter). The setter triggers a save to disk.

### Group Types

Groups have a `type` field:
- `'source'` — plays audio files directly (Default, Rapid, Looping variants)
- `'sequence'` — plays an ordered list of groups and delays

Variants: `Default`, `Rapid`, `Looping`, `Soundtrack`, `Sequence`.

### Sound Containers

`src/renderer/src/utils/soundContainer/` contains runtime playback wrappers. Each variant (looping, rapid, sequence) has its own container class implementing `ISoundContainer`.

## Testing

Tests use **Vitest** with two projects (defined in `vitest.config.ts`):

| Project | Root | Environment |
|---------|------|-------------|
| `api` | `src/apis` | node |
| `frontend` | `src/renderer` | happy-dom |

### Gotchas

- **The linter moves test files into `__tests__/` subdirectories.** If you write a test file co-located with its source (e.g., `foo.test.ts` next to `foo.ts`), the linter will move it to `__tests__/foo.test.ts`. All `vi.mock(...)` and `import` paths inside the test file must use the `__tests__/`-relative depth — each moved file gains one extra `../` in its relative paths.
- **`vi.mock` path is relative to the test file, not the source file.** After the linter move, paths like `'./config'` become `'../config'` and `'../../../utils/paths'` become `'../../../../utils/paths'`.
- **Setter spying pattern:** To assert that `AudioConfig.Config` is called with specific values, use `vi.spyOn(AudioConfig, 'Config', 'set')` *after* dynamically importing the mocked module inside an `async` test.

## Key Conventions

- **IDs** use branded string types (e.g., `GroupID`, `SequenceElementID`) prefixed with their type: `grp-<uuid>`, `seq-<uuid>`.
- **Effect file names** inside a group directory are sequential integers: `1.mp3`, `2.mp3`, etc.
- **Empty props types** (`type FooProps = {}`) should not be created — remove them along with unused `props` parameters.
- **Exported symbols** in `src/apis/` that appear unused may be consumed via the `window.audio` bridge — check the preload and `audioApi.ts` before removing them.

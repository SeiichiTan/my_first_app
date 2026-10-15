# Copilot instructions for Sky Hop

## Project overview

This repository is a small browser game built with plain HTML, CSS, and JavaScript. It is intentionally lightweight and does not use a framework, bundler, or package manager.

The app is centered around a single canvas-based runner game:
- `index.html` defines the page structure and game UI.
- `style.css` contains the visual design for the layout, HUD, and buttons.
- `game.js` contains the rendering loop, physics, collision logic, input handling, and score updates.

The game loop runs via `requestAnimationFrame`, and the main state is kept in a few variables (`state`, `obstacles`, `distance`, `speed`, `player`) rather than a formal game-engine architecture.

## Commands

There is no package.json, no test runner, and no lint/build pipeline configured in this repository.

Use the following workflow for local validation:

```bash
cd /workspaces/my_first_app
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser to manually verify gameplay.

If you need a quick smoke check for changes in the browser UI or game behavior, open `index.html` directly or use a tiny static server as above.

There are no automated unit tests to run. If a future PR adds a test setup, prefer the project’s documented command and keep the change scoped to the repo’s existing toolchain.

## Architecture notes

This app is a classic single-file game MVP. The code is organized by concern, not by modules:

- Canvas drawing lives in functions such as `drawBackground()`, `drawPlayer()`, and `drawObstacle()`.
- Game state updates happen in `update(delta)`.
- Input is handled with `keydown`, `pointerdown`, and button click listeners.
- The screen and UI state are toggled by `showMessage()` and the `state` string (`"ready"`, `"playing"`, `"over"`).

When making changes, keep gameplay logic in `game.js` and avoid splitting the app into a framework-heavy structure that does not match the repository’s minimal architecture.

## Conventions specific to this repo

- Prefer minimal, dependency-free JavaScript; this project intentionally avoids build tooling.
- Preserve the existing browser-first design: canvas rendering + DOM HUD text/buttons.
- Use direct DOM queries (`document.querySelector(...)`) and canvas APIs instead of introducing a library or abstraction layer.
- Keep the game physics deterministic and simple: gravity, jump velocity, spawn gap, and collision checks are all handled in a straightforward way.
- If adding features, stay aligned with the current MVP style described in `README.md` (for example: simple obstacle patterns, score tracking, and restart flow).
- Treat `game.js` as the central place for gameplay behavior; avoid scattering game logic across HTML or CSS.

## Project-specific documentation

The repo’s README describes the app as a Japanese-language, canvas-based side-scrolling action game MVP and calls out the current intended expansion areas: obstacle variety, sound effects, and best-score persistence.

When adding functionality, prefer changes that remain consistent with that MVP direction rather than introducing a larger app architecture.

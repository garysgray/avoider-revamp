
| ![Game Splash](Avoider-Game-HTML5-master/assets/sprites/avoider_logo.png) |
|:-----------------------------------------------------------------------:|

# Avoider Game (Revamped)

A rebuilt version of the original HTML5 avoider game.
Modular, cleaner, and designed to be easier to extend.

Built with **vanilla JS** and **Canvas**.
Runs directly in modern browsers (Chrome, Firefox, Edge) — no build step needed.

---

## Setup / How to Run
- Clone or download the repository
- Open the folder and launch `index.html`
- The game runs directly in the browser

---

## How to Play

| Action        | Input                        |
|---------------|------------------------------|
| Start Game    | Space Bar                    |
| Move Ship     | Mouse                        |
| Fire          | Mouse Button or Space Bar    |
| Fullscreen    | F                            |
| Restart       | Space Bar (after game over)  |

### Power-Ups

| Sprite     | Effect                                             |
|------------|----------------------------------------------------|
| Fire Orb   | Grants ammo — switches ship to SHOOT mode          |
| Ghost Orb  | Activates SHIELD — brief invincibility             |
| Ultra Orb  | Activates ULTRA — ship destroys enemies on contact |

---

## Player States

| State  | Description                                   | Visual Effect              |
|--------|-----------------------------------------------|----------------------------|
| AVOID  | Default — dodge enemies, no ammo              | Blue engine exhaust glow   |
| SHOOT  | Has ammo — can fire projectiles               | Orange/red fire glow       |
| SHIELD | Invincible for a short duration               | Blue-white radial aura     |
| ULTRA  | Destroys enemies on contact                   | Purple burst + electric ring |
| DEATH  | Player hit — triggers lose state              | Skull sprite               |

---

## Project Structure

```
Avoider-Game-HTML5-master/
├── index.html
├── README.md
│
├── css/
│   └── style.css
│
└── JS/
    ├── main.js
    │
    ├── classes/
    │   ├── AudioPlayer.js
    │   ├── BillBoard.js
    │   ├── Device.js
    │   ├── GameObject.js
    │   ├── KeyButtonManager.js
    │   ├── Layer.js
    │   ├── NPC.js
    │   ├── ObjectHolder.js
    │   ├── Player.js
    │   ├── Projectile.js
    │   ├── Sprite.js
    │   └── Timer.js
    │
    ├── core/
    │   ├── Game.js
    │   ├── GameConsts.js
    │   ├── GameController.js
    │   └── UpdateGameStates.js
    │
    ├── render/
    │   ├── GameObjectsRenderLayer.js
    │   ├── HudRenderLayer.js
    │   ├── RenderBillBoardsLayer.js
    │   └── TextRenderLayer.js
    │
    ├── settings/
    │   ├── AssetTypes.js
    │   ├── Enums.js
    │   ├── KeysAndButtons.js
    │   └── Texts.js
    │
    ├── systems/
    │   ├── CollisionHandlers.js
    │   ├── NPCLogic.js
    │   └── ProjectileLogic.js
    │
    └── utils/
        ├── CollisionUtilities.js
        ├── DebugUtilities.js
        ├── FullScreenUtilities.js
        ├── PlayerEffects.js
        └── RenderUtilities.js
```

---

## Architecture Overview

- **classes/** — core game object definitions using private fields throughout. `GameObject` is the base for all entities. `ObjHolder` manages all collections. `Layer` wraps render functions for the render pipeline.
- **core/** — `Game` is the central data hub holding all state, collections, and constants. `GameConsts` holds all tunable values. `GameController` owns `Device` and `Game` and drives the update/render cycle. `UpdateGameStates` routes each frame to the correct state handler.
- **render/** — four render layers called in order each frame: backgrounds, game objects, HUD, and text. No game logic — drawing only.
- **settings/** — all immutable definitions in one place. `Enums.js` for game/play/entity states. `AssetTypes.js` for sprite, sound, and timer definitions. `KeysAndButtons.js` for input mappings. `Texts.js` for all UI strings.
- **systems/** — per-frame logic for NPCs, projectiles, and collision response. `CollisionHandlers.js` handles game-state responses to collisions. `CollisionUtilities.js` in utils handles pure math.
- **utils/** — stateless helpers. `CollisionUtilities` for AABB and broad-phase math. `RenderUtilities` for NPC, projectile, and player drawing. `PlayerEffects` for per-state glow effects. `DebugUtilities` for hitbox and panel overlays. `FullScreenUtilities` for fullscreen toggling.

---

## Notable Features

- **Fixed Timestep Loop** — 60fps accumulator pattern in `main.js` with `requestIdleCallback` for smooth startup and tab-visibility reset to prevent delta spikes
- **Modular OOP** — private fields throughout, every file has a single responsibility
- **Collision System** — broad-phase `roughNear()` radius check before precise `rectsCollide()` AABB test, safe reverse-loop removal during iteration
- **Audio Pooling** — `Sound` class pre-loads a configurable pool of `Audio` nodes. Pool cycles with `currentTime = 0` on each play — no cloning, no stacking. `AudioPlayer.requestSound()` supports priority gating to prevent low-priority sounds stomping high-priority ones within a 120ms window
- **Parallax Background** — `CircularParallaxBillBoard` renders two copies of a starfield with seamless wrapping, slow random rotation via lerp, and layered cosmic bloom and vignette effects using Canvas `"screen"` compositing
- **Player Effects** — lazily initialized in `PlayerEffects.js`, keyed by `playStates` value. Each state has a distinct radial gradient glow drawn beneath the player sprite. ULTRA state includes an animated pulsing electric ring driven by `Math.sin(Date.now())`
- **NPC Movement** — movement strategy dispatched internally in `NPC.update()` via switch on `#type`. EYE moves straight down, BUG diagonal left, UFO diagonal right. Speed scaled by `npcSpeedMultiplier`
- **Difficulty Scaling** — survival clock drives NPC speed increases at fixed intervals. Spawn rate tightens as difficulty increases. Both tracked via multipliers in `Game`
- **Timer System** — unified `Timer` class with COUNTDOWN and COUNTUP modes, optional looping, `progress` getter (0-1), and `formatted` getter (M:SS) used for the HUD survival clock
- **Render Pipeline** — ordered `Layer` objects registered in `GameController`, called each frame. Each layer is isolated — a render error in one layer never breaks others
- **Fullscreen** — F key toggles via standard `:fullscreen` CSS, no vendor prefixes
- **Debug Tools** — `DEV_MODE` flag gates all debug features. H key toggles hitbox outlines. Backtick toggles a debug panel showing player position, positioned to the left of the canvas

---

## Known Issues / Planned

- Sprite animations scaffolded but not implemented — `renderClip` uses a static state index
- Touch / mobile controls not yet implemented
- Lives system defined but game is currently single-life
- WIN state defined in enum but handler not yet implemented
- More enemy types and movement patterns planned
- Additional power-up types planned
- Difficulty curve and spawn rates may need tuning
- No asset preload manager — game can theoretically start before all images and sounds are ready
- High scores not persisted — no save system yet

---

## Notes

- Vanilla JS, no frameworks, no build step
- Runs directly in Chrome, Firefox, and Edge
- All magic numbers live in `GameConsts.js` — one place to tune the game
- `Object.freeze` applied to all settings objects at definition time

| ![Game Splash](Avoider-Game-HTML5-master/assets/sprites/AVG_logo.png) |
|:-----------------------------------------------------------------------:|
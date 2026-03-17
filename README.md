| ![Game Splash](Avoider-Game-HTML5-master/assets/sprites/AVG_logo.png) |
|:-----------------------------------------------------------------------:|

| ![Game Splash](Avoider-Game-HTML5-master/assets/sprites/AvoiderSplash.png) |
|:-----------------------------------------------------------------------:|

# Avoider Game (Revamped)

A rebuilt version of the original HTML5 avoider game.  
Modular, cleaner, and designed to be easier to extend.  

Built with **vanilla JS** and **Canvas**.  
Runs directly in modern browsers (Chrome, Firefox, Edge); no build step needed.

---

## Setup / How to Run
- Clone or download the repository.  
- Open the folder and launch `index.html`.  
- The game runs directly in the browser.

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
| Sprite       | Effect                                              |
|--------------|-----------------------------------------------------|
| Fire Orb     | Grants ammo — switches ship to SHOOT mode           |
| Ghost Orb    | Activates SHIELD — brief invincibility              |
| Ultra Orb    | Activates ULTRA — ship destroys enemies on contact  |

---

## Helpers Overview

- **Sprite** — tracks image, loaded state, and dimensions  
- **ObjHolder** — manages collections of objects with optional ordered rendering  
- **Device** — handles drawing, input, and audio playback  
- **KeyManager** — keyboard input tracking  
- **AudioPlayer & Sound** — manage audio assets and pooled playback  
- **Timer** — supports countdowns, countups, and looping for timed events  

---

## Player States

| State   | Description                                        | Visual Effect         |
|---------|----------------------------------------------------|-----------------------|
| AVOID   | Default — dodge enemies, no ammo                  | Blue engine glow      |
| SHOOT   | Has ammo — can fire projectiles                   | Orange/red fire glow  |
| SHIELD  | Invincible for a short duration                   | Blue-white aura       |
| ULTRA   | Destroys enemies on contact                       | Purple electric ring  |
| DEATH   | Player hit — triggers lose state                  | Skull sprite          |

---

## Notable Features

- **Player Controls** — input handling fully contained in `Player.update()`, with built-in canvas bounds checks  
- **Timers** — unified `Timer` class handles shooting cooldowns, shield duration, and game clock  
- **Collision Handling** — early-out checks, center-based hitboxes, and safe removal during iteration  
- **Rendering Layers** — backgrounds, game objects, HUD, and text rendered in separate passes  
- **Ship Effects** — per-state glow effects via `PlayerEffects`, using radial gradients and `"lighter"` compositing  
- **Audio Pooling** — `Sound` class with pool prevents dropped sounds on rapid playback  
- **Parallax Background** — dual-copy vertical scrolling billboard  
- **NPC Movement Strategies** — EYE moves straight down, BUG diagonal left, UFO diagonal right  
- **Difficulty Scaling** — NPC speed and spawn rate increase over time driven by game clock  
- **Fullscreen Support** — press F, scales canvas to fit any screen while preserving aspect ratio  
- **Debug Tools** — toggleable hitbox rendering (H key) and debug panel (` key), dev mode flag  

---

## Recent Updates / Changelog

### Visual Effects
- Per-state ship glow effects added via `PlayerEffects` object
- AVOID state: blue engine exhaust glow
- SHOOT state: orange/red fire glow offset at engine position
- SHIELD state: soft blue-white radial aura with `"lighter"` compositing
- ULTRA state: purple inner burst + animated electric outer ring using `Math.sin(Date.now())`

### Audio
- Background music loops continuously via `playSoundLooping()`
- Music stops cleanly on game over and restarts with new game
- Audio pooling supports overlapping sound effects without drops

### Game Loop
- Fixed timestep game loop at 60fps using accumulator pattern
- `safeStartGame()` ensures canvas is ready before loop begins
- `requestIdleCallback` used for smooth startup where supported

### Input & Player
- Player input moved into `Player.update()` for self-contained logic
- Shooting and shields use internal timers
- Death state freezes player until game handles lose transition

### Timer System
- COUNTDOWN and COUNTUP modes with optional looping
- Shield and shoot cooldowns auto-transition back to correct play state on expiry

### Collision
- Safe object removal while iterating (reverse loop)
- Early-out rough radius check before precise AABB test
- Debug hitboxes for testing

### Architecture
- Removed Jasmine test scaffolding from `Controller` — no longer needed
- Pause state removed — not suited to this style of gameplay
- `PlayerEffects` extracted to its own file, keyed by play state value
- All magic numbers replaced with named constants in `GameConsts`

---

## Known Issues / Future Improvements
- **Animations** — player and NPC sprites are static; animation support is scaffolded but not implemented  
- **Mobile controls** — touch support not yet implemented  
- **More enemy types** — EYE, BUG, UFO exist; new movement patterns and behaviors planned  
- **More power-ups** — shield and shoot exist; additional types planned  
- **UI polish** — HUD is functional but minimal  
- **Balancing** — difficulty curve and spawn rates may need tuning  
- **Lives system** — scaffolded but currently a single-life game over  
- **Win state** — defined but not yet triggered by any condition  

---

## General Notes
- Vanilla JS, no frameworks, no build step  
- Modular OOP with private fields throughout  
- Clear separation of logic, rendering, input, and audio  
- Defensive coding with try/catch ensures errors don't break the game loop  
- Flexible foundation for new mechanics, effects, and enemy types
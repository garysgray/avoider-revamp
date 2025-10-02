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

### Running tests with Jasmine
1. Open `test` folder  and launch `index.html` to execute the Jasmine test suite.
2. The test suite will automatically run and display results for each test case.

---

## Helpers.js Overview

Utility classes that support the game engine:

- **Sprite** – tracks image, loaded state, and dimensions  
- **ObjHolder** – manages collections of objects with optional ordered rendering  
- **Device** – handles drawing, input, and audio playback  
- **KeyManager** – keyboard input tracking  
- **AudioPlayer & Sound** – manage audio assets and playback reliably  
- **Timer** – supports countdowns, countups, and looping for timed events  

These helpers separate core engine tasks from game logic, making it easier to maintain and extend the system.

---

## Notable Features / Highlights

- **Player Controls**: input handling fully contained in `Player.update()`, with built-in canvas bounds checks.  
- **Timers**: unified `Timer` class handles shooting cooldowns, shield duration, and game clock consistently.  
- **Collision Handling**: improved performance with early-out checks, center-based hitboxes, and safe removal during iteration.  
- **Rendering**: center-based rendering for all sprites; supports layers and future sprite animations.  
- **Audio**: `Sound` class with pooling prevents dropped sounds, and `AudioPlayer` centralizes playback.  
- **Debug Tools**: optional hitbox rendering and debug text for testing mechanics.  
- **Game Objects**: `GameObject` superclass with `alive` flag and `kill()` method simplifies object management.  
- **BillBoard & Scrolling**: ready for animated or scrolling backgrounds.  
- **Front-End / CSS**: CSS variables for consistent colors, borders, and responsive scaling; messages are flexbox-centered.  
- **Error Handling**: defensive coding with try/catch and optional chaining prevents crashes from missing assets or states.  

---

## Recent Updates / Changelog

### Input & Player
- Player input moved into `Player.update()` for self-contained logic.  
- Shooting and shields now use timers internally instead of external checks.  
- Player states now validated against allowed values before applying.  
- Fixed **death state** so the correct skull sprite is rendered when the player dies.  

### Timer System
- COUNTDOWN and COUNTUP modes with optional looping.  
- Timers reduce reliance on manual delta checks and improve timing reliability.  
- Shield and shooting cooldowns now automatically reset to correct play state (`AVOID` or `SHOOT`) after timers expire.  

### Collision Handling
- Safe object removal while iterating.  
- Early-out checks reduce unnecessary collision calculations.  
- Debug hitboxes added for testing.

### Rendering & Sprites
- Consistent center-based rendering.  
- `renderImage()` supports natural and scaled sizes.  
- Layers separate player, NPCs, projectiles, and HUD.  
- Sprite sheets supported for animation.  
- **Safe rendering**: added error checks for missing images, sprites, or invalid state data.  

### GameObject, Player, BillBoard
- Private fields for controlled access.  
- `kill()` method for object cleanup.  
- Player shooting cooldown and shield timers are internal.  
- BillBoard class prepared for scrolling/animation.  
- Player render logic now safely falls back if an image is missing.  

### Audio / Sound
- Audio pooling supports overlapping playback without drops.  
- Centralized playback by name via `AudioPlayer`.  
- Volume adjustable per sound.  
- Warnings for missing sounds instead of silent failures.  

### Debugging & Developer Tools
- Toggleable hitbox visualization.  
- Debug text rendering with `Device.debugText()`.  
- Track timers and object states for easier testing.  
- Added **console warnings** for risky operations (missing images, null sprites, invalid states).  

### Front-End / CSS
- CSS variables centralize repeated values.  
- Responsive layout via clamp-based scaling.  
- Centered messages with flexbox.  

---

## Timer System Overview
- Unified `Timer` class used for shooting, shields, and game clock.  
- Timers can loop or finish once, simplifying timed features.  
- Consistent update method ensures reliable timing across all mechanics.  
- Player states automatically transition back to correct defaults after timers expire.  

---

## Test Code
The project includes unit tests for critical components using Jasmine. To run the tests, follow these steps:

### Test Files
The following test files have been implemented:
- **playerSpec.js**: Tests for the `Player` class, including lifecycle (alive status), initialization, movement, shooting mechanics, and kill behavior.
- **deviceSpec.js**: Tests for the `Device` class, checking initialization and canvas handling.
- **gameControllerSpec.js**: Tests for the `Controller` object, verifying initialization and handling of `Device` and `Game` instances.

### Testing Framework
- Jasmine is used as the testing framework, providing a structure for defining and executing unit tests.

---

## General Notes
- Modular OOP design with private fields for safety.  
- Clear separation of game logic, rendering, input, and audio.  
- Reduced duplication and improved performance in object handling and collisions.  
- Flexible foundation for adding new mechanics or effects.  
- Defensive coding ensures errors don’t break the game loop.  

---

## Known Issues / Future Improvements
- **Animations**: player and NPC sprites are currently static; animation support is scaffolded but not fully implemented.  
- **Scrolling backgrounds**: BillBoard supports it, but smooth scrolling/animated backdrops are not yet enabled.  
- **UI polish**: HUD text and menus are functional but minimal; styling and feedback could be improved.  
- **More power-ups**: only shield and shooting mechanics exist; additional power-ups are planned.  
- **Mobile controls**: touch support not yet implemented (keyboard only).  
- **Balancing**: difficulty curve and spawn rates may need tuning for smoother gameplay.  

---

## New GamePlay
Now that a lot of the organizational clean up is finishing up, going to start adding more to the gameplay

### Added Features 
- The game now has a clock that counts how much time has past and will change gameplay as it goes longer
- As of now player will recive points and the NPC will fall at a faster rate as time goes on

---

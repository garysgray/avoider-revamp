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
- **BackDrop & Scrolling**: ready for animated or scrolling backgrounds.  
- **Front-End / CSS**: CSS variables for consistent colors, borders, and responsive scaling; messages are flexbox-centered.  

---

## Recent Updates / Changelog

### Input & Player
- Player input moved into `Player.update()` for self-contained logic.  
- Shooting and shields now use timers internally instead of external checks.  

### Timer System
- COUNTDOWN and COUNTUP modes with optional looping.  
- Timers reduce reliance on manual delta checks and improve timing reliability.  

### Collision Handling
- Safe object removal while iterating.  
- Early-out checks reduce unnecessary collision calculations.  
- Debug hitboxes added for testing.

### Rendering & Sprites
- Consistent center-based rendering.  
- `renderImage()` supports natural and scaled sizes.  
- Layers separate player, NPCs, projectiles, and HUD.  
- Sprite sheets supported for animation.

### GameObject, Player, BackDrop
- Private fields for controlled access.  
- `kill()` method for object cleanup.  
- Player shooting cooldown and shield timers are internal.  
- BackDrop class prepared for scrolling/animation.

### Audio / Sound
- Audio pooling supports overlapping playback without drops.  
- Centralized playback by name via `AudioPlayer`.  
- Volume adjustable per sound.  

### Debugging & Developer Tools
- Toggleable hitbox visualization.  
- Debug text rendering with `Device.debugText()`.  
- Track timers and object states for easier testing.

### Front-End / CSS
- CSS variables centralize repeated values.  
- Responsive layout via clamp-based scaling.  
- Centered messages with flexbox.  

---

## Timer System Overview
- Unified `Timer` class used for shooting, shields, and game clock.  
- Timers can loop or finish once, simplifying timed features.  
- Consistent update method ensures reliable timing across all mechanics.  

---

## General Notes
- Modular OOP design with private fields for safety.  
- Clear separation of game logic, rendering, input, and audio.  
- Reduced duplication and improved performance in object handling and collisions.  
- Flexible foundation for adding new mechanics or effects.

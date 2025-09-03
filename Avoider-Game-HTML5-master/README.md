# Avoider Game (Revamped)

A rebuilt version of my original HTML5 avoider game, cleaned up, modular, and easier to expand.  
Still simple, still fun, but smarter under the hood.

Built with **vanilla JS** and **Canvas**  
Work in progress, evolving into a **mini game engine**  
Made for learning, experimenting, and future projects

---

## Helpers.js Overview

`helpers.js` contains core utility classes that support the controller, including asset management, rendering, input handling, and timers.  
Modernized with proper OOP design and private fields for safety:

- **Sprite** tracks its own loaded state and dimensions  
- **ObjHolder** efficiently manages objects with optional ordered rendering  
- **Device** safely handles drawing sprites and text on the canvas  
- **Layer** system organizes rendering into clean, modular pieces  

This makes asset management consistent, rendering safer and more reliable, and the system easier to extend.

---

## Recent Updates / Changelog

### Input & Player Refactor
- Moved **input handling** (movement + shooting checks) into `Player.update()`, making Player self-contained  
- Removed redundant input checks from global game loop  
- Added **projectile timer** (`Timer` class instance) inside `Player` to manage shooting cooldowns cleanly  
- `Player` now enforces **canvas bounds** internally rather than relying on external logic  

### Timer Class
- Added reusable **Timer** class with private fields (`#duration`, `#timeLeft`, `#active`)  
- Supports `start`, `stop`, `reset`, and `update` methods  
- Used for player shooting delay (projectile cooldown)  
- Designed for reuse in shields, powerups, and other timed effects  

### Collision Handling
- Identified efficiency issue: `check_NPC_Collision` iterates forward while mutating the array  
- Switched to **reverse iteration** for safe removals during collision checks  
- Added **early-out checks** (`isNear()`) before full AABB collision to reduce wasted comparisons  
- Introduced consistent **bounding box hitboxes** (center-based) so visuals and collision align perfectly  
- Optional **debug hitbox rendering** added (toggleable) for verifying collision boxes visually  

### Sprite / Rendering
- Player render simplified with **state-based rendering** (using sprite states instead of multiple scattered checks)  
- All rendering functions updated to use **center-based coordinates** (`posX`, `posY` as object center, with half-width/height offsets)  
- Added groundwork for **animation helpers** via sprite sheet clips  
- Layers system improved: player, NPCs, projectiles, and HUD are cleanly separated  

### GameObject, Player, BackDrop
- Private fields added for safety (`#posX`, `#posY`, `#speed`, `#width`, `#height`)  
- Getters / setters ensure controlled access  
- **Player**: shooting cooldown logic handled internally with `Timer`  
- **BackDrop**: ready for scrolling or animated backgrounds  
- Every game object now has a bool `alive` member for flagging objects to be removed in updates (life cycle)  
- Added unified `kill()` method in `GameObject` superclass to simplify cleanup across children 

### Debugging & Developer Tools
- Added **toggleable hitbox debug mode** (draws bounding boxes around objects for collision testing)  
- Debug drawing uses consistent styling for easy visibility without clutter  

### CSS / Front-End Cleanup
- Moved **repeated values** (colors, padding, borders, radius, shadows, blur) into `:root` CSS variables  
- Centralized **border shorthand** (`--border`) to ensure consistency across canvas, menus, and messages  
- Added **clamp-based padding** for responsive scaling  
- Introduced **glass/blur background** effects for menus and messages (modernized look)  
- Easier theming: color or layout tweaks can now be done by editing variables in one place  

### General Improvements
- Unified OOP style using private fields (`#`)  
- Reduced code duplication across update/render flows  
- Clearer separation of **game logic** vs **rendering**  
- Safer array/object handling with helper methods  
- NPC spawning centralized in `spawnNPC()` helper (less repetitive code, overlap prevention)  

## Setup / How to Run
- Clone or download the repository.  
- Open index.html directly in a web browser.
- Works with any modern browser (Chrome, Firefox, Edge).
- No build step required (pure vanilla JS).
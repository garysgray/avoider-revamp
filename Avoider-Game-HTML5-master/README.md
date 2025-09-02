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

### Timer class
- Added reusable **Timer** class with private fields (`#duration`, `#timeLeft`, `#active`)  
- Supports `start`, `stop`, `reset`, and `update` methods  
- Used for player shooting delay (projectile cooldown)  
- Designed for reuse in shields, powerups, and other timed effects  

### Collision Handling
- Identified efficiency issue: `check_NPC_Collision` iterates forward while mutating the array  
- Plan to switch to **reverse iteration** or a **mark-and-remove pass** for safety and performance  
- Refactor will move **collision detection logic into Player** where appropriate (e.g., Player bullets vs NPCs)  
- Central collision system planned for reuse across entities (Player ↔ NPC, NPC ↔ NPC, bullets ↔ walls, etc.)  

### Sprite / Rendering
- Player render simplified with **state-based rendering** (using sprite states instead of multiple scattered checks)  
- Added groundwork for **animation helpers** via sprite sheet clips  
- Layers system improved: player, NPCs, projectiles, and HUD are cleanly separated  

### GameObject, Player, BackDrop
- Private fields added for safety (`#posX`, `#posY`, `#speed`, `#width`, `#height`)  
- Getters / setters ensure controlled access  
- **Player**: shooting cooldown logic handled internally with `Timer`  
- **BackDrop**: ready for scrolling or animated backgrounds  
- Every game object now has a bool alive member for flagging objects to be removed in updates (life cycle)

### General Improvements
- Unified OOP style using private fields (`#`)  
- Reduced code duplication across update/render flows  
- Clearer separation of **game logic** vs **rendering**  
- Safer array/object handling with helper methods  
- Planning step-by-step **collision system cleanup** as next major milestone  
- Spawnning of NPC's much improved, less repetative code

---

## Roadmap
- Expand **collision system** into reusable physics helpers  
- Finalize **reverse iteration / safe removal** in collision loops  
- Extend **Layer system** into a full scene/engine manager  
- Build modular **UI layers** (menus, HUD, pause screen)  
- Add **animation helpers** (sprite sheets, frame timing)  
- Expand asset pipeline with better loading + state management  
- Possible export as a **lightweight game engine** for future projects

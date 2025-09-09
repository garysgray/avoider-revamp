# Avoider Game (Revamped)

A rebuilt version of my original HTML5 avoider game, cleaned up, modular, and easier to expand.  
Still simple, still fun, but smarter under the hood.

Built with **vanilla JS** and **Canvas**  
Work in progress, evolving into a **mini game engine**  
Made for learning, experimenting, and future projects

---

### Setup / How to Run
- Clone or download the repository.  
- Open the Avoider-Game-HTML-master folder
- Click the index.html file to run it.
- Works with any modern browser (Chrome, Firefox, Edge).
- No build step required (pure vanilla JS).

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

### Timer System Refactor & Improvements

We overhauled the **Timer class** to be a fully reusable, robust solution for all timed game effects. These changes impacted shields, player shooting, and any potential future timed mechanics.

#### Timer Class Changes
- Introduced **private fields** (`#duration`, `#timeLeft`, `#elapsedTime`, `#active`, `#mode`, `#loop`) for safety and encapsulation.
- Supports **COUNTDOWN** and **COUNTUP** modes:
  - **Countdown**: For timed events (shield duration, shoot cooldown)  
  - **Countup**: Tracks elapsed time for effects like scoring, powerups, or animations
- Added **looping option** to allow repeating timers without external handling.
- Unified **start, stop, reset, and update** methods:
  - `start()` correctly initializes timers based on mode
  - `reset(duration, mode, loop)` fully resets the timer with optional mode and looping
  - `update(delta)` now handles countdown and countup in one method
- Prevented common issues:
  - Countdown timers not triggering completion
  - Resetting timers leaving them in the wrong mode
  - Overwriting elapsed time or countdown accidentally

#### Player & Shield Integration
- **Player shoot cooldown timer**
  - Now uses the Timer class in **COUNTDOWN mode**.
  - Automatically updates each frame during `Player.update()`.
  - `tryShoot()` checks `#shootCooldownTimer.active` before firing.
  - `reset()` sets duration explicitly to `game.gameConsts.SHOOT_COOLDOWN`.
- **Shield timer**
  - Uses Timer in **COUNTDOWN mode** for shield duration.
  - Reset explicitly when entering shield state with `game.timer.reset(game.gameConsts.SHIELD_TIME, COUNTDOWN, false)`.
  - Automatically triggers exit from shield state when timer completes.
  
#### Cascading Improvements
- Eliminated previous **bullet timing bugs** caused by countup timer interference.
- Shooting behavior now consistently allows **multiple bullets** according to ammo count.
- Shields expire reliably, with `restorePlayState()` called exactly when the timer finishes.
- All timers (shoot cooldown, shield duration) now **update each frame** and are self-contained.
- Reduced manual state checks across game logic:
  - Player shooting no longer requires extra “bullet tick” logic.
  - Shield timing no longer relies on manual delta subtraction in the main loop.
- Improved **debugging**:
  - Can log `timeLeft` or `elapsedTime` for any timer instance.
  - Provides a clear foundation for future powerups, effects, or timed events.

#### Future-Proofing
- Timer class is now fully **plug-and-play** for:
  - Power-ups (e.g., double score, speed boosts)
  - NPC abilities with duration
  - Visual effects that require a timed lifecycle
- All timers share a **consistent API**, making additional timed mechanics trivial to add without breaking existing gameplay.

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
- Unified `renderImage()` → now automatically handles both "with width/height" and "natural size" calls  
- Improved `centerImage()` → simpler, more efficient calculation using object dimensions  

### GameObject, Player, BackDrop
- Private fields added for safety (`#posX`, `#posY`, `#speed`, `#width`, `#height`)  
- Getters / setters ensure controlled access  
- **Player**: shooting cooldown logic handled internally with `Timer`  
- **BackDrop**: ready for scrolling or animated backgrounds  
- Every game object now has a bool `alive` member for flagging objects to be removed in updates (life cycle)  
- Added unified `kill()` method in `GameObject` superclass to simplify cleanup across children  
- Added **`centerObject()` utility** → calculates exact centered position based on canvas width/height and object size  
- Fix: splash, pause, and die screens now **center correctly on first load** without needing a refresh  

### Audio / Sound Manager
- Introduced **`Sound` class** → wraps `<audio>` elements, supports clean play/stop behavior  
- Each `play()` call **clones or resets audio** so sounds trigger reliably even under rapid fire  
  - `audio.currentTime = 0;` ensures sounds always start from the beginning (no cut-off)  
- Added **`AudioPlayer` manager** → central system to register and play sounds by name  
- Supports multiple concurrent sounds (no more dropped shots or missing effects)  
- Volume is passed optionally at playtime, defaulting to `1` for consistent behavior  
- Shooting logic updated to call `audioPlayer.playSound('shoot')` when firing projectiles  
- Scalable design → easy to add more effects (explosions, power-ups, UI sounds)  

### Debugging & Developer Tools
- Added **toggleable hitbox debug mode** (draws bounding boxes around objects for collision testing)  
- Debug drawing uses consistent styling for easy visibility without clutter  

### CSS / Front-End Cleanup
- Moved **repeated values** (colors, padding, borders, radius, shadows, blur) into `:root` CSS variables  
- Centralized **border shorthand** (`--border`) to ensure consistency across canvas, menus, and messages  
- Added **clamp-based padding** for responsive scaling  
- Introduced **glass/blur background** effects for menus and messages (modernized look)  
- Easier theming: color or layout tweaks can now be done by editing variables in one place  
- Fixed **message alignment**: `#message` now uses `display: flex; justify-content: center; align-items: center;` so text is perfectly centered  

### General Improvements
- Unified OOP style using private fields (`#`)  
- Reduced code duplication across update/render flows  
- Clearer separation of **game logic** vs **rendering**  
- Safer array/object handling with helper methods  
- NPC spawning centralized in `spawnNPC()` helper (less repetitive code, overlap prevention)  

### Setup / How to Run
- Clone or download the repository.  
- Open the Avoider-Game-HTML-master folder
- Click the index.html file to run it.
- Works with any modern browser (Chrome, Firefox, Edge).
- No build step required (pure vanilla JS).

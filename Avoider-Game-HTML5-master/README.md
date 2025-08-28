# Avoider Game (Revamped)

A rebuilt version of my original HTML5 avoider game, cleaned up, modular, and easier to expand.  
Still simple, still fun, but smarter under the hood.

Built with vanilla JS and Canvas  
Work in progress, evolving into a mini game engine  
Made for learning, experimenting, and future projects

---

## Helpers.js Overview

`helpers.js` contains core utility classes that support the controller, including asset management, rendering, input handling, and timers. Updates modernize the codebase with proper OOP design:

- **Sprite** now tracks its own loaded state and dimensions  
- **ObjHolder** efficiently manages objects with optional ordered rendering  
- **Device** safely handles drawing sprites and text on the canvas  

This makes asset management consistent, rendering safer and more reliable, and the system easier to extend.

---

## Recent Updates / Changelog

### Sprite class
- Private fields (`#name`, `#image`, `#loaded`)  
- Added width / height getters  
- Safe image loading tracking (`loaded`)  
- `posX` / `posY` for position tracking  
- Getters and setters for safe access  
- Mouse input updates sprite position directly  

### ObjHolder class
- Ordered and unordered object storage  
- Lookup helpers: `getObjectByName`, `getImage`  
- Iteration helpers: `forEach`, `forEachOrdered`  
- Removed redundant update method to follow OOP principles  

### Device class
- Private core fields (`#canvas`, `#ctx`, `#images`, `#audio`, `#keys`, `#mouseDown`)  
- `renderImage` / `centerImage` handle raw images and Sprite instances  
- Centralized canvas rendering, text, and debug helpers  
- Integrated KeyManager / mouse state handling  
- `centerTextOnY` for easier text placement  
- Text alignment improvements using constants / percentages  

### KeyManager class
- Tracks keys held, pressed, released per frame  
- `clearFrameKeys()` resets one-frame input states  
- Private fields for consistency  

### Timer class
- Leaner update logic for shield timing and state changes  
- `active` flag indicates running state  
- Simplified methods: start, update, display  

### Controller + Layer System
- Controller owns the game instance, centralizing update / render flow  
- Added `Layer` class for modular rendering (sprites, HUD, text)  
- Layers registered and rendered sequentially  
- Game object layers (player, NPCs, projectiles) now modular  
- Text rendering is a separate `textRenderLayer`  
- Layers access game state and device, allowing dynamic rendering  
- Layers easily added / removed without changing main update loop  

### Game Logic & Rendering
- `updateGame()` calls game logic and iterates layers for rendering  
- `spriteRenderer.js` functions (`renderNPCSprites`, `renderBullets`, `renderPlayer`) refactored into layers  
- Text rendering (`textRender.js`) moved to `Layer`  
- Controller clears frame keys each update to prevent input errors  
- Game state checks remain in layers, keeping rendering and logic separate  
- Layered system supports multiple HUDs, overlays, debug layers without clutter  

### GameObject, Player, BackDrop
- Private fields for all properties (`#width`, `#height`, `#posX`, `#posY`, `#speed`, etc.)  
- Getters / setters for all internal state  
- `Player` has projectile timer and shoot delay  
- Player enforces canvas bounds  
- `BackDrop` supports potential scrolling / animations  
- Consistent modern OOP style using private fields  

### General Improvements
- Unified OOP style using private fields (`#`)  
- Safer, more consistent sprite / object handling  
- Simplified code paths and fewer runtime errors  
- Clear separation of concerns  
- UI elements positioned using percentages + pixel padding, no magic numbers

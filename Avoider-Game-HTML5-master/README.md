# Avoider Game (Revamped)

A rebuilt version of my original HTML5 avoider game, cleaned up, modular, and easier to expand.  
Still simple, still fun, but smarter under the hood.

- Built with vanilla JS and Canvas  
- Reworked with AI assistance to try it out  
- Work in progress, evolving into a mini game engine  
- Made for learning, experimenting, and future projects  

---

## Helpers.js Overview

`helpers.js` contains all the core utility classes that support the game controller, including asset management, rendering, input handling, and timers.  

Recent updates modernize the codebase with proper OOP design:

- **Sprite** now tracks its own loaded state and dimensions  
- **ObjHolder** efficiently manages objects with optional ordered rendering  
- **Device** safely handles drawing sprites and text on the canvas  

These improvements make asset management consistent, rendering safer and more reliable, and the system easier to extend for future game features.

---

## Recent Updates / Changelog

### Sprite Class
- Converted to private fields (`#name`, `#image`, `#loaded`)  
- Added width / height getters  
- Added safe image loading tracking (`loaded` property)  
- Added `posX` and `posY` fields for position tracking  
- Getters and setters provide safe, consistent access  
- Mouse input updates sprite position directly via these fields  

### ObjHolder Class
- Supports ordered and unordered object storage  
- Lookup helpers: `getObjectByName` and `getImage`  
- Iteration helpers: `forEach` and `forEachOrdered`  
- Removed redundant update method to follow OOP principles  

### Device Class
- Core members use private fields (`#canvas`, `#ctx`, `#images`, `#audio`, `#keys`, `#mouseDown`)  
- `renderImage` and `centerImage` handle both raw images and Sprite instances  
- Centralized canvas rendering, text, and debug helpers  
- Integrated KeyManager and mouse state handling  
- Added `centerTextOnY` for easier text placement along canvas width  
- Text alignment improvements: moved away from magic numbers with support for constants and percentage-based layout plus optional pixel offsets  

### KeyManager Class
- Tracks keys held, pressed, and released per frame  
- `clearFrameKeys()` resets one-frame input states  
- Uses private fields for consistency  

### Timer Class
- Refactored to leaner update logic for shield timing and state changes  
- Active flag clearly indicates whether timer is running  
- Methods simplified to split concerns: starting, updating, and displaying  

### Controller + Layer System
- Controller owns the game instance, centralizing update and render flow  
- Added **Layer** class to represent individual render layers (e.g., sprites, HUD, text)  
- Layers registered with Controller in order and rendered sequentially  
- Game object layers (player, NPCs, projectiles) modularized into layers  
- Text rendering refactored into a `textRenderLayer` for HUD and game messages  
- Each layer has access to the game state and device, so rendering adjusts dynamically  
- Layers can be added or removed without changing the main update loop  

### Game Logic & Rendering
- `updateGame()` in Controller first updates game logic, then iterates through layers for rendering  
- `spriteRenderer.js` functions (NPCs, bullets, player) moved into dedicated layers  
- `textRender.js` now a Layer for modularity  
- Controller clears frame keys after each update to prevent input errors  
- Game state checks handled inside relevant layers to keep logic and rendering separate  
- Layered system makes it easy to expand with overlays, HUDs, or debug tools  

### General Improvements
- Unified modern OOP style using private fields (`#`)  
- Safer, more consistent sprite and object handling  
- Simplified code paths and fewer runtime errors  
- Clear separation of concerns for easier extension  
- Replaced “magic numbers” in UI with calculated positions (percentages + pixel padding) for text and HUD  

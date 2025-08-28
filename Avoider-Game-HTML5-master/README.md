# Avoider Game (Revamped)

A rebuilt version of my original HTML5 avoider game, cleaned up, modular, and easier to expand.  
Still simple, still fun, but smarter under the hood.

Built with vanilla JS and Canvas  
Reworked with AI assistance to try it out  
Work in progress, evolving into a mini game engine  
Made for learning, experimenting, and future projects

---

## Helpers.js Overview

`helpers.js` contains all the core utility classes that support the game controller, including asset management, rendering, input handling, and timers. Recent updates modernize the codebase with proper OOP design:

- Sprite now tracks its own loaded state and dimensions
- ObjHolder efficiently manages objects with optional ordered rendering
- Device safely handles drawing sprites and text on the canvas

These improvements make asset management consistent, rendering safer and more reliable, and the system easier to extend for future game features.

---

## Recent Updates / Changelog

### Sprite class
- Converted to private fields (`#name`, `#image`, `#loaded`)
- Added width / height getters
- Added safe image loading tracking (`loaded` property)
- Added `posX` and `posY` fields for position tracking
- Getters and setters provide safe, consistent access
- Mouse input updates sprite position directly via these fields

### ObjHolder class
- Supports ordered and unordered object storage
- Lookup helpers: `getObjectByName` and `getImage`
- Iteration helpers: `forEach` and `forEachOrdered`
- Removed redundant update method to follow OOP principles

### Device class
- Core members use private fields (`#canvas`, `#ctx`, `#images`, `#audio`, `#keys`, `#mouseDown`)
- `renderImage` and `centerImage` handle both raw images and Sprite instances
- Centralized canvas rendering, text, and debug helpers
- Integrated KeyManager and mouse state handling
- Added `centerTextOnY` for easier text placement along canvas width
- Text alignment improvements: moved away from magic numbers by supporting constants and percentage-based layout with optional pixel offsets

### KeyManager class
- Tracks keys held, pressed, and released per frame
- `clearFrameKeys()` resets one-frame input states
- Uses private fields for consistency

### Timer class
- Refactored to leaner update logic for shield timing and state changes
- Active flag now clearly indicates whether timer is running
- Methods simplified to split concerns: starting, updating, and displaying

### Controller + Layer System
- Controller now owns the game instance, centralizing update and render flow
- Added `Layer` class to represent individual render layers (e.g., sprites, HUD, text)
- Layers are registered with Controller in order and rendered sequentially, making multi-layer rendering trivial
- Game object layers (player, NPCs, projectiles) are now modular and handled via layers
- Text rendering is implemented as a separate `textRenderLayer` for HUD and game state messages
- Each layer has access to the game state and device, so rendering adjusts dynamically based on game state
- Layers can be easily added or removed without changing the main update loop

### Game Logic & Rendering Updates
- `updateGame()` in Controller now calls `update()` for game logic and then iterates through all layers for rendering
- `spriteRenderer.js` functions (`renderNPCSprites`, `renderBullets`, `renderPlayer`) refactored into separate layers
- Text rendering (`textRender.js`) refactored into a `Layer` for modularity
- The controller clears frame keys after each update to prevent input errors
- Game state checks remain inside layers where appropriate, keeping rendering and logic separate
- Layered system allows future expansion for multiple HUDs, overlays, or debug layers without clutter

### General improvements
- Unified modern OOP style using private fields (`#`)
- Safer, more consistent sprite and object handling across rendering
- Simplified code paths and fewer runtime errors
- Clear separation of concerns for easier extension
- Replaced “magic numbers” in UI with calculated positions (percentages + pixel padding) for text and HUD elements

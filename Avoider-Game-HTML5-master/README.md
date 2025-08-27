# Avoider Game (Revamped)

A rebuilt version of my original HTML5 avoider game, cleaned up, modular, and easier to expand.  
Still simple, still fun, but smarter under the hood.

Built with vanilla JS and Canvas  
Reworked with  AI assistance to try it out  
Work in progress, evolving into a mini game engine  
Made for learning, experimenting, and future projects

-------------------------------------------------------------
Helpers.js Overview

helpers.js contains all the core utility classes that support the game controller, including asset management, rendering, input handling, and timers. Recent updates modernize the codebase with proper OOP design: Sprite now tracks its own loaded state and dimensions, ObjHolder efficiently manages objects with optional ordered rendering, and Device safely handles drawing sprites and text on the canvas. These improvements make asset management consistent, rendering safer and more reliable, and the system easier to extend for future game features.

Recent Updates / Changelog

Sprite class
	Converted to private fields (#name, #image, #loaded).
	Added width/height getters.
	Added safe image loading tracking (loaded property).

ObjHolder class
	Supports ordered and unordered object storage.
	Lookup helpers: getObjectByName and getImage.
	Iteration helpers: forEach and forEachOrdered.
	Removed redundant update method to follow OOP principles.

Device class
	Core members use private fields (#canvas, #ctx, #images, #audio, #keys, #mouseDown).
	renderImage and centerImage handle both raw images and Sprite instances.
	Centralized canvas rendering, text, and debug helpers.
	Integrated KeyManager and mouse state handling.

KeyManager class
	Tracks keys held, pressed, and released per frame.
	clearFrameKeys() resets one-frame input states.
	Uses private fields for consistency.

General improvements
	Unified modern OOP style using private fields (#).
	Safer, more consistent sprite and object handling across rendering.
	Simplified code paths and fewer runtime errors.
	Clear separation of concerns for easier extension.


Sprite position tracking
	Added posX and posY fields to track object position.
	Setters and getters allow safe access while keeping code consistent.
	Mouse input now updates sprite position directly via these fields.

Timer class
	Refactored to leaner update logic for shield timing and state changes.
	Active flag now clearly indicates whether timer is running.
	Methods simplified to split concerns: starting, updating, and displaying.

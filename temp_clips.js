/////old controller
// // ============================================================================
// // Controller Class
// // ----------------------------------------------------------------------------
// // The Controller acts as the "director" of the game. It sets up the game,
// // manages the Device (canvas + input), tracks render layers, and delegates
// // update + render calls.
// //
// // Benefits:
// // - Central place to organize initialization and updates
// // - Makes it easy to later run multiple games or scenes by delegating here
// // ============================================================================

// class Controller 
// {
//     #device;    // Manages canvas and input
//     #game;      // Holds core game state and logic
//     #layers;    // Array of Layer instances (render order matters)

//     constructor() 
//     {
//         try {
//             this.#game = new Game(); // Attempt to create the Game instance
//         } catch (error) {
//             console.error("Failed to initialize Game:", error.message);
//             alert("An error occurred while initializing the game. Please try again.");
//             return; // Stop further processing
//         }

//         // Initialize Device
//         try {
//             this.#device = new Device(this.#game?.canvasWidth ?? 800, this.#game?.canvasHeight ?? 600);
//         } catch (error) {
//             console.error("Failed to initialize Device:", error.message);
//             alert("An error occurred while setting up the game environment.");
//             return;
//         }


//         // Start with an empty list of rendering layers
//         this.#layers = [];

//         this.initGame();
//     }

//     // ------------------------------------------------------------------------
//     // Getters
//     // ------------------------------------------------------------------------
//     get device() { return this.#device; }
//     get game()   { return this.#game; }

//     // ------------------------------------------------------------------------
//     // Initialize the game
//     // ------------------------------------------------------------------------
//     initGame() 
//     {
//         try {
//            this.#game?.initGame?.(this.#device);// Pass device into the game for setup

//             // Add default render layers (order defines render priority)
//             this.addLayer(gameObjectsLayer);  // Sprites / world objects
//             this.addLayer(textRenderLayer);   // UI text / HUD
//         } catch (error) {
//             console.error("Failed to initialize game components:", error.message);
//             alert("An error occurred while initializing game components.");
//         }
//     }

//     // ------------------------------------------------------------------------
//     // Add a render layer
//     // ------------------------------------------------------------------------
//     addLayer(layer) 
//     {
//         try {
//             if (!layer) {
//                 throw new Error("Layer is undefined or null.");
//             }
//             this.#layers.push(layer);
//         } catch (error) {
//             console.error("Error adding layer:", error.message);
//             alert("An error occurred while adding a render layer.");
//         }
//     }

//     // ------------------------------------------------------------------------
//     // Update + Render
//     // ------------------------------------------------------------------------
//     updateGame(delta) 
//     {
//         // Validate delta
//         if (typeof delta !== "number" || delta <= 0) {
//             console.warn("updateGame called with invalid delta:", delta);
//             delta = 16; // fallback ~60fps
//         }

//         try {
//             // Update core game logic
//             updateGameStates?.(this.#device, this.#game, delta);

//             // Render each layer safely
//             for (const layer of this.#layers) {
//                 try {
//                     layer?.render?.(this.#device, this.#game);
//                 } catch (renderError) {
//                     console.error(`Error rendering layer ${layer?.name ?? 'unknown'}:`, renderError.message);
//                 }
//             }

//             // Clear per-frame input
//             this.#device?.keys?.clearFrameKeys?.();

//         } catch (error) {
//             console.error("Game update error:", error.message);
//             alert("An error occurred during the game update. Please restart.");
//         }
//     }
// }



// ============================================================================
// Controller Class (Unified, Test + Game Friendly)
// ============================================================================
class Controller {
    #device;       // Manages canvas + input
    #game;         // Game state/logic
    #layers = [];  // Always initialized

    /**
     * @param {Function|null} GameClass - optional real or fake Game
     * @param {Function|null} DeviceClass - optional real or fake Device
     * @param {HTMLElement|null} canvasEl - optional canvas element
     */
    constructor(GameClass = null, DeviceClass = null, canvasEl = null) {
        // Pick Game class safely
        const GameCtor = GameClass || (typeof Game !== 'undefined' ? Game : class { initGame() {} });
        const DeviceCtor = DeviceClass || (typeof Device !== 'undefined' ? Device : class {
            constructor() {
                this.keys = { clearFrameKeys: () => {} };
            }
        });

        // Initialize game
        try {
            this.#game = new GameCtor();
            if (!this.#game.initGame) this.#game.initGame = () => {};
        } catch (err) {
            console.error("Game init failed:", err.message);
            this.#game = { initGame: () => {} };
        }

        // Initialize device
        try {
            this.#device = new DeviceCtor(800, 600, canvasEl);
            // Ensure keys.clearFrameKeys exists for tests
            if (!this.#device.keys) this.#device.keys = { clearFrameKeys: () => {} };
            if (!this.#device.keys.clearFrameKeys) this.#device.keys.clearFrameKeys = () => {};
        } catch (err) {
            console.error("Device init failed:", err.message);
            this.#device = { keys: { clearFrameKeys: () => {} } };
        }

        // Initialize game layers
        this.initGame();
    }

    // ----------------------
    // Getters
    // ----------------------
    get device() { return this.#device; }
    get game() { return this.#game; }
    get layers() { return this.#layers; } // expose for tests

    // ----------------------
    // Initialize game
    // ----------------------
    initGame() {
        try {
            this.#game?.initGame?.(this.#device);

            if (typeof gameObjectsLayer !== 'undefined') this.addLayer(gameObjectsLayer);
            if (typeof textRenderLayer !== 'undefined') this.addLayer(textRenderLayer);

        } catch (err) {
            console.error("Game initGame failed:", err.message);
        }
    }

    // ----------------------
    // Add layer
    // ----------------------
    addLayer(layer) {
        if (!layer) throw new Error("Layer is undefined or null.");
        this.#layers.push(layer);
    }

    // ----------------------
    // Update + render
    // ----------------------
    updateGame(delta) {
        if (typeof delta !== "number" || delta <= 0) delta = 16;

        try {
            updateGameStates?.(this.#device, this.#game, delta);

            for (const layer of this.#layers) {
                try { layer?.render?.(this.#device, this.#game); }
                catch (err) { console.error("Layer render failed:", err.message); }
            }

            this.#device?.keys?.clearFrameKeys?.();
        } catch (err) {
            console.error("updateGame error:", err.message);
        }
    }
}
//-------------------------------------

class Device
{
	#canvas;
    #ctx;
    #mouseDown;
    #images;
    #audio;
    #keys;

    constructor(width = 800, height = 600) {
        try {
            this.#canvas = document.getElementById("canvas");
            if (!this.#canvas) throw new Error("Canvas element with id 'canvas' not found");
            this.#ctx = this.#canvas.getContext("2d");
            this.#canvas.width = width;
            this.#canvas.height = height;

            this.#mouseDown = false;
            this.#images = new ObjHolder();
            this.#audio = new AudioPlayer();
            this.#keys = new KeyManager();
        } catch (err) {
            console.error("Device initialization failed:", err.message);
            throw err;
        }
    }
    
    //----get Functions----
    get canvas() { return this.#canvas; }
    get ctx() { return this.#ctx; }
    get mouseDown() { return this.#mouseDown; }
    get images() { return this.#images; }
    get audio() { return this.#audio; }
    get keys() { return this.#keys; }
    
    //----set Functions----
    set mouseDown(newState){this._mouseDown = newState;}
    
    setupMouse(sprite, aDev) 
    {
        if (!sprite || !this.#canvas) return;

        try {
            window.addEventListener("mousedown", () => this.#mouseDown = true);
            window.addEventListener("mouseup", () => this.#mouseDown = false);
            window.addEventListener("mousemove", (e) => {
                const rect = this.#canvas.getBoundingClientRect();
                sprite.posX = e.clientX - rect.left;
                sprite.posY = e.clientY - rect.top;
            });
        } catch (err) {
            console.warn("Failed to setup mouse events:", err.message);
        }
    }

    renderImage(aImageOrSprite, aX = 0, aY = 0, w, h) 
    {
        try {
            if (!aImageOrSprite) return;
            const img = aImageOrSprite.image ?? aImageOrSprite;
            if (typeof w === "number" && typeof h === "number") {
                this.#ctx.drawImage(img, aX, aY, w, h);
            } else {
                this.#ctx.drawImage(img, aX, aY);
            }
        } catch (err) {
            console.warn("renderImage failed:", err.message);
        }
    }

    renderClip(aClip, aPosX, aPosY, aWidth, aHeight, aState = 0) 
    {
        try {
            this.#ctx.drawImage(
                aClip,
                aState * aWidth,
                0,
                aWidth,
                aHeight,
                aPosX - aWidth * 0.5,
                aPosY - aHeight * 0.5,
                aWidth,
                aHeight
            );
        } catch (err) {
            console.warn("renderClip failed:", err.message);
        }
    }
    
    centerImage(aImage, aPosX, aPosY) 
    {
        try {
            const img = aImage?.image ?? aImage;
            if (!img) return;
            this.#ctx.drawImage(img, aPosX - img.width * 0.5, aPosY - img.height * 0.5);
        } catch (err) {
            console.warn("centerImage failed:", err.message);
        }
    }

    putText(aString, x, y) 
    {
        try { this.#ctx.fillText(aString, x, y); } 
        catch { /* ignore */ }
    }

    centerTextOnY(text, posY) 
    {
        try {
            const textWidth = this.#ctx.measureText(text).width;
            const centerX = (this.#canvas.width - textWidth) * 0.5;
            this.#ctx.fillText(text, centerX, posY);
        } catch { /* ignore */ }
    }

    colorText(color) 
    {
        try { this.#ctx.fillStyle = color?.toString() ?? "white"; } 
        catch { /* ignore */ }
    }

    setFont(font) 
    {
        try { this.#ctx.font = font?.toString() ?? "16px Arial"; } 
        catch { /* ignore */ }
    }

    debugText(text, posX, posY) 
    {
        try {
            this.setFont("24px Arial Black");
            this.colorText("white");
            this.putText(text?.toString() ?? "", posX, posY);
        } catch { /* ignore */ }
    }
}



//////////////////////////test spec code from controller 


// describe("Controller", function () {
//   let controller;

//   beforeEach(function () {
//     // Provide mock Game and Device to isolate Controller
//     class MockGame {
//       constructor() {
//         this.canvasWidth = 640;
//         this.canvasHeight = 480;
//       }
//       initGame(device) {
//         this.initializedWith = device;
//       }
//     }

//     class MockDevice {
//       constructor(w, h) {
//         this.width = w;
//         this.height = h;
//         this.keys = { clearFrameKeys: jasmine.createSpy("clearFrameKeys") };
//       }
//     }

//     // Patch globals the Controller expects
//     window.Game = MockGame;
//     window.Device = MockDevice;
//     window.gameObjectsLayer = { name: "objects", render: jasmine.createSpy("render") };
//     window.textRenderLayer = { name: "text", render: jasmine.createSpy("render") };
//     window.updateGameStates = jasmine.createSpy("updateGameStates");

//     // Fresh controller
//     controller = new Controller();
//   });

//   // ---------------------------------------------------------------------------
//   it("should initialize game as a Game instance", function () {
//     expect(controller.game).toEqual(jasmine.any(Game));
//     expect(controller.game.canvasWidth).toBe(640);
//     expect(controller.game.canvasHeight).toBe(480);
//   });

//   it("should initialize device as a Device instance", function () {
//     expect(controller.device).toEqual(jasmine.any(Device));
//     expect(controller.device.width).toBe(640);
//     expect(controller.device.height).toBe(480);
//   });

//   it("should call Game.initGame with the device", function () {
//     expect(controller.game.initializedWith).toBe(controller.device);
//   });

//   // ---------------------------------------------------------------------------
//   it("should add default render layers on init", function () {
//     // Trigger an update to make sure layers are used
//     controller.updateGame(16);

//     expect(gameObjectsLayer.render).toHaveBeenCalledWith(controller.device, controller.game);
//     expect(textRenderLayer.render).toHaveBeenCalledWith(controller.device, controller.game);
//   });

//   it("should call updateGameStates and clear input on update", function () {
//     controller.updateGame(16);

//     expect(updateGameStates).toHaveBeenCalledWith(controller.device, controller.game, 16);
//     expect(controller.device.keys.clearFrameKeys).toHaveBeenCalled();
//   });

//   it("should fall back to 16 delta if invalid delta is passed", function () {
//     controller.updateGame(-5); // invalid delta

//     expect(updateGameStates).toHaveBeenCalledWith(controller.device, controller.game, 16);
//   });
// });
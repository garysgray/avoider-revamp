// ============================================================================
// Controller Class (Test-Friendly Version)
// ----------------------------------------------------------------------------
// Works with real Game/Device or with fake/mock classes for Jasmine tests
// ============================================================================

class Controller 
{
    #device;    // Manages canvas and input
    #game;      // Holds core game state and logic
    #layers;    // Array of Layer instances (render order matters)

    /**
     * @param {Function} GameClass - optional constructor for Game (or fake for tests)
     * @param {Function} DeviceClass - optional constructor for Device (or fake for tests)
     * @param {HTMLElement|null} canvasEl - optional canvas element
     */
    constructor(GameClass = null, DeviceClass = null, canvasEl = null) 
    {
        // Use real classes if not provided
        const GameCtor = GameClass || (typeof Game !== 'undefined' ? Game : class { initGame() {} });
        const DeviceCtor = DeviceClass || (typeof Device !== 'undefined' ? Device : class {});

        // Initialize Game
        try {
            this.#game = new GameCtor();
        } catch (error) {
            console.error("Failed to initialize Game:", error.message);
            alert("An error occurred while initializing the game. Please try again.");
            return;
        }

        // Initialize Device
        try {
            this.#device = new DeviceCtor(800, 600, canvasEl);
        } catch (error) {
            console.error("Failed to initialize Device:", error.message);
            alert("An error occurred while setting up the game environment.");
            return;
        }

        // Initialize layers
        this.#layers = [];

        // Initialize game logic
        this.initGame();
    }

    // ------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------
    get device() { return this.#device; }
    get game() { return this.#game; }

    // ------------------------------------------------------------------------
    // Initialize game
    // ------------------------------------------------------------------------
    initGame() 
    {
        try {
            this.#game?.initGame?.(this.#device);

            // Add default layers if they exist (can be null/fake for tests)
            if (typeof gameObjectsLayer !== 'undefined') this.addLayer(gameObjectsLayer);
            if (typeof textRenderLayer !== 'undefined') this.addLayer(textRenderLayer);

        } catch (error) {
            console.error("Failed to initialize game components:", error.message);
            alert("An error occurred while initializing game components.");
        }
    }

    // ------------------------------------------------------------------------
    // Add a render layer
    // ------------------------------------------------------------------------
    addLayer(layer) 
    {
        try {
            if (!layer) throw new Error("Layer is undefined or null.");
            this.#layers.push(layer);
        } catch (error) {
            console.error("Error adding layer:", error.message);
            alert("An error occurred while adding a render layer.");
        }
    }

    // ------------------------------------------------------------------------
    // Update + Render
    // ------------------------------------------------------------------------
    updateGame(delta) 
    {
        if (typeof delta !== "number" || delta <= 0) delta = 16; // fallback ~60fps

        try {
            // Update game logic
            updateGameStates?.(this.#device, this.#game, delta);

            // Render each layer
            for (const layer of this.#layers) {
                try { layer?.render?.(this.#device, this.#game); } 
                catch (renderError) { console.error(`Error rendering layer:`, renderError.message); }
            }

            // Clear per-frame input
            this.#device?.keys?.clearFrameKeys?.();

        } catch (error) {
            console.error("Game update error:", error.message);
            alert("An error occurred during the game update. Please restart.");
        }
    }
}

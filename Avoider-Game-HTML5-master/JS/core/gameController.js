// ============================================================================
// Controller Class
// ----------------------------------------------------------------------------
// The Controller acts as the "director" of the game. It sets up the game,
// manages the Device (canvas + input), tracks render layers, and delegates
// update + render calls.
//
// Benefits:
// - Central place to organize initialization and updates
// - Makes it easy to later run multiple games or scenes by delegating here
// ============================================================================

class Controller 
{
    #device;    // Manages canvas and input
    #game;      // Holds core game state and logic
    #layers;    // Array of Layer instances (render order matters)

    constructor() 
    {
        try {
            this.#game = new Game(); // Attempt to create the Game instance
        } catch (error) {
            console.error("Failed to initialize Game:", error.message);
            alert("An error occurred while initializing the game. Please try again.");
            return; // Stop further processing
        }

        try {
            this.#device = new Device(this.#game.canvasWidth, this.#game.canvasHeight);
        } catch (error) {
            console.error("Failed to initialize Device:", error.message);
            alert("An error occurred while setting up the game environment.");
            return; // Stop further processing
        }


        // Start with an empty list of rendering layers
        this.#layers = [];

        this.initGame();
    }

    // ------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------
    get device() { return this.#device; }
    get game()   { return this.#game; }

    // ------------------------------------------------------------------------
    // Initialize the game
    // ------------------------------------------------------------------------
    initGame() 
    {
         try {
            this.#game.initGame(this.#device); // Pass device into the game for setup

            // Add default render layers (order defines render priority)
            this.addLayer(gameObjectsLayer);  // Sprites / world objects
            this.addLayer(textRenderLayer);   // UI text / HUD
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
            if (!layer) {
                throw new Error("Layer is undefined or null.");
            }
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
        try {
            updateGameStates(this.#device, this.#game, delta); // Update game logic

            // Render each layer in order (background → text → debug, etc.)
            for (const layer of this.#layers) {
                try {
                    layer.render(this.#device, this.#game);
                } catch (renderError) {
                    console.error(`Error rendering layer ${layer.name}:`, renderError.message);
                    // Optionally, you could skip rendering this layer or handle the error
                }
            }

            // Clear per-frame input (prevents sticky key issues)
            this.#device.keys.clearFrameKeys();
        } catch (error) {
            console.error("Game update error:", error.message);
            alert("An error occurred during the game update. Please restart the game.");
        }
    }
}


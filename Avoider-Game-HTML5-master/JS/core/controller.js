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
        // Create the core Game instance
        this.#game = new Game();

        // Create the Device (canvas + input), sized to match the game
        this.#device = new Device(this.#game.canvasWidth, this.#game.canvasHeight);

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
        // Add default render layers (order defines render priority)
        this.addLayer(gameObjectsLayer);  // Sprites / world objects
        this.addLayer(textRenderLayer);   // UI text / HUD

        // Pass device into game for setup (canvas, input, etc.)
        this.#game.initGame(this.#device); 
    }

    // ------------------------------------------------------------------------
    // Add a render layer
    // ------------------------------------------------------------------------
    addLayer(layer) 
    {
        this.#layers.push(layer);
    }

    // ------------------------------------------------------------------------
    // Update + Render
    // ------------------------------------------------------------------------
    updateGame(delta) 
    {
        // Update game logic first
        updateGameLogic(this.#device, this.#game, delta);

        // Render each layer in order (background → text → debug, etc.)
        for (const layer of this.#layers) {
            layer.render(this.#device, this.#game);
        }

        // Clear per-frame input (prevents sticky key issues)
        this.#device.keys.clearFrameKeys();
    }
}

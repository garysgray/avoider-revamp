// ============================================================================
// GameController.js
// Owns the device and game instances, drives the update/render cycle,
// and routes game state to the appropriate handler each frame.
// ============================================================================

// ---- Controller Constants ---------------------------------------------------

const CONTROLLER_CONSTS = Object.freeze(
{
    IDENTITY_TRANSFORM: [1, 0, 0, 1, 0, 0],    // reset canvas transform each frame
});


// ---- Controller -------------------------------------------------------------

class Controller
{
    #device;
    #game;
    #layers;
    #gameConsts;

    constructor(gameConsts = new GameConsts())
    {
        this.#gameConsts = gameConsts;

        try
        {
            this.#game   = new Game();
            this.#device = new Device(
                this.#gameConsts.SCREEN_WIDTH,
                this.#gameConsts.SCREEN_HEIGHT
            );
        }
        catch (err)
        {
            console.error("Controller initialization failed:", err);
            alert("Game initialization failed.");
            return;
        }

        this.#layers = [];
        this.initGameObj();
    }

    // ---- Getters ------------------------------------------------------------

    get device()     { return this.#device; }
    get game()       { return this.#game; }
    get layers()     { return this.#layers; }
    get gameConsts() { return this.#gameConsts; }

    // ---- Initialization -----------------------------------------------------

    // Sets up game assets and registers all render layers
    initGameObj()
    {
        try
        {
            this.#game.initGame(this.#device);
            Layer.addRenderLayers(
            [
                billBoardsLayer,
                gameObjectsLayer,
                hudRenderLayer,
                textRenderLayer
            ],
            this.#layers);
        }
        catch (err) { console.error("Game component init failed:", err); }
    }

    // Adds a single render layer — used for dynamic layer registration
    addLayer(layer)
    {
        if (!layer) { console.error("addLayer: invalid layer."); return; }
        this.#layers.push(layer);
    }

    // ---- Update -------------------------------------------------------------

    // Entry point for the fixed timestep loop — validates delta and clears input
    callUpdateGame(delta)
    {
        if (typeof delta !== "number" || delta <= 0) delta = this.#gameConsts.FALLBACK_DELTA;

        try
        {
            this.updateGame(this.#device, this.#game, delta);
            this.#device.keys.clearFrameKeys();
        }
        catch (err) { console.error("Game update error:", err); }
    }

    // Routes the current game state to the appropriate handler
    updateGame(device, game, delta)
    {
        const stateHandlers =
        {
            [gameStates.INIT]: () => handleInitState(device, game, delta),
            [gameStates.PLAY]: () => handlePlayState(device, game, delta),
            [gameStates.LOSE]: () => handleLoseState(device, game, delta),
        };

        const handler = stateHandlers[game.gameState];
        if (handler) handler();
        else console.warn("Unknown game state:", game.gameState);
    }

    // ---- Render -------------------------------------------------------------

    // Clears the canvas and runs all registered render layers in order
    callRenderGame()
    {
        const { ctx, canvas } = this.#device;

        // Reset any lingering transforms from previous frame
        ctx.setTransform(...CONTROLLER_CONSTS.IDENTITY_TRANSFORM);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try
        {
            for (let i = 0; i < this.#layers.length; i++)
            {
                this.#layers[i].render(this.#device, this.#game);
            }
        }
        catch (err) { console.error("Render error:", err); }
    }
}
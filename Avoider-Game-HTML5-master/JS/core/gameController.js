// ============================================================================
// Controller Class
// Manages the game loop, device, and render layers.
// ============================================================================
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
            this.#game = new Game();
        }
        catch (err)
        {
            console.error("Failed to initialize Game:", err.message);
            alert("An error occurred while initializing the game. Please try again.");
            return;
        }

        try
        {
            this.#device = new Device(this.#gameConsts.SCREEN_WIDTH, this.#gameConsts.SCREEN_HEIGHT);
        }
        catch (err)
        {
            console.error("Failed to initialize Device:", err.message);
            alert("An error occurred while setting up the game environment.");
            return;
        }

        this.#layers = [];
        this.initGameObj();
    }

    // ---- Getters ----
    get device()     { return this.#device; }
    get game()       { return this.#game; }
    get layers()     { return this.#layers; }
    get gameConsts() { return this.#gameConsts; }

    // ---- Init ----
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
        catch (err)
        {
            console.error("Failed to initialize game components:", err.message);
            alert("An error occurred while initializing game components.");
        }
    }

    addLayer(layer)
    {
        if (!layer) { console.error("addLayer: layer is undefined or null."); return; }
        this.#layers.push(layer);
    }

    // ---- Update + Render ----
    callUpdateGame(delta)
    {
        if (typeof delta !== "number" || delta <= 0) delta = this.#gameConsts.FALLBACK_DELTA;

        try
        {
            this.updateGame(this.#device, this.#game, delta);

            for (const layer of this.#layers)
            {
                try   { layer.render(this.#device, this.#game); }
                catch (err) { console.error("Layer render error:", err.message); }
            }

            this.#device.keys.clearFrameKeys();
        }
        catch (err)
        {
            console.error("Game update error:", err.message);
            alert("An error occurred during the game update. Please restart.");
        }
    }

    updateGame(device, game, delta)
    {
        try
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
        catch (err)
        {
            console.error("updateGame error:", err.message);
            alert("An error occurred during the game update. Please restart.");
        }
    }
}
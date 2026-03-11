// ============================================================================
// Controller Class
// Manages the game loop, device, and render layers.
// ============================================================================
class Controller
{
    #device;
    #game;
    #layers;

    constructor()
    {
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
            this.#device = new Device(this.game.gameConsts.SCREEN_WIDTH, this.game.gameConsts.SCREEN_HEIGHT);
        }
        catch (err)
        {
            console.error("Failed to initialize Device:", err.message);
            alert("An error occurred while setting up the game environment.");
            return;
        }

        this.#layers = [];
        this.initGame();
    }

    // ---- Getters ----
    get device() { return this.#device; }
    get game()   { return this.#game; }

    // ---- Init ----
    initGame()
    {
        try
        {
            this.#game.initGame(this.#device);
            this.addLayer(billBoardsLayer);
            this.addLayer(gameObjectsLayer);
            this.addLayer(hudRenderLayer);
            this.addLayer(textRenderLayer);
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
    updateGame(delta)
    {
        if (typeof delta !== "number" || delta <= 0) delta = this.game.gameConsts.FALLBACK_DELTA;

        try
        {
            updateGameStates(this.#device, this.#game, delta);

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
}
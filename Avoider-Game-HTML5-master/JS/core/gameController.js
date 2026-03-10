// ============================================================================
// Controller Class
// ----------------------------------------------------------------------------
// Manages the game loop, device, and render layers.
// Accepts optional mock classes for Jasmine testing.
// ============================================================================
class Controller 
{
    #device;   // Manages canvas and input
    #game;     // Holds core game state and logic
    #layers;   // Render layers (order matters)

    constructor(GameClass = null, DeviceClass = null, canvasEl = null) 
    {
        const GameCtor   = GameClass   || (typeof Game   !== 'undefined' ? Game   : class { initGame() {} });
        const DeviceCtor = DeviceClass || (typeof Device !== 'undefined' ? Device : class {});

        try 
        {
            this.#game = new GameCtor();
        } 
        catch (err) 
        {
            console.error("Failed to initialize Game:", err.message);
            alert("An error occurred while initializing the game. Please try again.");
            return;
        }

        try 
        {
            this.#device = new DeviceCtor(this.game.gameConsts.SCREEN_WIDTH, this.game.gameConsts.SCREEN_HEIGHT, canvasEl);
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

            // Layers must be added in render order
            if (typeof billBoardsLayer  !== 'undefined') this.addLayer(billBoardsLayer);   // backgrounds
            if (typeof gameObjectsLayer !== 'undefined') this.addLayer(gameObjectsLayer);  // game objects
            if (typeof hudRenderLayer   !== 'undefined') this.addLayer(hudRenderLayer);    // HUD
            if (typeof textRenderLayer  !== 'undefined') this.addLayer(textRenderLayer);   // text
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

// ============================================================================
// GameController.js
// Owns the device and game instances, drives the update/render cycle,
// and routes game state to the appropriate handler each frame.
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
        this.#game   = new Game();
        this.#device = new Device(this.#gameConsts.SCREEN_WIDTH, this.#gameConsts.SCREEN_HEIGHT);
        this.#layers = [];
        this.initGameObj();
    }

    // ---- Getters ------------------------------------------------------------

    get device()     { return this.#device; }
    get game()       { return this.#game; }
    get layers()     { return this.#layers; }
    get gameConsts() { return this.#gameConsts; }

    // ---- Initialization -----------------------------------------------------

    initGameObj()
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

    // ---- Update -------------------------------------------------------------

    callUpdateGame(delta)
    {
        this.updateGame(this.#device, this.#game, delta);
        this.#device.keys.clearFrameKeys();
    }

    updateGame(device, game, delta)
    {
        const stateHandlers =
        {
            [gameStates.INIT]: handleInitState,
            [gameStates.PLAY]: handlePlayState,
            [gameStates.LOSE]: handleLoseState,
        };

        const handler = stateHandlers[game.gameState];
        if (handler) handler(device, game, delta);
    }

    // ---- Render -------------------------------------------------------------

    callRenderGame()
    {
        const { ctx, canvas } = this.#device;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.#layers.length; i++)
        {
            this.#layers[i].render(this.#device, this.#game);
        }
    }
}
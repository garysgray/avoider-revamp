// ============================================================================
// main.js — Entry point. Hosts the game loop.
// ============================================================================


// ---- Globals ----------------------------------------------------------------

let myController;
let lastTime    = performance.now();
let accumulator = 0;

const FIXED_TIMESTEP = 1 / 60;
const MAX_FRAME_TIME = 0.25;
const SAFE_START_MS  = 100;
const IDLE_TIMEOUT   = 200;


// ---- Init -------------------------------------------------------------------

window.addEventListener("load", () =>
{
    try
    {
        myController = new Controller();
        DebugUtil.updateDebugPanelVisibility();
        DebugUtil.updateDebugPanelPosition();
        safeStartGame();
    }
    catch (e) { console.error("Initialization failed:", e); }
});


// ---- Game Loop --------------------------------------------------------------

function gameLoop()
{
    try
    {
        const now       = performance.now();
        const frameTime = Math.min((now - lastTime) / 1000, MAX_FRAME_TIME);
        lastTime        = now;
        accumulator    += frameTime;

        while (accumulator >= FIXED_TIMESTEP)
        {
            try   { myController.updateGame(FIXED_TIMESTEP); }
            catch (e) { console.error("updateGame error:", e); }
            accumulator -= FIXED_TIMESTEP;
        }

        DebugUtil.updateDebugPanel();
    }
    catch (e) { console.error("gameLoop error:", e); }
    finally   { requestAnimationFrame(gameLoop); }
}


// ---- Startup ----------------------------------------------------------------

function safeStartGame()
{
    if (!readyToStart()) { setTimeout(safeStartGame, SAFE_START_MS); return; }

    window.requestIdleCallback
        ? requestIdleCallback(startLoop, { timeout: IDLE_TIMEOUT })
        : setTimeout(startLoop, IDLE_TIMEOUT);
}

function readyToStart()
{
    const canvas = document.getElementById("canvas");
    return canvas && canvas.getContext && canvas.width > 0 && canvas.height > 0;
}

function startLoop()
{
    lastTime = performance.now();
    requestAnimationFrame(() => requestAnimationFrame(gameLoop));
}
// ============================================================================
// main.js — Entry point. Hosts the game loop.
// ============================================================================

// ---- Globals ----------------------------------------------------------------
let myController;
let lastTime    = performance.now();
let accumulator = 0;

const FIXED_TIMESTEP = 1 / 60;
const MAX_FRAME_TIME = 0.25;
const MAX_STEPS      = 5;
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

document.addEventListener("visibilitychange", () =>
{
    if (document.visibilityState === "visible") lastTime = performance.now();
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

        let steps = 0;

        while (accumulator >= FIXED_TIMESTEP && steps < MAX_STEPS)
        {
            myController.callUpdateGame(FIXED_TIMESTEP);
            accumulator -= FIXED_TIMESTEP;
            steps++;
        }

        if (steps >= MAX_STEPS) accumulator = 0;

        myController.callRenderGame();

        DebugUtil.updateDebugPanel();
    }
    catch (e)
    {
        console.error("gameLoop error:", e);
    }
    finally
    {
        requestAnimationFrame(gameLoop);
    }
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
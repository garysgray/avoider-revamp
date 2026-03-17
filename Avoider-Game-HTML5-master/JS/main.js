// ============================================================================
// main.js
// Entry point — initializes the controller and runs the fixed timestep game loop.
// ============================================================================

// ---- Loop Constants ---------------------------------------------------------

const FIXED_TIMESTEP = 1 / 60;   // target update rate — 60fps
const MAX_FRAME_TIME = 0.25;      // clamp large frame spikes to prevent spiral of death
const MAX_STEPS      = 5;         // max update steps per frame before draining accumulator
const SAFE_START_MS  = 100;       // polling interval while waiting for canvas to be ready
const IDLE_TIMEOUT   = 200;       // fallback delay if requestIdleCallback is unavailable

// ---- Globals ----------------------------------------------------------------

let myController;
let lastTime    = performance.now();
let accumulator = 0;

// ---- Init -------------------------------------------------------------------

// Bootstraps the controller and begins the startup sequence on page load
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

// Resets lastTime on tab focus to prevent large accumulated deltas after switching tabs
document.addEventListener("visibilitychange", () =>
{
    if (document.visibilityState === "visible") lastTime = performance.now();
});

// ---- Game Loop --------------------------------------------------------------

// Fixed timestep loop — updates at 60fps regardless of render rate.
// Accumulates frame time and steps the simulation in fixed increments.
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

        // Hit the step cap — drain accumulator to avoid a catchup spiral next frame
        if (steps >= MAX_STEPS) accumulator = 0;

        myController.callRenderGame();
        DebugUtil.updateDebugPanel();
    }
    catch (e) { console.error("gameLoop error:", e); }
    finally   { requestAnimationFrame(gameLoop); }
}

// ---- Startup ----------------------------------------------------------------

// Polls until the canvas is ready, then kicks off the loop via idle callback
function safeStartGame()
{
    if (!readyToStart()) { setTimeout(safeStartGame, SAFE_START_MS); return; }

    window.requestIdleCallback
        ? requestIdleCallback(startLoop, { timeout: IDLE_TIMEOUT })
        : setTimeout(startLoop, IDLE_TIMEOUT);
}

// Returns true once the canvas exists and has non-zero dimensions
function readyToStart()
{
    const canvas = document.getElementById("canvas");
    return canvas && canvas.getContext && canvas.width > 0 && canvas.height > 0;
}

// Skips one frame before starting to ensure everything is painted and ready
function startLoop()
{
    lastTime = performance.now();
    requestAnimationFrame(() => requestAnimationFrame(gameLoop));
}
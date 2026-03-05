// ============================================================================
// MAIN.js  MAIN POINT oF ENTRY
// GameLoop resides here! Was called thru index.html
// ============================================================================

// ============================================================================
// DEBUG/TESTING CONTROL AREA
// ============================================================================
let HIT_BOXES = false;
let DEBUG_TEXT = false;

 //HIT_BOXES = true;
// DEBUG_TEXT = true;

let DRAW_DEBUG_TEXT = false; 
let DRAW_DEBUG_HITBOXES = false;

if (HIT_BOXES) DRAW_DEBUG_HITBOXES = true;
if (DEBUG_TEXT) DRAW_DEBUG_TEXT = true;


// =======================================================
// GLOBALS
// =======================================================
let myController;
let lastTime = performance.now();
let accumulator = 0;
let rafId = null;

const FIXED_TIMESTEP = 1 / 60;
const MAX_FRAME_TIME = 0.25;
const SAFE_START_VALUE = 100;
const TIME_OUT_VALUE = 200;
const ONE_THOUSAND = 1000;


// =======================================================
// ENTRY POINT
// =======================================================
window.addEventListener("load", init);

// =======================================================
// INITIALIZATION
// =======================================================
function init() 
{
    try 
    {
        myController = new Controller();
        
        DebugUtil.updateDebugPanelVisibility();
        DebugUtil.updateDebugPanelPosition();
        
        //safeStartGame();
        gameLoop()
    }
    catch (e) 
    {
        console.error("Initialization failed:", e);
    }
}



function gameLoop() 
{
   ;

    //const fixedStep = 1 / 60;
    //const timeInSecs = 1000;
    //const frameTimeMax = 0.25;

    try 
    {
        if (!myController) return;

        const now = performance.now();
        let frameTime = (now - lastTime) / ONE_THOUSAND;
        lastTime = now;

        if (frameTime > MAX_FRAME_TIME) 
        {
            frameTime = MAX_FRAME_TIME;
        }

        accumulator += frameTime;

        while (accumulator >= FIXED_TIMESTEP) 
        {
            try
            {
                myController.updateGame(FIXED_TIMESTEP);
            }
            catch (e)
            {
                console.error("Error during updateGame():", e);
            }

            accumulator -= FIXED_TIMESTEP;
        }

            DebugUtil.updateDebugPanel(); 

    } 
    catch (e) 
    {
        console.error("Unexpected error in gameLoop:", e);
    } 
    finally 
    {
        try 
        {
            requestAnimationFrame(gameLoop);
        }
        catch (e) 
        {
            console.error("Failed to request next animation frame:", e);
        }
    }
}

// called from window.onload() in index.html
function startGameLoop() 
{
    try 
    {
        gameLoop();
    } 
    catch (e)
    {
        console.error("Failed to start game loop:", e);
    }
}

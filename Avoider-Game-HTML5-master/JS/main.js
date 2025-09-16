// ============================================================================
// DEBUG/TESTING CONTROL AREA
// ============================================================================
let HIT_BOXES = false;
let DEBUG_DRAW_HITBOXES = false;

let DEBUG_TEXT = true;
let DRAW_DEBUG = false;

if (HIT_BOXES) DEBUG_DRAW_HITBOXES = true;
if (DEBUG_TEXT) DRAW_DEBUG = true;

// ============================================================================
// Main entry point for the Avoider game
// ============================================================================

let myController;

try {
    myController = new Controller();
} catch (e) {
    console.error("Failed to create Controller instance:", e);
}

// ---------------------------------------------------------------------------
// Fixed timestep game loop setup
// ---------------------------------------------------------------------------
let lastTime = performance.now();
let accumulator = 0;
const fixedStep = 1 / 60;

// --------------------------------------------------------------------------- 
// Main game loop with safety checks
// ---------------------------------------------------------------------------
function gameLoop() {
    try {
        if (!myController) return;

        const now = performance.now();
        let frameTime = (now - lastTime) / 1000;
        lastTime = now;

        if (frameTime > 0.25) frameTime = 0.25;

        accumulator += frameTime;

        while (accumulator >= fixedStep) {
            try {
                if (typeof myController.updateGame === "function") {
                    myController.updateGame(fixedStep);
                } else {
                    console.warn("updateGame() is not a function on Controller.");
                }
            } catch (e) {
                console.error("Error during updateGame():", e);
            }
            accumulator -= fixedStep;
        }

        if (DRAW_DEBUG) {
            
            const device = myController.device;
            const game = myController.game;

            const timer = game?.gameTimers?.getObjectByName?.(GameDefs.timerTypes.GAME_CLOCK);

            texts= [
                `Clock: ${timer.formatted ?? "N/A"}`,
            ];

            posX = 20;
            posY = 30;
            buffY = 25
            
            texts.forEach(text => 
            {
                device.debugText?.(text, posX, posY, "yellow");
                posY += buffY;
            });
  
        }
    } catch (e) {
        console.error("Unexpected error in gameLoop:", e);
    } finally {
        try {
            requestAnimationFrame(gameLoop);
        } catch (e) {
            console.error("Failed to request next animation frame:", e);
        }
    }
}

// called from window.onload() in index.html
function startGameLoop() {
    try {
        gameLoop();
    } catch (e) {
        console.error("Failed to start game loop:", e);
    }
}
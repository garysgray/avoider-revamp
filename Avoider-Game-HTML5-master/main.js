// ============================================================================
// Main entry point for the Avoider game
// This file sets up the Controller, initializes the game, and runs the main loop
// ============================================================================

// Create the main Controller instance
// Controller is responsible for managing the game state, logic, and rendering

//let DEBUG_DRAW_HITBOXES = true;
let DEBUG_DRAW_HITBOXES = false;

let myController = new Controller();

// ---------------------------------------------------------------------------
// Fixed timestep game loop setup
// ---------------------------------------------------------------------------

// Track time for each frame
let lastTime = performance.now();   // Timestamp of the last frame (in ms)
let accumulator = 0;                // Stores leftover time not yet simulated
const fixedStep = 1 / 60;           // Logic update step: 1/60th of a second (~16.67ms)

// ---------------------------------------------------------------------------
// Main game loop
// ---------------------------------------------------------------------------
function gameLoop() 
{
    
    // Measure elapsed real time since the last frame (delta time)
    const now = performance.now();
    let frameTime = (now - lastTime) / 1000; // convert ms → seconds
    lastTime = now;

    // Cap frame time to avoid spiral-of-death during long lags
    //    (e.g., if a tab is backgrounded for a few seconds)
    if (frameTime > 0.25) frameTime = 0.25;

    // Add this frame’s elapsed time to the accumulator
    //    The accumulator decides how many fixed updates should run this frame
    accumulator += frameTime;

    // Run game updates as long as there’s enough accumulated time
    //    Each update advances the game by exactly `fixedStep` seconds
    while (accumulator >= fixedStep) 
    {
        myController.updateGame(fixedStep);  // Update logic + rendering layers
        accumulator -= fixedStep;         // Remove one step from accumulator
    }

    // Optional: Debugging overlay
    // Uncomment for real-time debug text (e.g., splash screen position)
    // myController.device.debugText(myController.game.holdX, 150, 50);

    // Request the next frame from the browser
    requestAnimationFrame(gameLoop);
}

// ---------------------------------------------------------------------------
// Start the loop
// ---------------------------------------------------------------------------
gameLoop();

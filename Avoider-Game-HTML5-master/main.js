//the main page for the avoider game

//make game object that loads game data
var myGame = new Game();

//controller helps set things up and directs how things should work using game
var myControl = new Controller(myGame.gameConsts.SCREEN_WIDTH, myGame.gameConsts.SCREEN_HEIGHT);

//init the actual game using controller 
myControl.initGame(myGame);

// ------------------------------
// FIXED STEP GAME LOOP
// ------------------------------
// Why do this?
// - Keeps game logic running at a stable rate (60 updates/sec).
// - Prevents "fast computers" from running the game faster
//   or "slow computers" from breaking physics updates.
// - Rendering still happens once per frame, so animation stays smooth.

// Time tracking
let lastTime = performance.now();   // The time of the last frame
let accumulator = 0;                // Stores leftover time between updates
const fixedStep = 1 / 60;           // Update step = 1/60 sec (≈16.6ms)

function gameLoop() {
    
    // 1. Measure how much real time passed since the last frame
    const now = performance.now();
    let frameTime = (now - lastTime) / 1000; // Convert ms → seconds
    lastTime = now;

    // Safety check: cap very large frame times
    // (prevents the "spiral of death" if the game lags badly)
    if (frameTime > 0.25) frameTime = 0.25;

    // 2. Add this frame’s time to the accumulator
    accumulator += frameTime;

    // 3. Run the game update as many times as needed
    // Each update advances the game by exactly fixedStep seconds
    while (accumulator >= fixedStep) {
        myControl.updateGame(myGame, fixedStep);
        accumulator -= fixedStep;
    }

    //for debugging game states and what have you
    //myControl.dev.debugText(myGame.splashScreen.posY, 150, 50);

    // 4. clears out key arrays to prevent errors
    myControl.dev.keys.clearFrameKeys();

    // 5. Request the next frame
    requestAnimationFrame(gameLoop);
}

// Kick it off
gameLoop();

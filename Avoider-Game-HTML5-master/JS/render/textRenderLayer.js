// **Text Rendering Layer**
// Called by controller inside render pipeline.
// Responsible for drawing all on-screen text (HUD, score, ammo, lives, 
// pause/resume prompts, win/lose messages, etc).
// No game logic is executed here — this function only handles text rendering.

function renderTextLayer(device, game) 
{
    // Define layout positions as percentages of canvas height/width
    const layout = 
    {
        initTextY: [0.7, 0.75, 0.8, 0.85],   // Intro screen text lines
        hudY: 0.95,                          // HUD vertical placement
        hudAmmoX: 0.05,                      // Left-side HUD text (Ammo)
        hudLivesX: 0.85,                     // Right-side HUD text (Lives)
        pauseY: 0.65,                        // Pause message placement
        winLoseY: 0.65                       // Win/Lose screen placement
    };

    // Store canvas dimensions for positioning text
    const cw = device.canvas.width;
    const ch = device.canvas.height;

    // TODO: Replace with scalable font size (currently fixed "magic number")
    const fontSize = 16;

    // Set default font and color
    device.setFont(`bold ${fontSize}pt Calibri`);
    device.colorText("white");

    // Switch behavior based on current game state
    switch (game.state) 
    {

        // ==============================
        // INIT STATE: Splash + instructions
        // ==============================
        case gameStates.INIT:
            layout.initTextY.forEach((pct, idx) => {
                const msg = [
                    "SHOOT THE ORBS!!!",
                    "CATCH FIRE BALLS TO GET AMMO",
                    "USE SPACE-BAR TO FIRE",
                    "PRESS THE SPACE-BAR TO START"
                ][idx];
                device.centerTextOnY(msg, ch * pct);
            });
            break;

        // ==============================
        // PLAY STATE: HUD elements (score, ammo, lives)
        // ==============================
        case gameStates.PLAY:
            device.colorText("red");  // HUD uses red to stand out
            device.centerTextOnY("Score: " + game.score, ch * layout.hudY);
            device.putText("Ammo: " + game.ammo, cw * layout.hudAmmoX, ch * layout.hudY);
            device.putText("Lives: " + game.lives, cw * layout.hudLivesX, ch * layout.hudY);
            break;

        // ==============================
        // PAUSE STATE: Resume prompt
        // ==============================
        case gameStates.PAUSE:
            device.colorText("white");
            device.centerTextOnY("PRESS P TO RESUME GAME", ch * layout.pauseY);
            break;

        // ==============================
        // WIN STATE: Replay prompt
        // ==============================
        case gameStates.WIN:
            device.centerTextOnY("PRESS R TO PLAY AGAIN", ch * layout.winLoseY);
            break;

        // ==============================
        // LOSE STATE: Retry/Revive prompt
        // ==============================
        case gameStates.LOSE:
            if (game.lives <= 0) 
            {
                device.centerTextOnY("SORRY YOU LOST, PRESS R TO RETRY", ch * layout.winLoseY);
            } 
            else 
            {
                device.centerTextOnY("SORRY YOU DIED, PRESS R TO REVIVE", ch * layout.winLoseY);
            }
            break;
    }
}

// Wrap it in a Layer object for controller
const textRenderLayer = new Layer("HUD/Text", renderTextLayer);

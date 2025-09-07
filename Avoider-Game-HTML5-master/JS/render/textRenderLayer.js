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
        initTextY: [0.57, 0.62, 0.67, 0.72],   // Intro screen text lines
        hudY: 0.95,                          // HUD vertical placement
        hudAmmoX: 0.05,                      // Left-side HUD text (Ammo)
        hudLivesX: 0.85,                     // Right-side HUD text (Lives)
        pauseY: 0.57,                        // Pause message placement
        winLoseY: 0.57                       // Win/Lose screen placement
    }; 

    // Store canvas dimensions for positioning text
    const cw = device.canvas.width;
    const ch = device.canvas.height;

    // Set default font and color
    device.setFont(game.gameConsts.FONT_SETTINGS);
    device.colorText(game.gameConsts.FONT_COLOR);

    // Switch behavior based on current game state
    switch (game.gameState) 
    {
 
        // ==============================
        // INIT STATE: Splash + instructions
        // ==============================
        case GameDefs.gameStates.INIT:
            layout.initTextY.forEach((pct, idx) => {
                instructions = GameDefs.gameTexts.INIT.INSTRUCTIONS[idx];
                device.centerTextOnY(instructions, ch * pct);
            });
            break;

        // ==============================
        // PLAY STATE: HUD elements (score, ammo, lives)
        // ==============================
        case GameDefs.gameStates.PLAY:
            device.colorText("red");  // HUD uses red to stand out
            device.centerTextOnY(GameDefs.gameTexts.HUD.SCORE + game.score, ch * layout.hudY);
            device.putText(GameDefs.gameTexts.HUD.AMMO + game.ammo, cw * layout.hudAmmoX, ch * layout.hudY);
            device.putText(GameDefs.gameTexts.HUD.LIVES + game.lives, cw * layout.hudLivesX, ch * layout.hudY);

            break;

        // ==============================
        // PAUSE STATE: Resume prompt
        // ==============================
        case GameDefs.gameStates.PAUSE:
            device.colorText("white");
            device.centerTextOnY(GameDefs.gameTexts.PAUSE.MESSAGE, ch * layout.pauseY);
            break;

        // ==============================
        // WIN STATE: Replay prompt
        // ==============================
        case GameDefs.gameStates.WIN:
            device.centerTextOnY(GameDefs.gameTexts.WIN.MESSAGE, ch * layout.winLoseY);
            break;

        // ==============================
        // LOSE STATE: Retry/Revive prompt
        // ==============================
        case GameDefs.gameStates.LOSE:
            if (game.lives <= 0) 
            {
                device.centerTextOnY(GameDefs.gameTexts.LOSE.LOSE_MESSAGE, ch * layout.winLoseY);
            } 
            else 
            {
                device.centerTextOnY(GameDefs.gameTexts.LOSE.DIE_MESSAGE, ch * layout.winLoseY);
                
            }
            break;
    }
}

// Wrap it in a Layer object for controller
const textRenderLayer = new Layer("HUD/Text", renderTextLayer);

// ============================================================================
// Text Rendering Layer
// ----------------------------------------------------------------------------
// Called by controller inside render pipeline.
// Responsible for drawing all on-screen text (HUD, score, ammo, lives, 
// pause/resume prompts, win/lose messages, etc).
// No game logic is executed here — this function only handles text rendering.
// ============================================================================

function renderTextLayer(device, game) 
{
    try 
    {
        // Ensure canvas exists
        if (!device.canvas) 
        {
            console.warn("Device canvas not found.");
            return;
        }

        const cw = device.canvas.width;
        const ch = device.canvas.height;
        if (cw === 0 || ch === 0) 
        {
            console.warn("Canvas has zero width/height.");
            return;
        }

        // Define layout positions as percentages of canvas height/width
        const layout = {
            initTextY: [0.57, 0.62, 0.67, 0.72],   // Intro screen text lines
            hudY: .07,                          // HUD vertical placement
            hudAmmoX: 0.20,                      // Left-side HUD text (Ammo)
            hudLivesX: 0.70,                     // Right-side HUD text (Lives)
            pauseY: 0.57,                        // Pause message placement
            winLoseY: 0.57,                        // Win/Lose screen placement
            hudY2: .095, 
            hudY3: .05,                     
        };

        // Set default font and color
        if (typeof device.setFont === "function") 
        {
            device.setFont(game.gameConsts.FONT_SETTINGS);
        }
        if (typeof device.colorText === "function") 
        {
            device.colorText(game.gameConsts.FONT_COLOR);
        }

        switch (game.gameState) 
        {
            // ==============================
            // INIT STATE: Splash + instructions
            // ==============================
            case GameDefs.gameStates.INIT:
                if (Array.isArray(layout.initTextY) && Array.isArray(GameDefs.gameTexts.INIT.INSTRUCTIONS)) 
                {
                    layout.initTextY.forEach((pct, idx) => {
                        const instructions = GameDefs.gameTexts.INIT.INSTRUCTIONS[idx];
                        if (instructions && typeof device.centerTextOnY === "function") 
                        {
                            device.centerTextOnY(instructions, ch * pct);
                        } 
                        else
                        {
                            console.warn(`Missing instruction text at index ${idx}`);
                        }
                    });
                }
                break;

            // ==============================
            // PLAY STATE: HUD elements (score, ammo, lives)
            // ==============================
            case GameDefs.gameStates.PLAY:
                try {
                    device.colorText("red");
                    const scoreText = GameDefs.gameTexts.HUD.SCORE + game.score;
                    if (typeof device.centerTextOnY === "function") 
                    {
                        device.centerTextOnY(scoreText, ch * layout.hudY2);
                    }

                    const ammoText = GameDefs.gameTexts.HUD.AMMO + game.ammo;
                    const livesText = GameDefs.gameTexts.HUD.LIVES + game.lives;

                    if (typeof device.putText === "function") 
                    {
                        device.putText(ammoText, cw * layout.hudAmmoX, ch * layout.hudY);
                        device.putText(livesText, cw * layout.hudLivesX, ch * layout.hudY);
                    }

                    const timer = game.gameTimers.getObjectByName(GameDefs.timerTypes.GAME_CLOCK);
                    device.centerTextOnY(`Clock: ${timer.formatted}`, (ch * layout.hudY3) );

                } catch (e) {
                    console.error("Error rendering HUD text:", e);
                }
                break;

            // ==============================
            // PAUSE STATE: Resume prompt
            // ==============================
            case GameDefs.gameStates.PAUSE:
                try {
                    device.colorText("white");
                    const pauseMsg = GameDefs.gameTexts.PAUSE.MESSAGE;
                    if (pauseMsg && typeof device.centerTextOnY === "function") 
                    {
                        device.centerTextOnY(pauseMsg, ch * layout.pauseY);
                    }
                } catch (e) {
                    console.error("Error rendering pause text:", e);
                }
                break;

            // ==============================
            // WIN STATE: Replay prompt
            // ==============================
            case GameDefs.gameStates.WIN:
                try {
                    const winMsg = GameDefs.gameTexts.WIN.MESSAGE;
                    if (winMsg && typeof device.centerTextOnY === "function") 
                    {
                        device.centerTextOnY(winMsg, ch * layout.winLoseY);
                    }
                } catch (e) {
                    console.error("Error rendering win text:", e);
                }
                break;

            // ==============================
            // LOSE STATE: Retry/Revive prompt
            // ==============================
            case GameDefs.gameStates.LOSE:
                try {
                    if (game.lives <= 0) {
                        const loseMsg = GameDefs.gameTexts.LOSE.LOSE_MESSAGE;
                        if (loseMsg && typeof device.centerTextOnY === "function") 
                        {
                            device.centerTextOnY(loseMsg, ch * layout.winLoseY);
                        }
                    } else {
                        const dieMsg = GameDefs.gameTexts.LOSE.DIE_MESSAGE;
                        if (dieMsg && typeof device.centerTextOnY === "function")
                        {
                            device.centerTextOnY(dieMsg, ch * layout.winLoseY);
                        }
                    }
                } catch (e) {
                    console.error("Error rendering lose text:", e);
                }
                break;

            default:
                console.warn("Unknown game state in text layer:", game.gameState);
                break;
        }
    } catch (e) {
        console.error("Unexpected error in renderTextLayer:", e);
    }
}

// Wrap it in a Layer object for controller
const textRenderLayer = new Layer("HUD/Text", renderTextLayer);

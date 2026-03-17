// ============================================================================
// HudRenderLayer.js
// Renders the HUD bar — score, ammo, and survival clock.
// No game logic — drawing only.
// ============================================================================

// ---- HUD Constants ----------------------------------------------------------

const HUD_CONSTS = Object.freeze(
{
    AMMO_X  : 0.20,    // ammo text x position as fraction of screen width
    SCORE_X : 0.70,    // score text x position as fraction of screen width
    HUD_Y   : 0.045,   // text y position as fraction of screen height
});


// ---- HUD Render -------------------------------------------------------------

function renderHUDLayer(device, game)
{
    // Only render during active gameplay and death screen
    const showHUD = game.gameState === gameStates.PLAY ||
                    game.gameState === gameStates.LOSE;
    if (!showHUD) return;

    const cw = game.gameConsts.SCREEN_WIDTH;
    const ch = game.gameConsts.SCREEN_HEIGHT;

    try
    {
        device.setFont(game.gameConsts.FONT_SETTINGS);
        device.colorText(game.gameConsts.FONT_COLOR);

        // Draw HUD background bar
        const board  = game.billBoards.getObjectByName(billBoardTypes.HUD.name);
        const hudImg = device.images.getImage(billBoardTypes.HUD.name);
        if (board && hudImg)
        {
            device.renderImage(hudImg, board.posX, board.posY, cw, ch * game.gameConsts.HUD_BUFFER);
        }

        // Draw ammo, score, and survival clock
        const timer = game.gameTimers.getObjectByName(timerTypes.GAME_CLOCK);
        device.putText(gameTexts.HUD.AMMO  + game.ammo,  cw * HUD_CONSTS.AMMO_X,  ch * HUD_CONSTS.HUD_Y);
        device.putText(gameTexts.HUD.SCORE + game.score, cw * HUD_CONSTS.SCORE_X, ch * HUD_CONSTS.HUD_Y);
        device.centerTextOnY(`${gameTexts.HUD.CLOCK}${timer.formatted}`, ch * HUD_CONSTS.HUD_Y);
    }
    catch (e) { console.error("Error rendering HUD:", e); }
}

const hudRenderLayer = new Layer("HUD/Text", renderHUDLayer);
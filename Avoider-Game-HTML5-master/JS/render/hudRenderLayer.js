// ============================================================================
// hudRenderLayer.js
// Renders all HUD text: score, ammo, lives, clock.
// No game logic — drawing only.
// ============================================================================

function renderHUDLayer(device, game)
{
    const cw = game.gameConsts.SCREEN_WIDTH;
    const ch = game.gameConsts.SCREEN_HEIGHT;

    const layout =
    {
        ammoX:  0.20,
        scoreX: 0.70,
        hudY:   0.059,
    };

    const showHUD = game.gameState === gameStates.PLAY ||
                    game.gameState === gameStates.LOSE;

    if (!showHUD) return;

    try
    {
        device.setFont(game.gameConsts.FONT_SETTINGS);
        device.colorText(game.gameConsts.FONT_COLOR);

        const board  = game.billBoards.getObjectByName(billBoardTypes.HUD.name);
        const hudImg = device.images.getImage(billBoardTypes.HUD.name);

        if (board && hudImg)
        {
            device.renderImage(hudImg, board.posX, board.posY, cw, ch * game.gameConsts.HUD_BUFFER);
        }

        const timer = game.gameTimers.getObjectByName(timerTypes.GAME_CLOCK);

        device.putText(gameTexts.HUD.AMMO  + game.ammo,  cw * layout.ammoX,  ch * layout.hudY);
        device.putText(gameTexts.HUD.SCORE + game.score, cw * layout.scoreX, ch * layout.hudY);
        device.centerTextOnY(`Clock: ${timer.formatted}`,         ch * layout.hudY);
    }
    catch (e) { console.error("Error rendering HUD:", e); }
}

const hudRenderLayer = new Layer("HUD/Text", renderHUDLayer);
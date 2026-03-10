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
        scoreY: 0.70,
        hudY:   0.08,
    };

    device.setFont(game.gameConsts.FONT_SETTINGS);
    device.colorText(game.gameConsts.FONT_COLOR);

    switch (game.gameState)
    {
        case GameDefs.gameStates.PLAY:
            try
            {
                const board  = game.billBoards.getObjectByName(GameDefs.billBoardTypes.HUD.name);
                const hudImg = device.images.getImage(GameDefs.billBoardTypes.HUD.name);

                if (board && hudImg)
                {
                    device.renderImage(hudImg, board.posX, board.posY, cw, ch * game.gameConsts.HUD_BUFFER);
                }

                const timer = game.gameTimers.getObjectByName(GameDefs.timerTypes.GAME_CLOCK);

                device.putText(GameDefs.gameTexts.HUD.AMMO  + game.ammo,  cw * layout.ammoX,  ch * layout.hudY);
                device.putText(GameDefs.gameTexts.HUD.SCORE + game.score, cw * layout.scoreY, ch * layout.hudY);
                device.centerTextOnY(`Clock: ${timer.formatted}`,         ch * layout.hudY);
            }
            catch (e) { console.error("Error rendering PLAY HUD:", e); }
            break;

            // ==============================
            // LOSE STATE: Restart/Revive prompt
            // ==============================
            case GameDefs.gameStates.LOSE:
                try 
                {
                } 
                catch (e) 
                {
                    console.error("Error rendering lose HUD:", e);
                }
                break;

            default:
                console.warn("Unknown game state in HUD layer:", game.gameState);
                break;
    }
}

const hudRenderLayer = new Layer("HUD/Text", renderHUDLayer);
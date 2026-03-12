// ============================================================================
// textRenderLayer.js
// Renders all on-screen text messages per game state.
// No game logic — drawing only.
// ============================================================================

function renderTextLayer(device, game)
{
    const ch = game.gameConsts.SCREEN_HEIGHT;

    const layout =
    {
        initTextY:  [0.57, 0.62, 0.67, 0.72, 0.77],
        messageY:   0.57,
    };

    device.setFont(game.gameConsts.FONT_SETTINGS);
    device.colorText(game.gameConsts.FONT_COLOR);

    switch (game.gameState)
    {
        case gameStates.INIT:
            try
            {
                layout.initTextY.forEach((pct, i) =>
                    device.centerTextOnY(GameDefs.gameTexts.INIT.INSTRUCTIONS[i], ch * pct)
                );
            }
            catch (e) { console.error("Error rendering INIT text:", e); }
            break;

        case gameStates.LOSE:
            try
            {
                const msg = game.lives <= 0
                    ? GameDefs.gameTexts.LOSE.LOSE_MESSAGE
                    : GameDefs.gameTexts.LOSE.DIE_MESSAGE;
                device.centerTextOnY(msg, ch * layout.messageY);
            }
            catch (e) { console.error("Error rendering LOSE text:", e); }
            break;
    }
}

const textRenderLayer = new Layer("Text", renderTextLayer);
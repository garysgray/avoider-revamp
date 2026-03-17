// ============================================================================
// TextRenderLayer.js
// Renders all on-screen text messages per game state.
// No game logic — drawing only.
// ============================================================================

// ---- Text Layout Constants --------------------------------------------------

const TEXT_CONSTS = Object.freeze(
{
    // Y positions for INIT instruction lines as fractions of screen height
    INIT_TEXT_Y : [0.57, 0.62, 0.67, 0.72, 0.77],

    // Y position for LOSE message as fraction of screen height
    MESSAGE_Y   : 0.57,
});


// ---- Text Render ------------------------------------------------------------

function renderTextLayer(device, game)
{
    const ch = game.gameConsts.SCREEN_HEIGHT;

    device.setFont(game.gameConsts.FONT_SETTINGS);
    device.colorText(game.gameConsts.FONT_COLOR);

    switch (game.gameState)
    {
        // Render instruction lines on the splash/start screen
        case gameStates.INIT:
            try
            {
                TEXT_CONSTS.INIT_TEXT_Y.forEach((pct, i) =>
                    device.centerTextOnY(gameTexts.INIT.INSTRUCTIONS[i], ch * pct)
                );
            }
            catch (e) { console.error("Error rendering INIT text:", e); }
            break;

        case gameStates.LOSE:
            try
            {
                device.centerTextOnY(gameTexts.LOSE.DIE_MESSAGE, ch * TEXT_CONSTS.MESSAGE_Y);
            }
            catch (e) { console.error("Error rendering LOSE text:", e); }
            break;
    }
}

const textRenderLayer = new Layer("Text", renderTextLayer);
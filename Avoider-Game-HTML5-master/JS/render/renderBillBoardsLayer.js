// ============================================================================
// billBoardsLayer.js
// Renders background and state-based splash overlays.
// No game logic — drawing only.
// ============================================================================

function renderBillBoardsLayer(device, game)
{
    const yBuff     = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT;
    const board     = game.billBoards.getObjectByName(GameDefs.billBoardTypes.BACKGROUND.name);
    const bgImage   = device.images.getImage(GameDefs.billBoardTypes.BACKGROUND.name);

    if (board && bgImage)
    {
        try   { board.render(device, game, bgImage); }
        catch (e) { console.error("Failed to render background:", e); }
    }

    const showSplash = game.gameState === GameDefs.gameStates.INIT  ||
                       game.gameState === GameDefs.gameStates.LOSE;

    if (showSplash)
    {
        const splash     = game.billBoards.getObjectByName(GameDefs.billBoardTypes.SPLASH.name);
        const splashImg  = device.images.getImage(GameDefs.billBoardTypes.SPLASH.name);

        if (splash && splashImg)
        {
            try   { splash.render(device, splashImg, yBuff); }
            catch (e) { console.error("Failed to render splash:", e); }
        }
    }
}

const billBoardsLayer = new Layer("BillBoards", renderBillBoardsLayer);
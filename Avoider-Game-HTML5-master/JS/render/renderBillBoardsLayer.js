// ============================================================================
// billBoardsLayer.js
// Renders background and state-based splash overlays.
// No game logic — drawing only.
// ============================================================================
function renderBillBoardsLayer(device, game)
{
    device.ctx.clearRect(0, 0, device.canvas.width, device.canvas.height);
    
    const yBuff     = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT;
    const board     = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
    const bgImage   = device.images.getImage(billBoardTypes.BACKGROUND.name);

    if (board && bgImage)
    {
        try   { board.render(device, game, bgImage); }
        catch (e) { console.error("Failed to render background:", e); }
    }

    const showSplash = game.gameState === gameStates.INIT  ||
                       game.gameState === gameStates.LOSE;

    if (showSplash)
    {
        const splash     = game.billBoards.getObjectByName(billBoardTypes.SPLASH.name);
        const splashImg  = device.images.getImage(billBoardTypes.SPLASH.name);

        if (splash && splashImg)
        {
            try   { splash.render(device, splashImg, yBuff); }
            catch (e) { console.error("Failed to render splash:", e); }
        }
    }
}

const billBoardsLayer = new Layer("BillBoards", renderBillBoardsLayer);
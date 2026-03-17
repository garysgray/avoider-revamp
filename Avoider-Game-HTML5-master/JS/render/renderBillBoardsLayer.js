// ============================================================================
// RenderBillBoardsLayer.js
// Renders the scrolling background and state-based splash overlays.
// No game logic — drawing only.
// ============================================================================

function renderBillBoardsLayer(device, game)
{
    // Clear before drawing backgrounds — prevents ghosting from previous frame
    device.ctx.clearRect(0, 0, device.canvas.width, device.canvas.height);

    // Draw scrolling parallax background
    const board   = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
    const bgImage = device.images.getImage(billBoardTypes.BACKGROUND.name);
    if (board && bgImage)
    {
        try   { board.render(device, game, bgImage); }
        catch (e) { console.error("Failed to render background:", e); }
    }

    // Draw splash screen on INIT and LOSE — overlays the background
    const showSplash = game.gameState === gameStates.INIT ||
                       game.gameState === gameStates.LOSE;
    if (showSplash)
    {
        const yBuff     = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT;
        const splash    = game.billBoards.getObjectByName(billBoardTypes.SPLASH.name);
        const splashImg = device.images.getImage(billBoardTypes.SPLASH.name);
        if (splash && splashImg)
        {
            try   { splash.render(device, splashImg, yBuff); }
            catch (e) { console.error("Failed to render splash:", e); }
        }
    }
}

const billBoardsLayer = new Layer("BillBoards", renderBillBoardsLayer);
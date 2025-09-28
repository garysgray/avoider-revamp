// ============================================================================
// BillBoards Render Layer
// ----------------------------------------------------------------------------
// Handles rendering of all core game visuals (background, splash, objects, player, UI overlays). 
// Called by the Controller during the main update cycle
// Responsible only for drawing (no game logic here)
// Uses game state to decide what to render
// ============================================================================

function renderBillBoardsLayer(device, game) 
{   
    try 
    {
        const yBuff = (game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT); 

        const board = game.billBoards.getObjectByName(GameDefs.billBoardTypes.BACKGROUND.type);
        const bgImage = device.images.getImage(GameDefs.billBoardTypes.BACKGROUND.type);
        if (board && bgImage) 
        {
            try 
            {
                board.render(device, game, bgImage);
            } 
            catch (e) 
            {
                console.error("Failed to render background image:", e);
            }      
        } 
        else
        { 
            console.warn("Background board or image missing.");
        }

        // === Render Based on Game State ===
        switch (game.gameState) 
        {
            case GameDefs.gameStates.INIT: 
            {
                const board = game.billBoards.getObjectByName(GameDefs.billBoardTypes.SPLASH.type);
                const splashImg = device.images.getImage(GameDefs.billBoardTypes.SPLASH.type);
                if (board && splashImg) 
                {
                    try 
                    {
                        board.render(device, splashImg, yBuff);
                    } 
                    catch (e) 
                    {
                        console.error("Failed to render splash image:", e);
                    }
                }
            } 
            break;

            case GameDefs.gameStates.PLAY: 
            {
            }
            break;

            case GameDefs.gameStates.PAUSE:
            {
                const board = game.billBoards.getObjectByName(GameDefs.billBoardTypes.PAUSE.type);
                const pauseImg = device.images.getImage(GameDefs.billBoardTypes.PAUSE.type);
                if (board && pauseImg) 
                {
                    try 
                    {
                        board.render(device, pauseImg, yBuff);
                    } 
                    catch (e) 
                    {
                        console.error("Failed to render pause screen:", e);
                    }
                }
            } 
            break;

            case GameDefs.gameStates.WIN: 
            {
                // Reserved for future win state content
            } 
            break;

            case GameDefs.gameStates.LOSE: 
            {
                const board = game.billBoards.getObjectByName(GameDefs.billBoardTypes.DIE.type);
                const dieImg = device.images.getImage(GameDefs.billBoardTypes.DIE.type);
                if (board && dieImg) 
                {
                    try 
                    { 
                        board.render(device, dieImg, yBuff);   
                    } 
                    catch (e) 
                    {
                        console.error("Failed to render die screen:", e);
                    }
                }
            } 
            break;

            default:
                console.warn("Unknown game state:", game.gameState);
                break;
        }
    } 
    catch (e) 
    {
        console.error("Unexpected error in renderGameObjectsLayer:", e);
    }
}

// === Layer Registration ===
const billBoardsLayer = new Layer("GameObjects", renderBillBoardsLayer);

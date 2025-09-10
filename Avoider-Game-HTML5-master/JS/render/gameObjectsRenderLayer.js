/**
 * GameObjects Layer
 * -----------------
 * Handles rendering of all core game visuals (background, splash, objects, player, UI overlays).
 * 
 * - Called by the Controller during the main update cycle
 * - Responsible only for drawing (no game logic here)
 * - Uses game state to decide what to render
 */
function renderGameObjectsLayer(device, game) 
{   
    try {
        // === Render Static Background ===
        let board = game.billBoards.getObjectByName?.(GameDefs.billBoardTypes.BACKGROUND.type);
        const bgImage = device.images.getImage?.(GameDefs.billBoardTypes.BACKGROUND.type);
        if (board && bgImage) {
            try {
                device.renderImage?.(
                    bgImage,
                    board.posX ?? 0,
                    board.posY ?? 0,
                    game.gameConsts.SCREEN_WIDTH ?? 0,
                    game.gameConsts.SCREEN_HEIGHT ?? 0
                );
            } catch (e) {
                console.error("Failed to render background image:", e);
            }
        } else {
            console.warn("Background board or image missing.");
        }

        // === Render Based on Game State ===
        switch (game.gameState) {
            case GameDefs.gameStates.INIT: {
                const buff = (game.gameConsts?.HUD_BUFFER ?? 0) * (game.gameConsts?.SCREEN_HEIGHT ?? 0);
                board = game.billBoards.getObjectByName?.(GameDefs.billBoardTypes.SPLASH.type);
                const splashImg = device.images.getImage?.(GameDefs.billBoardTypes.SPLASH.type);
                if (board && splashImg) {
                    try {
                        device.renderImage?.(splashImg, board.posX ?? 0, (board.posY ?? 0) - buff);
                    } catch (e) {
                        console.error("Failed to render splash image:", e);
                    }
                }
            } break;

            case GameDefs.gameStates.PLAY: {
                try {
                    renderNPCSprites?.(device, game);
                    renderBullets?.(device, game);
                    renderPlayer?.(device, game);
                } catch (e) {
                    console.error("Error rendering gameplay objects:", e);
                }
            } break;

            case GameDefs.gameStates.PAUSE: {
                const buff = (game.gameConsts?.HUD_BUFFER ?? 0) * (game.gameConsts?.SCREEN_HEIGHT ?? 0);
                board = game.billBoards.getObjectByName?.(GameDefs.billBoardTypes.PAUSE.type);
                const pauseImg = device.images.getImage?.(GameDefs.billBoardTypes.PAUSE.type);
                if (board && pauseImg) {
                    try {
                        device.renderImage?.(pauseImg, board.posX ?? 0, (board.posY ?? 0) - buff);
                    } catch (e) {
                        console.error("Failed to render pause screen:", e);
                    }
                }
            } break;

            case GameDefs.gameStates.WIN: {
                // Reserved for future win state content
            } break;

            case GameDefs.gameStates.LOSE: {
                const buff = (game.gameConsts?.HUD_BUFFER ?? 0) * (game.gameConsts?.SCREEN_HEIGHT ?? 0); 
                board = game.billBoards.getObjectByName?.(GameDefs.billBoardTypes.DIE.type);
                const dieImg = device.images.getImage?.(GameDefs.billBoardTypes.DIE.type);
                if (board && dieImg) {
                    try {
                        device.renderImage?.(dieImg, board.posX ?? 0, (board.posY ?? 0) - buff);
                    } catch (e) {
                        console.error("Failed to render die screen:", e);
                    }
                }
                try {
                    renderPlayer?.(device, game);
                } catch (e) {
                    console.error("Failed to render player on lose screen:", e);
                }
            } break;

            default:
                console.warn("Unknown game state:", game.gameState);
                break;
        }
    } catch (e) {
        console.error("Unexpected error in renderGameObjectsLayer:", e);
    }
}

// === Layer Registration ===
const gameObjectsLayer = new Layer("GameObjects", renderGameObjectsLayer);

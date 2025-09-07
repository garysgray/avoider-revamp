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
    // === Render Static Background ===
    device.renderImage(
        device.images.getImage(GameDefs.billBoardTypes.BACKGROUND.type),
        game.backGround.posX,
        game.backGround.posY,
        game.gameConsts.SCREEN_WIDTH,
        game.gameConsts.SCREEN_HEIGHT    
    ); 
   
    // === Render Based on Game State ===
    switch (game.gameState)
    {
        case GameDefs.gameStates.INIT: // Splash / Init screen
        {   
            const buff = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT;
            // Show splash image, no game objects yet
            device.renderImage(
                device.images.getImage(GameDefs.billBoardTypes.SPLASH.type),
                game.splashScreen.posX,
                game.splashScreen.posY - buff
            );     
        }
        break;
        
        case GameDefs.gameStates.PLAY: // Main gameplay
        {          
            // Render all active game objects
            renderNPCSprites(device, game);
            renderBullets(device, game);
            renderPlayer(device, game);           
        }
        break;

        case GameDefs.gameStates.PAUSE: // Pause overlay
        {   
            const buff = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT;         
            // Show pause screen, no player render
            device.renderImage(
                device.images.getImage(GameDefs.billBoardTypes.PAUSE.type),
                game.pauseScreen.posX,
                game.pauseScreen.posY - buff
            );  
            
            // // FIX experiment
            // device.ctx.fillStyle = "green";
            // device.ctx.fillRect(20, 20, 75, 50);
            // device.ctx.globalAlpha = 0.2;
            // device.ctx.fillStyle = "yellow";
            // device.ctx.fillRect(50, 50, 75, 50);
            // device.ctx.fillStyle = "red";
            // device.ctx.fillRect(80, 80, 75, 50);
            // device.ctx.globalAlpha = 0.0;
        }
        break;

        case GameDefs.gameStates.WIN: // Win screen (future use)
        {
            // Reserved for future win state content
        }
        break;

        case GameDefs.gameStates.LOSE: // Lose screen
        {	
            // Show "die" overlay and player’s final position
            const buff = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT; 
            device.renderImage(
                device.images.getImage(GameDefs.billBoardTypes.DIE.type),
                game.dieScreen.posX,
                game.dieScreen.posY - buff
            );
            renderPlayer(device, game);
        }
        break;

        default:
            // No-op fallback
    }	
}

// === Layer Registration ===
// Wrap render function into a Layer for the Controller
const gameObjectsLayer = new Layer("GameObjects", renderGameObjectsLayer);

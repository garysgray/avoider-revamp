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
        device.images.getImage(imageTypes.BACKGROUND),
        game.backGround.posX,
        game.backGround.posY,
        game.gameConsts.SCREEN_WIDTH,
        game.gameConsts.SCREEN_HEIGHT    
    ); 
        
    // === Render Based on Game State ===
    switch (game.state)
    {
        case gameStates.INIT: // Splash / Init screen
        {    
            // Show splash image, no game objects yet
            device.centerImage(
                device.images.getImage(imageTypes.SPLASH),
                game.splashScreen.posX,
                game.splashScreen.posY
            );      
        }
        break;
        
        case gameStates.PLAY: // Main gameplay
        {          
            // Render all active game objects
            renderNPCSprites(device, game);
            renderBullets(device, game);
            renderPlayer(device, game);           
        }
        break;

        case gameStates.PAUSE: // Pause overlay
        {            
            // Show pause screen, no player render
            device.centerImage(
                device.images.getImage(imageTypes.PAUSE),
                game.pauseScreen.posX,
                game.pauseScreen.posY
            );            
        }
        break;

        case gameStates.WIN: // Win screen (future use)
        {
            // Reserved for future win state content
        }
        break;

        case gameStates.LOSE: // Lose screen
        {	
            // Show "die" overlay and player’s final position
            device.centerImage(
                device.images.getImage(imageTypes.DIE),
                game.dieScreen.posX,
                game.dieScreen.posY
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

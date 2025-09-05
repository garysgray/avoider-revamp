//---------------------------------------------------------------
// Update Game Logic
// - Called each frame from the controller's update() function
// - Handles core game logic, input responses, and state transitions
// - Updates all game objects depending on current game state
//---------------------------------------------------------------
function updateGameLogic(device, game, delta)
{		
    switch(game.state)
    {
        //-------------------------------------------------------
        // INIT STATE
        // - Reset the entire game (fresh start)
        // - Wait for user input to begin playing
        //-------------------------------------------------------
        case gameStates.INIT:
        {
            // Reset map, player, and game objects
            game.setGame(device);           

            // Start game when the play key (e.g., spacebar) is pressed
            if(device.keys.isKeyPressed(keyTypes.PLAY_KEY))
            {
                game.state = gameStates.PLAY;
            }
        }
        break;

        //-------------------------------------------------------
        // PLAY STATE
        // - Active gameplay: update player, NPCs, projectiles
        // - Handle input, collisions, and timers
        //-------------------------------------------------------
        case gameStates.PLAY:
        {
            // --- Handle Input ---
            checkUserKeyInput(device, game);

            // --- Update Player ---
            game.player.update(device, game, delta);

            // Shield timer (seconds-based)
            if (game.timer.active) 
            {
                if (game.timer.update(delta)) 
                {
                    game.playState = playStates.AVOID;
                }
            }

            // --- Update NPCs & Projectiles ---
            updateNPCSprites(device, game, delta);
            updateProjectiles(device, game, delta);

            // --- Collision Handling ---
            if (game.playState !== playStates.SHIELD) {
                if (!check_NPC_Collision(device, game)) {
                    game.player.holdPosX = game.player.posX;
                    game.player.holdPosY = game.player.posY;
                }
            }
        }
        break;

        //-------------------------------------------------------
        // PAUSE STATE
        // - Player is frozen in place
        // - Wait for unpause or reset input
        //-------------------------------------------------------
        case gameStates.PAUSE:
        {
            // Resume game on pause key release
            if( device.keys.isKeyPressed(keyTypes.PAUSE_KEY_L))
            {	
                // Restore player position and grant temporary shield
                game.player.posX = game.player.holdPosX;
                game.player.posY = game.player.holdPosY;                
                game.playState = playStates.SHIELD;
                game.timer.reset(game.gameConsts.SHIELD_TIME);

                game.state = gameStates.PLAY;
            }

            // Hard reset (restart entire game)
            if(device.keys.isKeyDown(keyTypes.RESET_KEY))
            {
                game.state = gameStates.INIT;
            }
        }
        break;
        
        //-------------------------------------------------------
        // WIN STATE
        // - End of game, player won
        // - Wait for reset to play again
        //-------------------------------------------------------
        case gameStates.WIN:
        {
            if(device.keys.isKeyDown(keyTypes.RESET_KEY))
            {
                game.state = gameStates.INIT;
            }
        }
        break;
        
        //-------------------------------------------------------
        // LOSE STATE
        // - Player died (show death sprite at last position)
        // - If lives remain, allow respawn
        // - Otherwise, game over
        //-------------------------------------------------------
        case gameStates.LOSE:
        {	
            // Freeze player at last death position
            game.player.posX = game.player.holdPosX;
            game.player.posY = game.player.holdPosY; 
            
            if(game.lives <= 0)
            {                
                // No lives left → reset game on key press
                if(device.keys.isKeyDown(keyTypes.RESET_KEY))
                {
                    game.state = gameStates.INIT;      
                }
            }
            else
            {
                // Respawn player (clear NPCs, grant shield)
                if(device.keys.isKeyDown(keyTypes.RESET_KEY))
                {
                    game.emptyAmmo();                  // clear bullets
                    game.gameSprites.clearObjects();   // clear NPCs

                    game.state = gameStates.PLAY;
                    game.timer.reset(game.gameConsts.SHIELD_TIME);
                    game.playState = playStates.SHIELD;
                }
            }
        }
        break;
  
        default:
            // Unknown state (failsafe)
        break;
    }
}

// -----------------------------------------------------------------------------
// USER INPUT HANDLERS
// -----------------------------------------------------------------------------

/**
 * Handles pause/unpause input.
 * - Toggles game.gameState between PLAY and PAUSE.
 * - Stores player position when paused and restores state on resume.
 */
function checkforPause(device, game)  
{     
    if (device.keys.isKeyPressed(GameDefs.keyTypes.PAUSE_KEY_L))     
    {         
        if (game.gameState === GameDefs.gameStates.PLAY && game.playState != GameDefs.playStates.SHIELD)          
        {             
            // Save player position so it can be restored on resume
           game.player.savePos(game.player.posX, game.player.posY);

            // Switch to pause mode
            game.setGameState(GameDefs.gameStates.PAUSE);        
        }          
        else if (game.gameState === GameDefs.gameStates.PAUSE)          
        {             
            // Resume play mode
            setGameState(GameDefs.gameStates.PLAY);
        }     
    } 
}  

/**
 * Processes all player input:
 * - Delegates pause handling to checkforPause().
 * - (Future) Can expand with other global input checks.
 */
function checkUserKeyInput(device, game) 
{     
    checkforPause(device, game); 
}   

//---------------------------------------------------------------
// Update Game States
// - Called each frame from the controller's update() function
// - Handles core game logic, input responses, and state transitions
// - Updates all game objects depending on current game state
//---------------------------------------------------------------
function updateGameStates(device, game, delta)
{		
    switch(game.gameState)
    {
        //-------------------------------------------------------
        // INIT STATE
        // - Reset the entire game (fresh start)
        // - Wait for user input to begin playing
        //-------------------------------------------------------
        case GameDefs.gameStates.INIT:
        {
            // Reset map, player, and game objects
            game.setGame(device);           

            // Start game when the play key (e.g., spacebar) is pressed
            if(device.keys.isKeyPressed(GameDefs.keyTypes.PLAY_KEY))
            {
                game.setGameState(GameDefs.gameStates.PLAY);
            }
        }
        break;

        //-------------------------------------------------------
        // PLAY STATE
        // - Active gameplay: update player, NPCs, projectiles
        // - Handle input, collisions, and timers
        //-------------------------------------------------------
        case GameDefs.gameStates.PLAY:
        {
            // --- Handle Input ---
            checkUserKeyInput(device, game);

            // --- Update Player ---
            game.player.update(device, game, delta);

            

            // --- Update NPCs & Projectiles ---
            updateNPCSprites(device, game, delta);
            updateProjectiles(device, game, delta);

            // --- Collision Handling ---
            if (game.playState !== GameDefs.playStates.SHIELD) 
            {
                if (!check_NPC_Collision(device, game)) 
                {
                    game.player.savePos(game.player.posX, game.player.posY);
                }
            }

            // Shield timer (seconds-based)
            if (game.timer.active) 
            {
                // has timer run out
                if (game.timer.update(delta)) 
                {
                    game.restorePlayState(); 
                }
            }

            game.stopwatch.update(delta)
        }
        break;

        //-------------------------------------------------------
        // PAUSE STATE
        // - Player is frozen in place
        // - Wait for unpause or reset input
        //-------------------------------------------------------
        case GameDefs.gameStates.PAUSE:
        {
            // Resume game on pause key release
            if( device.keys.isKeyPressed(GameDefs.keyTypes.PAUSE_KEY_L))
            {	
                // Restore player position and grant temporary shield 
                game.player.restoreSavedPos();
                game.savePlayState(game.playState);

                game.setPlayState(GameDefs.playStates.SHIELD);
                game.timer.reset(game.gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN, false);
                game.setGameState(GameDefs.gameStates.PLAY);
            }

            // Hard reset (restart entire game)
            if(device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY))
            {
                game.setGameState(GameDefs.gameStates.INIT);
            }
        }
        break;
        
        //-------------------------------------------------------
        // WIN STATE
        // - End of game, player won
        // - Wait for reset to play again
        //-------------------------------------------------------
        case GameDefs.gameStates.WIN:
        {
            if(device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY))
            {
                game.setGameState(GameDefs.gameStates.INIT);
            }
        }
        break;
        
        //-------------------------------------------------------
        // LOSE STATE
        // - Player died (show death sprite at last position)
        // - If lives remain, allow respawn
        // - Otherwise, game over
        //-------------------------------------------------------
        case GameDefs.gameStates.LOSE:
        {	
            // Freeze player at last death position
            game.player.savePos(game.player.posX, game.player.posY);
            
            if(game.lives <= 0)
            {                
                // No lives left → reset game on key press
                if(device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY))
                {
                    game.setGameState(GameDefs.gameStates.INIT);      
                }
            }
            else
            {
                // Respawn player (clear NPCs, grant shield)
                if(device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY))
                {
                    game.emptyAmmo();                  // clear bullets
                    game.gameSprites.clearObjects();   // clear NPCs
                    game.setGameState(GameDefs.gameStates.PLAY);
                    game.timer.reset(game.gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN, false);
                    
                    game.setPlayState(GameDefs.playStates.SHIELD);
                }
            }
            game.stopwatch.start();
        }
        break;
  
        default:
            // Unknown state (failsafe)
        break;
    }
}




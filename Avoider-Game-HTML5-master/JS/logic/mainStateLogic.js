// ============================================================================
// MAIN STATE LOGIC
// ----------------------------------------------------------------------------
// Handles pause/unpause input.
// Toggles game.gameState between PLAY and PAUSE.
// Stores player position when paused and restores state on resume.
// ============================================================================

function checkforPause(device, game)  
{     
    try 
    {
        if (device.keys.isKeyPressed(GameDefs.keyTypes.PAUSE_KEY_L)) 
        {
            if (game.gameState === GameDefs.gameStates.PLAY &&
                game.playState !== GameDefs.playStates.SHIELD) 
            {

                // Save player position
                game.player.savePos(game.player.posX, game.player.posY);

                // Switch to pause mode
                game.setGameState(GameDefs.gameStates.PAUSE);

            }
            else if (game.gameState === GameDefs.gameStates.PAUSE) 
            {
                // Resume play mode
                game.setGameState(GameDefs.gameStates.PLAY);
            }
        }
    } 
    catch (e) 
    {
        console.error("checkforPause error:", e);
    }
}  

/**
 * Processes all player input:
 * - Delegates pause handling to checkforPause().
 * - (Future) Can expand with other global input checks.
 */
function checkUserKeyInput(device, game) 
{     
    try 
    {
        checkforPause(device, game);
    } 
    catch (e) 
    {
        console.error("checkUserKeyInput error:", e);
    }
}   

//---------------------------------------------------------------
// Update Game States
// - Called each frame from the controller's update() function
// - Handles core game logic, input responses, and state transitions
// - Updates all game objects depending on current game state
//---------------------------------------------------------------
function updateGameStates(device, game, delta) 
{
    try 
    {
        if (!game || !device) return;

        switch (game.gameState) 
        {

            // -------------------------------------------------------
            // INIT STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.INIT:
                try 
                {
                    game.setGame(device);

                    if (device.keys.isKeyPressed(GameDefs.keyTypes.PLAY_KEY)) 
                    {
                        game.setGameState(GameDefs.gameStates.PLAY);
                    }
                } 
                catch (e) 
                {
                    console.error("INIT state error:", e);
                }
                break;

            // -------------------------------------------------------
            // PLAY STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.PLAY:
                try 
                {
                    checkUserKeyInput(device, game);

                    game.player.update(device, game, delta);

                    updateNPCSprites(device, game, delta);
                    updateProjectiles(device, game, delta);

                    if (game.playState !== GameDefs.playStates.SHIELD) 
                    {
                        const collision = check_NPC_Collision(device, game);
                        if (collision === false) 
                        {
                            game.player.savePos(game.player.posX, game.player.posY);
                        }
                    }

                    const shieldTimer = game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER);

                    if (shieldTimer.active) 
                    {
                        if (shieldTimer.update(delta)) 
                        {
                            game.restorePlayState();
                        }
                    }

                    const gameClock = game.gameTimers.getObjectByName(GameDefs.timerTypes.GAME_CLOCK);

                    if (gameClock.active)
                    {
                        gameClock.update(delta);

                        const lastTime = game.npcSpeedMuliplyer;

                        const speedMultiplier = 1 + Math.floor(gameClock.elapsedTime / game.gameConsts.NPC_SPEED_INCREASE_INTERVALS) * game.gameConsts.NPC_SPEED_INCREASE_AMOUNT;
                        game.npcSpeedMuliplyer = speedMultiplier;
                        
                        if (lastTime != game.npcSpeedMuliplyer && lastTime != 0)
                        {
                            game.increaseScore(game.gameConsts.SCORE_INCREASE);   
                        }
                    }
                    

                } 
                catch (e) 
                {
                    console.error("PLAY state error:", e);
                }
                break;

            // -------------------------------------------------------
            // PAUSE STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.PAUSE:
                try 
                {
                    if (device.keys.isKeyPressed(GameDefs.keyTypes.PAUSE_KEY_L)) 
                    {
                        game.player.restoreSavedPos();
                        game.savePlayState(game.playState);

                        game.setPlayState(GameDefs.playStates.SHIELD);

                        game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER).reset(game.gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN, false);

                        game.setGameState(GameDefs.gameStates.PLAY);
                    }

                    if (device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY)) 
                    {
                        game.setGameState(GameDefs.gameStates.INIT);
                    }
                }
                catch (e) 
                {
                    console.error("PAUSE state error:", e);
                }
                break;

            // -------------------------------------------------------
            // WIN STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.WIN:
                try 
                {
                    if (device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY)) 
                    {
                        game.setGameState(GameDefs.gameStates.INIT);
                    }
                } 
                catch (e) 
                {
                    console.error("WIN state error:", e);
                }
                break;

            // -------------------------------------------------------
            // LOSE STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.LOSE:
                try 
                {
                    game.player.savePos(game.player.posX, game.player.posY);

                    if ((game.lives) <= 0) 
                    {
                        if (device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY)) 
                        {
                            game.setGameState(GameDefs.gameStates.INIT);
                        }
                    } 
                    else
                    {
                        if (device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY)) 
                        {
                            game.emptyAmmo();
                            game.gameSprites.clearObjects();
                            game.setGameState(GameDefs.gameStates.PLAY);

                            game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER).reset(game.gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN, false);

                            game.setPlayState(GameDefs.playStates.SHIELD);
                        }
                    }

                    game.gameTimers.getObjectByName(GameDefs.timerTypes.GAME_CLOCK).start();

                } 
                catch (e) 
                {
                    console.error("LOSE state error:", e);
                }
                break;

            default:
                console.warn("Unknown game state:", game.gameState);
                break;
        }

    } 
    catch (e) 
    {
        console.error("updateGameStates main error:", e);
    }
}

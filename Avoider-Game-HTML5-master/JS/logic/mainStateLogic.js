// ============================================================================
// MAIN STATE LOGIC
// ----------------------------------------------------------------------------
// Update Game States
// - Called each frame from the controller's update() function
// - Handles updates to core game logic, input responses, and state transitions
// - Calls for all game objects updates depending on current game state
// ============================================================================

function updateGameStates(device, game, delta) 
{
    try 
    {
        switch (game.gameState) 
        {
            // -------------------------------------------------------
            // INIT STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.INIT:
                try 
                {
                    // Set up all the game stuff up and then wait for player to hit "start/play" button
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
                    // Since the background billboard is a parallax it needs to be updated
                    const board = game.billBoards.getObjectByName(GameDefs.billBoardTypes.BACKGROUND.type);
                    board.update(delta, game)

                    // Game clock that helps update when NPC's speed should incread and give player points
                    const gameClock = game.gameTimers.getObjectByName(GameDefs.timerTypes.GAME_CLOCK);

                    updateGameElementsBasedOnClock(game, delta, gameClock);

                    // Update all Game-Play for NPC's and Player
                    game.player.update(device, game, delta, check_NPC_Collision);        //npcLogic.js
                    generateNPCS(device, game);                                          //npcLogic.js
                    updateNPCSprites(device, game, delta);                               //npcLogic.js
                    updateProjectilesSprites(device, game, delta);                       //projectileLogic.js

                    // If player hits pause button we change game states
                    checkforPause(device, game);                
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
                    // while in pause mode if player un-pauses
                    if (device.keys.isKeyPressed(GameDefs.keyTypes.PAUSE_KEY_L)) 
                    {
                        // player is set back to where they where before pause
                        game.player.restoreSavedPos();

                        // Update states
                        game.setGameState(GameDefs.gameStates.PLAY);
                        game.player.setPlayerState(GameDefs.playStates.SHIELD);

                        // Reset the Shield timer for when player comes out of pause
                        game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER).reset(game.gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN, false);
                    }

                    // Dev hack if you want to restart game quickly
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
            // WIN STATE - currently not in use
            // -------------------------------------------------------
            case GameDefs.gameStates.WIN:
                try 
                {
                    // Check for game restart and Init game if it happens  
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
                    // Holds player position from when they died
                    game.player.savePos(game.player.posX, game.player.posY);

                    // Clear screen of all NPC's and bullets
                    game.projectiles.clearObjects();
                    game.gameSprites.clearObjects();

                    game.npcSpeedMuliplyer = 0;
                    game.npcSpawnMultiplyer = 0;

                    // Empty players ammo from gameplay
                    game.emptyAmmo();

                    // If game over due to all lives gone
                    if (game.lives <= 0) 
                    {       
                        // Check for game restart and Init game if it happens  
                        if (device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY)) 
                        {
                            game.setGameState(GameDefs.gameStates.INIT);
                        }
                    } 
                    else // If player still has lives check for level restart
                    {
                        if (device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY)) 
                        {
                            // player is set back to where they where before pause
                            game.player.restoreSavedPos();
                            
                            // Update states
                            game.setGameState(GameDefs.gameStates.PLAY);
                            game.player.setPlayerState(GameDefs.playStates.SHIELD);

                            // Reset the Shield timer for when player comes out of re-spawn
                            game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER).reset(game.gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN, false);
                        }
                    }

                    // Game timer restart since player lost a life or game
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

// Used during play state wating for player to hit pause button
function checkforPause(device, game)  
{     
    try 
    {
        if (device.keys.isKeyPressed(GameDefs.keyTypes.PAUSE_KEY_L)) 
        {
            // if we are in play mode and not shielded
            if (game.gameState === GameDefs.gameStates.PLAY &&
                game.player.playerState !== GameDefs.playStates.SHIELD) 
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

function updateGameElementsBasedOnClock(game, delta, gameClock)
{
    // This is where we update the time clock and based on that we add speed to the Spawning NPCs
    if (gameClock.active)
    {
        // We save what the npcSpeedMuliplyer was last time
        const lastTime = game.npcSpeedMuliplyer;

        // Update game time clock
        gameClock.update(delta);

        // We need the new npcSpeedMuliplyer
        game.npcSpeedMuliplyer = 1 + Math.floor(gameClock.elapsedTime / game.gameConsts.NPC_SPEED_SPAWN_INCREASE_INTERVALS) * game.gameConsts.NPC_SPEED_INCREASE_AMOUNT;
    
        // If its not the very first time we check and there not equal, then key time has elasped, so we increase score
        if (lastTime != game.npcSpeedMuliplyer && lastTime != 0)
        {
            game.increaseScore(game.gameConsts.SCORE_INCREASE); 
            game.npcSpawnMultiplyer -= game.gameConsts.NPC_SPAWN_INCREASE_AMOUNT;  
        }
    }
}
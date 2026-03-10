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
                    if (device.keys.isKeyPressed(GameDefs.keyTypes.PLAY_KEY)) 
                    {
                        game.setGame(device);
                        game.setGameState(GameDefs.gameStates.PLAY);
                    }
                } 
                catch (e) { console.error("INIT state error:", e); }
                break;

            // -------------------------------------------------------
            // PLAY STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.PLAY:
                try 
                {
                    // Update parallax background billboard
                    game.billBoards.getObjectByName(GameDefs.billBoardTypes.BACKGROUND.name).update(delta, game);

                    // Update game clock — drives NPC speed increases and scoring
                    const gameClock = game.gameTimers.getObjectByName(GameDefs.timerTypes.GAME_CLOCK);
                    updateGameElementsBasedOnClock(game, delta, gameClock);

                    // Update NPC's, player, and projectiles
                    game.player.update(device, game, delta, check_NPC_Collision);   // npcLogic.js
                    generateNPCS(device, game);                                     // npcLogic.js
                    updateNPCSprites(device, game, delta);                          // npcLogic.js
                    updateProjectilesSprites(device, game, delta);                  // projectileLogic.js
                } 
                catch (e) { console.error("PLAY state error:", e); }
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
                catch (e) { console.error("WIN state error:", e); }
                break;

            // -------------------------------------------------------
            // LOSE STATE
            // -------------------------------------------------------
            case GameDefs.gameStates.LOSE:
                try 
                {
                    // Freeze player in place and clear the field
                    game.player.savePos(game.player.posX, game.player.posY);
                    game.projectiles.clearObjects();
                    game.gameSprites.clearObjects();
                    game.npcSpeedMuliplyer  = 0;
                    game.npcSpawnMultiplyer = 0;

                    // Restart game on key press
                    if (device.keys.isKeyDown(GameDefs.keyTypes.RESET_KEY)) 
                    {
                        device.audio.stopAll();
                        game.setGameState(GameDefs.gameStates.INIT);
                    }

                } 
                catch (e) { console.error("LOSE state error:", e); }
                break;

            default:
                console.warn("Unknown game state:", game.gameState);
                break;
        }
    } 
    catch (e) { console.error("updateGameStates error:", e); }
}

// -------------------------------------------------------
// Updates NPC speed/spawn rate and score based on elapsed time
// -------------------------------------------------------
function updateGameElementsBasedOnClock(game, delta, gameClock)
{
    if (!gameClock.active) return;

    const lastSpeed = game.npcSpeedMuliplyer;
    gameClock.update(delta);

    game.npcSpeedMuliplyer = 1 + 
        Math.floor(gameClock.elapsedTime / game.gameConsts.NPC_SPEED_SPAWN_INCREASE_INTERVALS) * 
        game.gameConsts.NPC_SPEED_INCREASE_AMOUNT;

    // Award points and increase spawn rate each time the speed threshold is crossed
    if (lastSpeed !== 0 && lastSpeed !== game.npcSpeedMuliplyer)
    {
        game.increaseScore(game.gameConsts.SCORE_INCREASE); 
        game.npcSpawnMultiplyer -= game.gameConsts.NPC_SPAWN_INCREASE_AMOUNT;  
    }
}
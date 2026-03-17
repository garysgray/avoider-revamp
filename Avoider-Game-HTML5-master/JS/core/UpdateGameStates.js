// ============================================================================
// UpdateGameStates.js
// Game state handlers — routes each frame to INIT, PLAY, WIN, or LOSE logic.
// ============================================================================


// ---- INIT State -------------------------------------------------------------
// Waits for the player to press start, then transitions to PLAY.

function handleInitState(device, game, delta)
{
    try
    {
        if (device.keys.isKeyPressed(keyTypes.PLAY_KEY))
        {
            game.setGame(device);
            game.setGameState(gameStates.PLAY);
        }
    }
    catch (e) { console.error("INIT state error:", e); }
}


// ---- PLAY State -------------------------------------------------------------
// Main gameplay loop — updates background, clock, NPCs, player, and projectiles.

function handlePlayState(device, game, delta)
{
    try
    {
        // Scroll the parallax background
        game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name).update(delta, game);

        // Advance survival clock — drives difficulty scaling and score increases
        const gameClock = game.gameTimers.getObjectByName(timerTypes.GAME_CLOCK);
        updateGameElementsBasedOnClock(game, delta, gameClock);

        // Update entities
        updateNPCSprites(device, game, delta);
        game.player.update(device, game, delta, check_NPC_Collision);
        generateNPCS(device, game);
        updateProjectilesSprites(device, game, delta);
        updateProjectilesCollision(device, game);
    }
    catch (e) { console.error("PLAY state error:", e); }
}


// ---- LOSE State -------------------------------------------------------------
// Freezes the field and waits for the player to restart.

function handleLoseState(device, game, delta)
{
    try
    {
        // Freeze player in place and clear all active entities
        game.player.savePos(game.player.posX, game.player.posY);
        game.projectiles.clearObjects();
        game.gameSprites.clearObjects();

        // Reset difficulty multipliers
        game.npcSpeedMultiplier  = 0;
        game.npcSpawnMultiplyer = 0;

        // Return to INIT on reset key
        if (device.keys.isKeyDown(keyTypes.RESET_KEY))
        {
            device.audio.stopAll();
            game.setGameState(gameStates.INIT);
        }
    }
    catch (e) { console.error("LOSE state error:", e); }
}


// ---- State Router -----------------------------------------------------------
// Dispatches the current game state to the appropriate handler.
// Note: Controller.updateGame() uses a map-based dispatch —
// this switch version is kept as a fallback reference.

function updateGameStates(device, game, delta)
{
    try
    {
        switch (game.gameState)
        {
            case gameStates.INIT: handleInitState(device, game, delta); break;
            case gameStates.PLAY: handlePlayState(device, game, delta); break;
            case gameStates.WIN:  handleWinState(device, game, delta);  break;
            case gameStates.LOSE: handleLoseState(device, game, delta); break;
            default: console.warn("Unknown game state:", game.gameState); break;
        }
    }
    catch (e) { console.error("updateGameStates error:", e); }
}


// ---- Survival Clock ---------------------------------------------------------
// Advances the survival clock and scales NPC speed and spawn rate over time.
// Also awards score on each difficulty increase.

function updateGameElementsBasedOnClock(game, delta, gameClock)
{
    if (!gameClock.active) return;

    const lastSpeed = game.npcSpeedMuliplyer;

    gameClock.update(delta);

    // Step up NPC speed based on elapsed time intervals
    game.npcSpeedMultiplier = 1 +
        Math.floor(gameClock.elapsedTime / game.gameConsts.NPC_SPEED_SPAWN_INCREASE_INTERVALS) *
        game.gameConsts.NPC_SPEED_INCREASE_AMOUNT;

    // Award score and tighten spawn rate on each difficulty step
    if (lastSpeed !== 0 && lastSpeed !== game.npcSpeedMuliplyer)
    {
        game.increaseScore(game.gameConsts.SCORE_INCREASE);
        game.npcSpawnMultiplyer -= game.gameConsts.NPC_SPAWN_INCREASE_AMOUNT;
    }
}
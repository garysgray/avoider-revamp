
// ============================================================================
// GAME STATE HANDLERS
// ============================================================================


// ============================================================================
// INIT STATE
// ============================================================================
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


// ============================================================================
// PLAY STATE
// ============================================================================
function handlePlayState(device, game, delta)
{
    try
    {
        // Update parallax background billboard
        game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name).update(delta, game);

        // Update game clock — drives NPC speed increases and scoring
        const gameClock = game.gameTimers.getObjectByName(timerTypes.GAME_CLOCK);
        updateGameElementsBasedOnClock(game, delta, gameClock);

        // Update NPCs, player, and projectiles
        game.player.update(device, game, delta, check_NPC_Collision);   // npcLogic.js
        generateNPCS(device, game);                                     // npcLogic.js
        updateNPCSprites(device, game, delta);                          // npcLogic.js
        updateProjectilesSprites(device, game, delta);
        updateProjectilesCollision(device, game);           // projectileLogic.js
    }
    catch (e) { console.error("PLAY state error:", e); }
}




// ============================================================================
// LOSE STATE
// ============================================================================
function handleLoseState(device, game, delta)
{
    try
    {
        // Freeze player in place and clear the field
        game.player.savePos(game.player.posX, game.player.posY);
        game.projectiles.clearObjects();
        game.gameSprites.clearObjects();
        game.npcSpeedMuliplyer  = 0;
        game.npcSpawnMultiplyer = 0;

        // Restart game on key press
        if (device.keys.isKeyDown(keyTypes.RESET_KEY))
        {
            device.audio.stopAll();
            game.setGameState(gameStates.INIT);
        }
    }
    catch (e) { console.error("LOSE state error:", e); }
}


// ============================================================================
// MAIN STATE LOGIC
// ============================================================================
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
            default: console.warn("Unknown game state:", game.gameState);        break;
        }
    }
    catch (e) { console.error("updateGameStates error:", e); }
}


// ============================================================================
// CLOCK — NPC speed/spawn rate and scoring
// ============================================================================
function updateGameElementsBasedOnClock(game, delta, gameClock)
{
    if (!gameClock.active) return;

    const lastSpeed = game.npcSpeedMuliplyer;
    gameClock.update(delta);

    game.npcSpeedMuliplyer = 1 +
        Math.floor(gameClock.elapsedTime / game.gameConsts.NPC_SPEED_SPAWN_INCREASE_INTERVALS) *
        game.gameConsts.NPC_SPEED_INCREASE_AMOUNT;

    if (lastSpeed !== 0 && lastSpeed !== game.npcSpeedMuliplyer)
    {
        game.increaseScore(game.gameConsts.SCORE_INCREASE);
        game.npcSpawnMultiplyer -= game.gameConsts.NPC_SPAWN_INCREASE_AMOUNT;
    }
}
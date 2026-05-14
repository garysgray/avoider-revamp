// ============================================================================
// UpdateGameStates.js
// Game state handlers — routes each frame to INIT, PLAY, WIN, or LOSE logic.
// ============================================================================


// ---- INIT State -------------------------------------------------------------
// Waits for the player to press start, then transitions to PLAY.

// function handleInitState(device, game, delta)
// {
//     try
//     {
//         if (device.keys.isKeyPressed(keyTypes.PLAY_KEY))
//         {
//             game.setGame(device);
//             game.setGameState(gameStates.PLAY);
//         }
//     }
//     catch (e) { console.error("INIT state error:", e); }
// }

function handleInitState(device, game, delta)
{
    try
    {
        if (game.isStateEnter(gameStates.INIT))
        {
            device.audio.stopAll();
            device.keys.clearFrameKeys();
            game.attractMode.reset();
        }

        game.attractMode.run(game.effects, delta);
        game.effects.update(delta);

        if (device.keys.isKeyPressed(keyTypes.PLAY_KEY))
        {
            game.attractMode.reset();
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
        generateNPCS(device, game, delta);
        updateProjectilesSprites(device, game, delta);
        updateProjectilesCollision(device, game);

        game.effects.update(delta); 
    }
    catch (e) { console.error("PLAY state error:", e); }
}


// ---- LOSE State -------------------------------------------------------------
// Freezes the field and waits for the player to restart.

function handleLoseState(device, game, delta)
{
    try
    {
        game.effects.update(delta);
        // Freeze player in place and clear all active entities
        game.player.savePos(game.player.posX, game.player.posY);
        game.projectiles.clearObjects();
        game.gameSprites.clearObjects();

        // Reset difficulty multipliers
        game.npcSpeedMultiplier  = 0;
        game.npcSpawnMultiplier = 0;
        

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

// Orchestrator — advances the clock each frame and triggers difficulty steps
// when the speed multiplier steps up. Split into focused helpers for clarity.
function updateGameElementsBasedOnClock(game, delta, gameClock)
{
    if (!gameClock.active) return;

    gameClock.update(delta);

    // updateNPCSpeed returns true only when the multiplier actually steps up
    // — that step is the trigger for everything else to scale up too
    const speedStepped = updateNPCSpeed(game, gameClock);
    if (speedStepped) updateSpawnRates(game);
}

// Calculates NPC speed multiplier based on how long the player has survived.
// Formula: 1 + (floored intervals elapsed * increase amount)
// Every NPC_SPEED_SPAWN_INCREASE_INTERVALS seconds the multiplier steps up.
// This value is applied directly to NPC movement speed in the NPC update logic.
//
// Example with defaults (intervals=10, amount=0.1):
//   0-9s   → 1.0x speed
//   10-19s → 1.1x speed
//   20-29s → 1.2x speed  etc.
//
// TO CONTROL NPC SPEED:
//   NPC_SPEED_SPAWN_INCREASE_INTERVALS — higher = longer between speed steps
//   NPC_SPEED_INCREASE_AMOUNT          — higher = bigger speed jump each step
//
// Returns true when the multiplier actually steps up — false every other frame
function updateNPCSpeed(game, gameClock)
{
    const lastSpeed    = game.npcSpeedMultiplier;
    const currentSpeed = 1 +
        Math.floor(gameClock.elapsedTime / game.gameConsts.NPC_SPEED_SPAWN_INCREASE_INTERVALS) *
        game.gameConsts.NPC_SPEED_INCREASE_AMOUNT;

    game.npcSpeedMultiplier = currentSpeed;
    return lastSpeed >= 1 && currentSpeed > lastSpeed;
}

// Called each time the speed steps up — tightens spawn intervals and increases
// spawn counts for both drones and ammo, then awards score.
//
// ---- Drone Spawn Interval -------------------------------------------
// Reduces the time between drone spawn ticks each difficulty step.
// generateNPCS fires spawnNPC() every time droneSpawnTimer completes —
// shorter interval = timer fires more often = drones arrive faster.
//
// TO CONTROL DRONE SPAWN FREQUENCY:
//   DRONE_SPAWN_INTERVAL    — starting gap in seconds between spawn ticks
//   DRONE_INTERVAL_DECREASE — how many seconds to cut each difficulty step
//   DRONE_INTERVAL_MIN      — floor — spawn interval never goes below this
//
// ---- Drone Spawn Count ---------------------------------------------- 
// Increases how many drones spawn per tick each difficulty step.
// generateNPCS loops droneSpawnCount times per timer fire —
// so shorter interval AND higher count = exponentially more drones.
//
// TO CONTROL DRONES PER TICK:
//   DRONE_SPAWN_COUNT     — how many drones spawn per tick at start
//   DRONE_COUNT_INCREASE  — how many more drones added each difficulty step
//   DRONE_SPAWN_COUNT_MAX — ceiling — never spawns more than this per tick
//
// ---- Ammo Spawn Interval / Count ------------------------------------
// Same logic as drones but tuned independently so ammo stays less
// frequent than drones — players shouldn't be flooded with pickups.
//
// TO CONTROL AMMO VOLUME:
//   AMMO_SPAWN_INTERVAL    — starting gap in seconds between spawn ticks
//   AMMO_INTERVAL_DECREASE — how many seconds to cut each difficulty step
//   AMMO_INTERVAL_MIN      — floor — spawn interval never goes below this
//   AMMO_SPAWN_COUNT       — how many ammo orbs spawn per tick at start
//   AMMO_COUNT_INCREASE    — extra ammo per tick added each difficulty step
//   AMMO_SPAWN_COUNT_MAX   — ceiling — never spawns more than this per tick
function updateSpawnRates(game)
{
    game.increaseScore(game.gameConsts.SCORE_INCREASE);

    const droneSpawnTimer = game.gameTimers.getObjectByName(timerTypes.DRONE_TIMER);
    const ammoSpawnTimer = game.gameTimers.getObjectByName(timerTypes.AMMO_TIMER);

    const newDroneInterval = Math.max(
        game.gameConsts.DRONE_INTERVAL_MIN,
        droneSpawnTimer.duration - game.gameConsts.DRONE_INTERVAL_DECREASE 
     );

    const newAmmoInterval = Math.max(
        game.gameConsts.AMMO_INTERVAL_MIN,
        ammoSpawnTimer.duration - game.gameConsts.AMMO_INTERVAL_DECREASE
    );

    game.droneSpawnCount = Math.min(
        game.gameConsts.DRONE_SPAWN_COUNT_MAX,
        game.droneSpawnCount + game.gameConsts.DRONE_COUNT_INCREASE
    );

    game.ammoSpawnCount = Math.min(
        game.gameConsts.AMMO_SPAWN_COUNT_MAX,
        game.ammoSpawnCount + game.gameConsts.AMMO_COUNT_INCREASE
    );

    droneSpawnTimer.reset(newDroneInterval);
    ammoSpawnTimer.reset(newAmmoInterval);

    console.log(
        `Difficulty step — ` +
        `speed: ${game.npcSpeedMultiplier.toFixed(2)} | ` +
        `drone: ${newDroneInterval.toFixed(2)}s x${game.droneSpawnCount} | ` +
        `ammo: ${newAmmoInterval.toFixed(2)}s x${game.ammoSpawnCount}`
    );
}
// ============================================================================
// CollisionHandlers.js
// Collision response logic — called from NPCLogic and ProjectileLogic.
// Handles game state changes, scoring, and audio triggered by collisions.
// ============================================================================


// ---- Ammo Pickup ------------------------------------------------------------

// Applies the effect of collecting an ammo pickup based on its type.
// FIRE grants ammo, GHOST grants shield, anything else grants ULTRA.
function handleAmmoPickup(device, game, npc)
{
    try { device.audio.playSound(soundTypes.GET.name); } catch(e) {}

    if (npc.type === ammoEnum.FIRE)
    {
        game.player.playerState = playStates.SHOOT;
        game.increaseAmmo(game.gameConsts.AMMO_AMOUNT);
    }
    else
    {
        game.player.playerState = (npc.type === ammoEnum.GHOST)
            ? playStates.SHIELD
            : playStates.ULTRA;

        // Start the shield/ultra countdown timer
        game.gameTimers
            .getObjectByName(timerTypes.SHIELD_TIMER)
            .reset(game.gameConsts.SHIELD_TIME, timerModes.COUNTDOWN, false);
    }
}


// ---- Enemy Contact ----------------------------------------------------------

// Handles player contact with an enemy NPC.
// ULTRA state destroys the enemy and scores — anything else triggers death.
function handleEnemyContact(device, game)
{
    if (game.player.playerState === playStates.ULTRA)
    {
        try { device.audio.playSound(soundTypes.HIT.name); } catch(e) {}
        game.increaseScore(game.gameConsts.SCORE_INCREASE);
        return true;
    }

    try { device.audio.playSound(soundTypes.HURT.name); } catch(e) {}
    game.player.playerState = playStates.DEATH;
    game.gameState          = gameStates.LOSE;
    return false;
}


// ---- Projectile Hit ---------------------------------------------------------

// Handles a bullet connecting with an NPC — kills both and awards score.
function handleProjectileHit(device, game, proj, npc)
{
    try { device.audio.playSound(soundTypes.HIT.name); } catch(e) {}
    npc.kill();
    proj.kill();
    game.increaseScore(game.gameConsts.SCORE_INCREASE);
}
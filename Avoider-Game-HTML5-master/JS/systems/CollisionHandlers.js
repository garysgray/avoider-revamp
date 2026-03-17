
// ============================================================================
// NPCHandlers.js
// ============================================================================

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
        game.gameTimers
            .getObjectByName(timerTypes.SHIELD_TIMER)
            .reset(game.gameConsts.SHIELD_TIME, timerModes.COUNTDOWN, false);
    }
}

function handleEnemyContact(device, game)
{
    if (game.player.playerState === playStates.ULTRA)
    {
        try { device.audio.playSound(soundTypes.HIT.name); } catch(e) {}
        game.increaseScore(game.gameConsts.SCORE_INCREASE);
        return true;
    }
    else
    {
        try { device.audio.playSound(soundTypes.HURT.name); } catch(e) {}
        game.player.playerState = playStates.DEATH;
        game.gameState          = gameStates.LOSE;
        return false;
    }
}

function handleProjectileHit(device, game, proj, npc)
{
    try { device.audio.playSound(soundTypes.HIT.name); } catch(e) {}
    npc.kill();
    proj.kill();
    game.increaseScore(game.gameConsts.SCORE_INCREASE);
}
// ============================================================================
// npcLogic.js
// Core NPC spawning, movement updates, and collision handling.
// Called every frame from the controller update loop.
// ============================================================================


// ---- NPC Updates ------------------------------------------------------------

function updateNPCSprites(device, game, delta)
{
    try
    {
        for (let i = game.gameSprites.getSize() - 1; i >= 0; i--)
        {
            const npc = game.gameSprites.getIndex(i);
            if (!npc) continue;

            try
            {
                if (npc.name === "ammo")
                {
                    npc.update(device, game, delta);
                }
                else
                {
                    switch (npc.type)
                    {
                        case GameDefs.enemyTypes.EYE: npc.update(device, game, delta);                              break;
                        case GameDefs.enemyTypes.BUG: npc.update(device, game, delta, npc.moveDiagonalDownLeft);    break;
                        case GameDefs.enemyTypes.UFO: npc.update(device, game, delta, npc.moveDiagonalDownRight);   break;
                    }
                }
            }
            catch (e) { console.error("NPC update error:", e); }

            const offscreen = npc.posY > device.canvas.height;
            if (!npc.alive || offscreen)
            {
                try   { game.gameSprites.subObject(i); }
                catch (e) { console.error("Failed to remove NPC:", e); }
            }
        }
    }
    catch (e) { console.error("updateNPCSprites error:", e); }
}


// ---- NPC Spawning -----------------------------------------------------------

function generateNPCS(device, game)
{
    const { DRONE, AMMO } = GameDefs.spriteTypes;

    try
    {
        if (Math.random() >= DRONE.spawnRatio + game.npcSpawnMultiplyer)
        {
            spawnNPC(device, game, DRONE.name, DRONE.w, DRONE.h, DRONE.speed, DRONE.spawnRatio);
        }
    }
    catch (e) { console.error("Drone spawn error:", e); }

    try
    {
        const tweak = AMMO.spawnRatio * game.npcSpawnMultiplyer;
        if (Math.random() >= AMMO.spawnRatio + (game.npcSpawnMultiplyer - tweak))
        {
            spawnNPC(device, game, AMMO.name, AMMO.w, AMMO.h, AMMO.speed, AMMO.spawnRatio);
        }
    }
    catch (e) { console.error("Ammo spawn error:", e); }
}

function spawnNPC(device, game, name, width, height, speed, spawnRatio)
{
    try
    {
        const npc  = new NPC(name, width, height, 0, 0, speed, Math.floor(Math.random() * 3));
        const minX = npc.halfWidth;
        const maxX = device.canvas.width - npc.halfWidth;
        const topY = npc.halfHeight;

        npc.movePos(minX + Math.random() * (maxX - minX), topY);

        let attempts = 0;
        while (attempts < game.gameConsts.SPAWN_ATTEMPTS && overlapsAny(npc, game.gameSprites))
        {
            npc.movePos(minX + Math.random() * (maxX - minX), topY);
            attempts++;
        }

        game.gameSprites.addObject(npc);
    }
    catch (e) { console.error("spawnNPC error:", e); }
}

// Returns true if npc overlaps any existing sprite in holder
function overlapsAny(npc, holder)
{
    try
    {
        const npcBox = npc.getHitbox(1.0, 0);
        for (let i = 0; i < holder.getSize(); i++)
        {
            const otherBox = holder.getIndex(i).getHitbox(1.0, 0);
            if (otherBox && rectsCollide(npcBox, otherBox)) return true;
        }
    }
    catch (e) { console.error("overlapsAny error:", e); }
    return false;
}


// ---- Collision --------------------------------------------------------------

function check_NPC_Collision(device, game)
{
    const player  = game.player;
    const sprites = game.gameSprites;

    for (let i = sprites.getSize() - 1; i >= 0; i--)
    {
        const npc = sprites.getIndex(i);
        if (!roughNear(player, npc)) continue;

        npc.kill();

        if (npc.name === GameDefs.spriteTypes.AMMO.name)
        {
            try { device.audio.playSound(GameDefs.soundTypes.GET.name); } catch(e) {}

            if (npc.type === GameDefs.ammoTypes.FIRE)
            {
                player.playerState = GameDefs.playStates.SHOOT;
                game.increaseAmmo(game.gameConsts.AMMO_AMOUNT);
            }
            else
            {
                player.playerState = (npc.type === GameDefs.ammoTypes.GHOST)
                    ? GameDefs.playStates.SHIELD
                    : GameDefs.playStates.ULTRA;
                game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER)
                    .reset(game.gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN, false);
            }
        }
        else
        {
            if (player.playerState === GameDefs.playStates.ULTRA)
            {
                try { device.audio.playSound(GameDefs.soundTypes.HIT.name); } catch(e) {}
                game.increaseScore(game.gameConsts.SCORE_INCREASE);
            }
            else
            {
                try { device.audio.playSound(GameDefs.soundTypes.HURT.name); } catch(e) {}
                player.playerState = GameDefs.playStates.DEATH;
                game.gameState     = GameDefs.gameStates.LOSE;
                game.decreaseLives(1);
                return false;
            }
        }
    }
    return true;
}
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
                npc.update(device, game, delta);  // all types handled internally now
            }
            catch (e) { console.error("NPC update error:", e); }

            const offscreen = npc.posY > device.canvas.height + (npc.height * 2);
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
    const { DRONE, AMMO } = spriteTypes;

    try
    {
        if (Math.random() >= DRONE.spawnRatio + game.npcSpawnMultiplyer)
        {
            //spawnNPC(device, game, DRONE.name, DRONE.w, DRONE.h, DRONE.speed, DRONE.spawnRatio);
            spawnNPC(device, game, DRONE);
        }
    }
    catch (e) { console.error("Drone spawn error:", e); }

    try
    {
        const tweak = AMMO.spawnRatio * game.npcSpawnMultiplyer;
        if (Math.random() >= AMMO.spawnRatio + (game.npcSpawnMultiplyer - tweak))
        {
            //spawnNPC(device, game, AMMO.name, AMMO.w, AMMO.h, AMMO.speed, AMMO.spawnRatio);
            spawnNPC(device, game, AMMO);
        }
    }
    catch (e) { console.error("Ammo spawn error:", e); }
}

// function spawnNPC(device, game, name, width, height, speed, spawnRatio)
// {
//     try
//     {
//         const npc  = new NPC(name, width, height, 0, 0, speed, Math.floor(Math.random() * 3));
//         const minX = npc.halfWidth;
//         const maxX = device.canvas.width - npc.halfWidth;
//         const topY = npc.halfHeight;

//         npc.movePos(minX + Math.random() * (maxX - minX), topY);

//         let attempts = 0;
//         while (attempts < game.gameConsts.SPAWN_ATTEMPTS && overlapsAny(npc, game.gameSprites))
//         {
//             npc.movePos(minX + Math.random() * (maxX - minX), topY);
//             attempts++;
//         }

//         game.gameSprites.addObject(npc);
//     }
//     catch (e) { console.error("spawnNPC error:", e); }
// }

function spawnNPC(device, game, spriteType)
{
    try
    {
        const { name, w, h, speed } = spriteType;
        const npc  = new NPC(name, w, h, 0, 0, speed, Math.floor(Math.random() * 3));
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
        if (!rectsCollide(player.getHitbox(1.0, 0), npc.getHitbox(1.0, 0))) continue;

        npc.kill();
        if (npc.name === spriteTypes.AMMO.name)
        {
            handleAmmoPickup(device, game, npc);
        }
        else
        {
            if (!handleEnemyContact(device, game)) return false;
        }
    }
    return true;
}
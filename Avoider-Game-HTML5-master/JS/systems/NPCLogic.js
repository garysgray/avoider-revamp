// ============================================================================
// NPCLogic.js
// Per-frame NPC spawning, movement updates, and collision detection.
// Called every frame from the controller update loop.
// ============================================================================


// ---- NPC Updates ------------------------------------------------------------

// Advances all NPCs and removes any that are dead or scrolled off-screen
function updateNPCSprites(device, game, delta)
{
    try
    {
        for (let i = game.gameSprites.getSize() - 1; i >= 0; i--)
        {
            const npc = game.gameSprites.getIndex(i);
            if (!npc) continue;

            try   { npc.update(device, game, delta); }
            catch (e) { console.error("NPC update error:", e); }

            // Remove if dead or past the bottom of the canvas
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

// Rolls spawn chances each frame and spawns drones and ammo pickups
function generateNPCS(device, game)
{
    const { DRONE, AMMO } = spriteTypes;

    try
    {
        if (Math.random() >= DRONE.spawnRatio + game.npcSpawnMultiplyer)
            spawnNPC(device, game, DRONE);
    }
    catch (e) { console.error("Drone spawn error:", e); }

    try
    {
        // Tweak reduces ammo spawn rate proportionally as difficulty increases
        const tweak = AMMO.spawnRatio * game.npcSpawnMultiplyer;
        if (Math.random() >= AMMO.spawnRatio + (game.npcSpawnMultiplyer - tweak))
            spawnNPC(device, game, AMMO);
    }
    catch (e) { console.error("Ammo spawn error:", e); }
}

// Spawns a single NPC of the given sprite type at a random x position along the top.
// Retries placement up to SPAWN_ATTEMPTS times to avoid overlapping existing sprites.
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

// Returns true if the given NPC overlaps any existing sprite in the holder
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

// Checks player against all NPCs — broad-phase first, then precise AABB.
// Delegates response to handlers — returns false if the player dies.
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
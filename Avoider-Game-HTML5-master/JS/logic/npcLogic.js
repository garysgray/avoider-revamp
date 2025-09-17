// ============================================================================
//npcLogic.js
// Core update logic for handling user input, projectiles, NPCs, and collisions.
// Called every frame from controller.js update loop.
// ============================================================================
// -----------------------------------------------------------------------------
// PROJECTILE UPDATES
// -----------------------------------------------------------------------------

/**
 * Updates all projectiles:
 * - Moves each projectile via its own update().
 * - Removes projectiles when off-screen or marked dead.
 * - Runs centralized collision check against NPCs.
 */
function updateProjectiles(device, game, delta)  
{     
    try {
        if (!game?.projectiles) return;

        for (let i = game.projectiles.getSize() - 1; i >= 0; i--) {
            const proj = game.projectiles.getIndex?.(i);
            if (!proj) continue;

            if (typeof proj.update === "function") {
                try { proj.update(device, game, delta); } catch (e) { console.error("Projectile update error:", e); }
            }

            const offscreen = (proj.posY ?? 0) + (proj.halfHeight ?? 0) < 0;
            const dead = proj.alive === false;

            if (offscreen || dead) {
                try { game.projectiles.subObject?.(i); } catch (e) { console.error("Failed to remove projectile:", e); }
            }
        }

        updateProjectilesCollision(device, game, delta);
    } catch (e) {
        console.error("updateProjectiles error:", e);
    }
}  

// -----------------------------------------------------------------------------
// NPC UPDATES
// -----------------------------------------------------------------------------

/**
 * Spawns and updates NPC sprites:
 * - Orbs (common).
 * - FireAmmo (rare).
 * Ensures no overlapping spawns and removes off-screen or dead NPCs.
 */
function updateNPCSprites(device, game, delta)  
{     
    try {
        if (!game?.gameSprites) return;

        // Spawn NPCs safely
        try { spawnNPC(device, game, GameDefs.spriteTypes.ORB?.type, GameDefs.spriteTypes.ORB?.w, GameDefs.spriteTypes.ORB?.h, GameDefs.spriteTypes.ORB?.speed, 1 / (GameDefs.spriteTypes.ORB?.spawnRatio || 1)); } catch (e) { console.error("ORB spawn error:", e); }
        try { spawnNPC(device, game, GameDefs.spriteTypes.FIRE_AMMO?.type, GameDefs.spriteTypes.FIRE_AMMO?.w, GameDefs.spriteTypes.FIRE_AMMO?.h, GameDefs.spriteTypes.FIRE_AMMO?.speed, 1 / (GameDefs.spriteTypes.FIRE_AMMO?.spawnRatio || 1)); } catch (e) { console.error("FireAmmo spawn error:", e); }

        for (let i = game.gameSprites.getSize() - 1; i >= 0; i--) {
            const npc = game.gameSprites.getIndex?.(i);
            if (!npc) continue;

            try { if (typeof npc.update === "function") npc.update(device, game, delta); } catch (e) { console.error("NPC update error:", e); }

            //const offscreen = (npc.posY ?? 0) > ((device?.canvas?.height ?? 0) - ((device?.canvas?.height ?? 0) * (game?.gameConsts?.HUD_BUFFER ?? 0)));
            const offscreen = (npc.posY ?? 0) > ((device?.canvas?.height ?? 0));
            if (!npc.alive || offscreen) {
                try { game.gameSprites.subObject?.(i); } catch (e) { console.error("Failed to remove NPC:", e); }
            }
        }
    } catch (e) {
        console.error("updateNPCSprites error:", e);
    }
}  

function spawnNPC(device, game, type, width, height, speed, chance)
{
    try {
        if (!type || Math.random() >= (chance ?? 1)) return;

        const npc = new NPC(type, width ?? 10, height ?? 10, 0, 0, speed ?? 1);

        const minX = npc.halfWidth ?? 0;
        const maxX = (device?.canvas?.width ?? 0) - (npc.halfWidth ?? 0);
        const startY = npc.halfHeight + (device?.canvas?.height * game.gameConsts.HUD_BUFFER ) ?? 0;

        npc.movePos?.(minX + Math.random() * (maxX - minX), startY);

        let attempts = 0;
        const attemptsMax = game?.gameConsts?.SPAWN_ATTEMPTS ?? 3;

        while (attempts < attemptsMax && overlapsAny(npc, game?.gameSprites)) {
            npc.movePos?.(minX + Math.random() * (maxX - minX), startY);
            attempts++;
        }

        game?.gameSprites?.addObject?.(npc);
    } catch (e) {
        console.error("spawnNPC error:", e);
    }
}

// helper: does npc overlap any existing alive sprite?
function overlapsAny(npc, holder) 
{
    try {
        if (!npc || !holder) return false;

        const count = holder.getSize?.() ?? 0;
        const npcBox = npc.getHitbox?.(1.0, 0);
        if (!npcBox) return false;

        for (let i = 0; i < count; i++) {
            const other = holder.getIndex?.(i);
            if (!other?.alive) continue;
            const otherBox = other.getHitbox?.(1.0, 0);
            if (otherBox && rectsCollide(npcBox, otherBox)) return true;
        }
    } catch (e) {
        console.error("overlapsAny error:", e);
    }
    return false;
}

// -----------------------------------------------------------------------------
// COLLISION HANDLERS
// -----------------------------------------------------------------------------

/**
 * Checks projectile collisions with NPCs:
 * - Removes both projectile and NPC on hit.
 * - Plays "hit" sound effect.
 * - Increases score.
 */
function updateProjectilesCollision(device, game)  
{   
    try {
        const spritesCount = game?.gameSprites?.getSize?.() ?? 0;
        const projsCount = game?.projectiles?.getSize?.() ?? 0;

        for (let i = projsCount - 1; i >= 0; i--) {
            const proj = game.projectiles.getIndex?.(i);
            if (!proj?.alive) continue;

            const projBox = proj.getHitbox?.(1.0, 0);
            if (!projBox) continue;

            for (let j = spritesCount - 1; j >= 0; j--) {
                const npc = game.gameSprites.getIndex?.(j);
                if (!npc?.alive) continue;

                const npcBox = npc.getHitbox?.(1.0, 0);
                if (!npcBox) continue;

                if (rectsCollide(projBox, npcBox)) {
                    try { device?.audio?.playSound?.(GameDefs.soundTypes.HIT?.name); } catch (e) { console.warn("Failed to play hit sound:", e); }
                    try { game?.increaseScore?.(game?.gameConsts?.SCORE_INCREASE ?? 1); } catch (e) { console.warn("Failed to increase score:", e); }

                    npc.kill?.();
                    proj.kill?.();
                    break;
                }
            }
        }
    } catch (e) {
        console.error("updateProjectilesCollision error:", e);
    }
}   


/**
 * Checks player collisions with NPCs:
 * - fireAmmo → gives ammo, switches to SHOOT state.
 * - orb/others → causes damage, reduces life, sets DEATH/LOSE state.
 */
function check_NPC_Collision(device, game)  
{    
    try {
        const player = game?.player;
        if (!player) return true;

        const playerBox = player.getHitbox?.(1.0, 0);
        if (!playerBox) return true;

        const spritesCount = game?.gameSprites?.getSize?.() ?? 0;

        for (let i = spritesCount - 1; i >= 0; i--) {
            const npc = game.gameSprites.getIndex?.(i);
            if (!npc?.alive) continue;
            if (!roughNear(player, npc)) continue;

            const npcBox = npc.getHitbox?.(1.0, 0);
            if (!npcBox || !rectsCollide(playerBox, npcBox)) continue;

            if (npc.name === GameDefs.spriteTypes.FIRE_AMMO?.type) {
                npc.kill?.();
                device?.audio?.playSound?.(GameDefs.soundTypes.GET?.name);
                game.playState = GameDefs.playStates.SHOOT;
                game?.increaseAmmo?.(game?.gameConsts?.AMMO_AMOUNT ?? 1);
            } else {  
                npc.kill();
                try {
                    device.audio.playSound(GameDefs.soundTypes.HURT.name);
                } catch(e) {
                    console.warn("Could not play hurt sound:", e);
                }

                // Set both logical and visual state immediately
                game.playState = GameDefs.playStates.DEATH;
                if (game.player) {
                    try {
                        game.player.state = GameDefs.playStates.DEATH; // force visual state immediately
                    } catch (e) {
                        console.warn("Could not set player.state to DEATH:", e);
                    }
                }

                // Transition to lose state as before
                game.gameState = GameDefs.gameStates.LOSE;
                game.decreaseLives(1);
                return false;
            }
        }
    } catch (e) {
        console.error("check_NPC_Collision error:", e);
    }
    return true;
} 


// -----------------------------------------------------------------------------
// COLLISION UTILS
// -----------------------------------------------------------------------------
function rectsCollide(a, b) {
    if (!a || !b) return false;
    return !(
        (a.right ?? 0) < (b.left ?? 0) ||
        (a.left ?? 0) > (b.right ?? 0) ||
        (a.bottom ?? 0) < (b.top ?? 0) ||
        (a.top ?? 0) > (b.bottom ?? 0)
    );
}

function roughNear(a, b, pad = 0) {
    try {
        if (!a || !b) return false;
        const dx = (a.posX ?? 0) - (b.posX ?? 0);
        const dy = (a.posY ?? 0) - (b.posY ?? 0);
        const r = (a.getRoughRadius?.() ?? 0) + (b.getRoughRadius?.() ?? 0) + pad;
        return (dx * dx + dy * dy) <= (r * r);
    } catch (e) {
        console.error("roughNear error:", e);
        return false;
    }
}
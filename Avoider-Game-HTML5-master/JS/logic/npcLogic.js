// ============================================================================
// npcLogic.js
// -----------------------------------------------------------------------------
// Core update logic for projectiles, NPCs, and collisions.
// Called every frame from controller.js update loop.
// -----------------------------------------------------------------------------
// PROJECTILE UPDATES
// Moves each projectile via its own update().
// Removes projectiles when off-screen or marked dead.
// Runs centralized collision check against NPCs.
// ============================================================================

function updateProjectiles(device, game, delta)  
{     
    try 
    {
        for (let i = game.projectiles.getSize() - 1; i >= 0; i--) 
        {
            const proj = game.projectiles.getIndex(i);
            try 
            { 
                proj.update(device, game, delta); 
            } 
            catch (e) 
            { 
                console.error("Projectile update error:", e); 
            }
            
            const offscreen = proj.posY + proj.halfHeight < game.gameConsts.SCREEN_HEIGHT * game.gameConsts.HUD_BUFFER;
            const dead = proj.alive === false;

            if (offscreen || dead)
            {
                try
                { 
                    game.projectiles.subObject(i); 
                } 
                catch (e) 
                { 
                    console.error("Failed to remove projectile:", e); 
                }
            }
        }

        updateProjectilesCollision(device, game, delta);
    } 
    catch (e) 
    {
        console.error("updateProjectiles error:", e);
    }
}  

// -----------------------------------------------------------------------------
// NPC UPDATES
/**
 * Spawns and updates NPC sprites:
 * - Orbs (common).
 * - FireAmmo (rare).
 * Ensures no overlapping spawns and removes off-screen or dead NPCs.
 */
// -----------------------------------------------------------------------------

// Calls to spawns and update Enemy Orbs and Gunfire ammo while in play mode
function updateNPCSprites(device, game, delta)  
{     
    try 
    {
        if (!game.gameSprites) return;

        // Spawn ORBS
        try 
        { 
            spawnNPC(device, game, GameDefs.spriteTypes.ORB.type, GameDefs.spriteTypes.ORB.w, GameDefs.spriteTypes.ORB.h, GameDefs.spriteTypes.ORB.speed, 1 / GameDefs.spriteTypes.ORB.spawnRatio ); 
        } 
        catch (e) 
        {
             console.error("ORB spawn error:", e); 
        }

        // Spawn Fire Ammo
        try 
        { 
            spawnNPC(device, game, GameDefs.spriteTypes.FIRE_AMMO.type, GameDefs.spriteTypes.FIRE_AMMO.w, GameDefs.spriteTypes.FIRE_AMMO.h, GameDefs.spriteTypes.FIRE_AMMO.speed, 1 / GameDefs.spriteTypes.FIRE_AMMO.spawnRatio ); 
        } 
        catch (e) 
        { 
            console.error("FireAmmo spawn error:", e); 
        }

        // Update NPC movement
        for (let i = game.gameSprites.getSize() - 1; i >= 0; i--) 
            {
            const npc = game.gameSprites.getIndex(i);
            if (!npc) continue;

            try 
            { 
                npc.update(device, game, delta); 
            } 
            catch (e) 
            { 
                console.error("NPC update error:", e); 
            }

            // If NPC is dead remove from game
            const offscreen = npc.posY > (device.canvas.height);
            if (!npc.alive || offscreen) 
            {
                try 
                { 
                    game.gameSprites.subObject(i); } catch (e) { console.error("Failed to remove NPC:", e);    
                }
            }
        }
    } 
    catch (e) 
    {
        console.error("updateNPCSprites error:", e);
    }
}  

// Function that spawns NPC's, and moves them to a random x pos and then calls attempts at keeping these NPC's from spawning/moving positons on top of each other
function spawnNPC(device, game, type, width, height, speed, chance)
{
    try 
    {
        if (!type || Math.random() >= chance) return;

        const npc = new NPC(type, width, height, 0, 0, speed);

        // Position vars
        const minX = npc.halfWidth;
        const maxX = device.canvas.width - npc.halfWidth;
        const startY = npc.halfHeight + device.canvas.height * game.gameConsts.HUD_BUFFER;

        // how many attempts at not spawing on top of another npc
        const attemptsMax = game.gameConsts.SPAWN_ATTEMPTS;

        // Moves to a position with random x pos
        npc.movePos(minX + Math.random() * (maxX - minX), startY);

        let attempts = 0;
        while (attempts < attemptsMax && overlapsAny(npc, game.gameSprites))
        {
            npc.movePos(minX + Math.random() * (maxX - minX), startY);
            attempts++;
        }

        game.gameSprites.addObject(npc);
    } 
    catch (e) 
    {
        console.error("spawnNPC error:", e);
    }
}

// helper: does npc overlap any existing alive sprites
// using gameObjects self getHitbox function to check for overlap
function overlapsAny(npc, holder) 
{
    try 
    {
        const count = holder.getSize();
        const npcBox = npc.getHitbox(1.0, 0); 

        for (let i = 0; i < count; i++) 
        {
            const other = holder.getIndex(i);
            const otherBox = other.getHitbox(1.0, 0);

            if (otherBox && rectsCollide(npcBox, otherBox)) return true;
        }
    } 
    catch (e) 
    {
        console.error("overlapsAny error:", e);
    }
    return false;
}

// -----------------------------------------------------------------------------
// COLLISION
// -----------------------------------------------------------------------------

/**-----------------------------------------------------------------------------
 * Checks projectile collisions with NPCs:
 * - Removes both projectile and NPC on hit.
 * - Plays "hit" sound effect.
 * - Increases score.
 */
// -----------------------------------------------------------------------------

// This is for checking the collision for the bullets shot from the players ship
// to see if they hit any NPC's
function updateProjectilesCollision(device, game)  
{   
    try 
    {
        const spritesCount = game.gameSprites.getSize();
        const projsCount = game.projectiles.getSize();

        for (let i = projsCount - 1; i >= 0; i--) 
        {
            const proj = game.projectiles.getIndex(i);
            const projBox = proj.getHitbox(1.0, 0);     

            for (let j = spritesCount - 1; j >= 0; j--) 
            {
                const npc = game.gameSprites.getIndex(j);
                const npcBox = npc.getHitbox(1.0, 0);  

                // If they hit, then a sound will be generated, player score increased, bullet and NPC should be killed and removed from game
                if (rectsCollide(projBox, npcBox)) 
                {
                    try { device.audio.playSound(GameDefs.soundTypes.HIT.name); } catch (e) { console.warn("Failed to play hit sound:", e); }
                    try { game.increaseScore(game.gameConsts.SCORE_INCREASE); } catch (e) { console.warn("Failed to increase score:", e); }

                    npc.kill();
                    proj.kill();
                    break;
                }
            }
        }
    }
    catch (e)
    {
        console.error("updateProjectilesCollision error:", e);
    }
}   

/**-----------------------------------------------------------------------------
 * Checks player collisions with NPCs:
 * - fireAmmo → gives ammo, switches to SHOOT state.
 * - orb/others → causes damage, reduces life, sets DEATH/LOSE state.
 *///-----------------------------------------------------------------------------

function check_NPC_Collision(device, game)  
{    
    try 
    {
        const player = game.player;
        const spritesCount = game.gameSprites.getSize();

        for (let i = spritesCount - 1; i >= 0; i--) 
        {
            const npc = game.gameSprites.getIndex(i);

            if (!roughNear(player, npc)) continue;

            if (npc.name === GameDefs.spriteTypes.FIRE_AMMO.type) 
            {
                npc.kill();
                device.audio.playSound(GameDefs.soundTypes.GET.name);
                game.playState = GameDefs.playStates.SHOOT;
                game.increaseAmmo(game.gameConsts.AMMO_AMOUNT);
            } 
            else 
            {  
                npc.kill();
                try 
                {
                    device.audio.playSound(GameDefs.soundTypes.HURT.name);
                } 
                catch(e) 
                {
                    console.warn("Could not play hurt sound:", e);
                }

                // Tell the GAME that the playstates is Death
                game.playState = GameDefs.playStates.DEATH;
                if (game.player) 
                {
                    try 
                    {
                        // Tell the PLAYER state that the playstates is Death
                        game.player.state = GameDefs.playStates.DEATH; // force visual state immediately
                    } 
                    catch (e) 
                    {
                        console.warn("Could not set player.state to DEATH:", e);
                    }
                }

                // Transition to lose state as before
                game.gameState = GameDefs.gameStates.LOSE;
                game.decreaseLives(1);
                return false;
            }
        }
    } 
    catch (e) 
    {
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
        a.right  < b.left  ||
        a.left   > b.right ||
        a.bottom < b.top   ||
        a.top    > b.bottom
    );
}

function roughNear(a, b, pad = 0) {
    try 
    {
        if (!a || !b) return false;
        const dx = a.posX - b.posX;
        const dy = a.posY - b.posY;
        const r  = a.getRoughRadius()  + b.getRoughRadius() + pad;
        return (dx * dx + dy * dy) <= (r * r);
    } 
    catch (e) 
    {
        console.error("roughNear error:", e);
        return false;
    }
}
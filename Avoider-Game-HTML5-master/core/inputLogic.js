// ============================================================================
// update-game.js
// Core update logic for handling user input, projectiles, NPCs, and collisions.
// Called every frame from controller.js update loop.
// ============================================================================

// -----------------------------------------------------------------------------
// USER INPUT HANDLERS
// -----------------------------------------------------------------------------

/**
 * Handles pause/unpause input.
 * - Toggles game.state between PLAY and PAUSE.
 * - Stores player position when paused and restores state on resume.
 */
function checkforPause(device, game)  
{     
    if (device.keys.isKeyReleased(game.gameConsts.PAUSE_KEY))      
    {         
        if (game.state === gameStates.PLAY)          
        {             
            // Save player position so it can be restored on resume
            game.holdX = game.player.posX;             
            game.holdY = game.player.posY;             

            // Switch to pause mode
            game.state = gameStates.PAUSE;         
        }          
        else if (game.state === gameStates.PAUSE)          
        {             
            // Resume play mode
            game.state = gameStates.PLAY;         
        }     
    } 
}  

/**
 * Processes all player input:
 * - Delegates pause handling to checkforPause().
 * - (Future) Can expand with other global input checks.
 */
function checkUserKeyInput(device, game) 
{     
    checkforPause(device, game); 
}   


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
    // Iterate backwards to allow safe removal during loop
    for (let i = game.projectiles.getSize() - 1; i >= 0; i--)      
    {         
        const proj = game.projectiles.getIndex(i);         

        // Delegate movement/logic to projectile's update method
        if (typeof proj.update === "function") proj.update(device, game, delta);          

        // Check if projectile is off-screen or flagged dead
        const offscreen = proj.posY + proj.halfHeight < 0;         
        const dead = proj.alive === false;          

        if (offscreen || dead)          
        {             
            game.projectiles.subObject(i);         
        }     
    }      

    // Handle projectile → NPC collisions
    updateProjectilesCollision(device, game, delta); 
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
    // spawn orb
    spawnNPC(device, game, spriteTypes.ORB, game.gameConsts.ORB_SPRITE_W, game.gameConsts.ORB_SPRITE_H, game.gameConsts.ORB_SPEED, 1 / game.gameConsts.ORB_SPAWN_RATIO);

    // spawn fireAmmo
    spawnNPC(device, game, spriteTypes.FIRE_AMMO, game.gameConsts.FIRE_AMMO_SPRITE_W, game.gameConsts.FIRE_AMMO_SPRITE_H, game.gameConsts.AMMO_SPEED, 1 / game.gameConsts.AMMO_SPAWN_RATIO );


    // Update NPCs and remove dead or off-screen
    for (let i = game.gameSprites.getSize() - 1; i >= 0; i--)     
    {         
        const npc = game.gameSprites.getIndex(i);         
        if (typeof npc.update === "function") npc.update(device, game, delta);         
        if (!npc.alive || npc.posY > device.canvas.height - 50)          
        {             
            game.gameSprites.subObject(i);        
        }     
    } 
}  


function spawnNPC(device, game, type, width, height, speed, chance)
{
    if (Math.random() >= chance) return;

    // Create the NPC at a temporary X; we'll slide it if overlapping
    const npc = new NPC(type, width, height, 0, 0, speed);

    // Choose a valid center X range that keeps the whole sprite on screen
    const leftMargin  = game.gameConsts.BUFFER_1 || 0;
    const rightMargin = game.gameConsts.BUFFER_2 || 0;
    const minX = npc.halfWidth + leftMargin;
    const maxX = device.canvas.width - npc.halfWidth - rightMargin;

    // start at top
    const startY = 0 + npc.halfHeight; // center placed just inside the top
    npc.movePos(minX + Math.random() * (maxX - minX), startY);

    // Try a few times to avoid overlapping other NPCs
    const attemptsMax = game.gameConsts.SPAWN_ATTEMPTS || 3;
    let attempts = 0;

    while (attempts < attemptsMax && overlapsAny(npc, game.gameSprites)) {
        npc.movePos(minX + Math.random() * (maxX - minX), startY);
        attempts++;
    }

    game.gameSprites.addObject(npc);
}

// helper: does npc overlap any existing alive sprite?
function overlapsAny(npc, holder) {
    const count = holder.getSize();
    const npcBox = npc.getHitbox(1.0, 0);
    for (let i = 0; i < count; i++) {
        const other = holder.getIndex(i);
        if (!other.alive) continue;
        if (rectsCollide(npcBox, other.getHitbox(1.0, 0))) {
            return true;
        }
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
    const spritesCount = game.gameSprites.getSize();
    const projsCount   = game.projectiles.getSize();


    for (let i = projsCount - 1; i >= 0; i--)    
    {     
        const proj = game.projectiles.getIndex(i);  
        if (!proj.alive) continue;

        const projBox = proj.getHitbox(1.0, 0);

        for (let j = spritesCount - 1; j >= 0; j--)      
        {       
            const npc = game.gameSprites.getIndex(j);  
            if (!npc.alive) continue;
            
            // Early-out: skip distant objects
            //if (objectsNear(proj, npc) && objectsCollide(proj, npc))   
            const npcBox = npc.getHitbox(1.0, 0);
            if (rectsCollide(projBox, npcBox))    
            {         
                device.audio.playSound(soundTypes.HIT);         
                game.increaseScore(game.gameConsts.SCORE_INCREASE);  
                npc.kill(); 
                proj.kill();            
                break; // projectile removed, continue with next projectile       
            }     
        }   
    } 
}   


/**
 * Checks player collisions with NPCs:
 * - fireAmmo → gives ammo, switches to SHOOT state.
 * - orb/others → causes damage, reduces life, sets DEATH/LOSE state.
 */
function check_NPC_Collision(device, game)  
{    
    const spritesCount = game.gameSprites.getSize();
    const player = game.player;
    const playerBox = player.getHitbox(1.0, 0);

    for (let i = spritesCount -1; i >= 0; i--)     
    {         
        const npc = game.gameSprites.getIndex(i);  
        if (!npc.alive) continue;

        // optional broad phase to skip far NPCs
        if (!roughNear(player, npc)) continue;

        const npcBox = npc.getHitbox(1.0, 0);
        if (!rectsCollide(playerBox, npcBox)) continue;
        
                    
        if (npc.name === spriteTypes.FIRE_AMMO)             
        {                 
            npc.kill();                
            device.audio.playSound(soundTypes.GET);                 
            game.playState = playStates.SHOOT;                 
            game.increaseAmmo(game.gameConsts.AMMO_AMOUNT);                           
        }              
        else              
        {                 
            npc.kill();                 
            device.audio.playSound(soundTypes.HURT);                 
            game.playState = playStates.DEATH;                 
            game.state = gameStates.LOSE;                 
            game.decreaseLives(1);                 
            return false;             
        }         
           
    }     
    return true; 
} 

// ---------- Collision helpers (global) ----------
function rectsCollide(a, b) 
{
    // AABB overlap test
    return !(
        a.right  < b.left  ||
        a.left   > b.right ||
        a.bottom < b.top   ||
        a.top    > b.bottom
    );
}

// Optional broad phase: fast circle-ish "near" check to skip far pairs
function roughNear(a, b, pad = 0) 
{
    const dx = a.posX - b.posX;
    const dy = a.posY - b.posY;
    const ra = a.getRoughRadius();
    const rb = b.getRoughRadius();
    const r = ra + rb + pad;
    return (dx * dx + dy * dy) <= (r * r);
}

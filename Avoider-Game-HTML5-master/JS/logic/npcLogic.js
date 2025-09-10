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
    spawnNPC(device, game, GameDefs.spriteTypes.ORB.type, GameDefs.spriteTypes.ORB.w, GameDefs.spriteTypes.ORB.h, GameDefs.spriteTypes.ORB.speed, 1 / GameDefs.spriteTypes.ORB.spawnRatio);

    // spawn fireAmmo
    spawnNPC(device, game, GameDefs.spriteTypes.FIRE_AMMO.type, GameDefs.spriteTypes.FIRE_AMMO.w, GameDefs.spriteTypes.FIRE_AMMO.h, GameDefs.spriteTypes.FIRE_AMMO.speed, 1 / GameDefs.spriteTypes.FIRE_AMMO.spawnRatio );


    // Update NPCs and remove dead or off-screen
    for (let i = game.gameSprites.getSize() - 1; i >= 0; i--)     
    {         
        const npc = game.gameSprites.getIndex(i);         
        if (typeof npc.update === "function") npc.update(device, game, delta);         
        if (!npc.alive || npc.posY > device.canvas.height - (device.canvas.height * game.gameConsts.HUD_BUFFER))          
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
    const minX = npc.halfWidth ;
    const maxX = device.canvas.width - npc.halfWidth ;

    // start at top
    const startY = 0 + npc.halfHeight; // center placed just inside the top
    npc.movePos(minX + Math.random() * (maxX - minX), startY);

    // Try a few times to avoid overlapping other NPCs
    const attemptsMax = game.gameConsts.SPAWN_ATTEMPTS;
    let attempts = 0;

    while (attempts < attemptsMax && overlapsAny(npc, game.gameSprites)) {
        npc.movePos(minX + Math.random() * (maxX - minX), startY);
        attempts++;
    }

    game.gameSprites.addObject(npc);
}

// helper: does npc overlap any existing alive sprite?
function overlapsAny(npc, holder) 
{
    const count = holder.getSize();
    const npcBox = npc.getHitbox(1.0, 0);
    for (let i = 0; i < count; i++) 
    {
        const other = holder.getIndex(i);
        if (!other.alive) continue;
        if (rectsCollide(npcBox, other.getHitbox(1.0, 0))) 
        {
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
                device.audio.playSound(GameDefs.soundTypes.HIT.name);         
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
            device.audio.playSound(GameDefs.soundTypes.HURT.name);                 
            game.playState = GameDefs.playStates.DEATH;                 
            game.gameState = GameDefs.gameStates.LOSE;                 
            game.decreaseLives(1);                 
            return false;             
        }         
           
    }     
    return true; 
} 

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

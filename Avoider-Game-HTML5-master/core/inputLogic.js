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
        if (!npc.alive || npc.posY > device.canvas.height - 100)          
        {             
            game.gameSprites.subObject(i);        
        }     
    } 
}  


function spawnNPC(device, game, type, width, height, speed, chance)
{
    if (Math.random() >= chance) return 
    
    // Pck random X
    let rndX = Math.floor(Math.random() * ((device.canvas.width - game.gameConsts.BUFFER_1) - game.gameConsts.BUFFER_2 + 1));  

    // Create NPC
    let posY= 0 //becuse these NPC start at the top of screen
    const npc = new NPC(type, width, height, rndX, posY, speed); 

    // Prevent overlap with existing NPCs
    for (let i = 0; i < game.gameSprites.getSize(); i++) {
        let temp = game.gameSprites.getIndex(i);
        let count = 0;

        // loop while overlapping
        while (npc.checkObjCollision(temp.posX, temp.posY, temp.halfWidth, temp.halfHeight)) {
            if (count > game.gameConsts.SPAWN_ATTEMPTS) break; // stop after SPAWN_ATTEMPTS tries
            // recalc X
            rndX = Math.floor(Math.random() * (device.canvas.width - (game.gameConsts.BUFFER_1 * count) - (game.gameConsts.BUFFER_2 * count) + 1));
            npc.movePos(rndX, 0);
            count++;
        }
    }

    game.gameSprites.addObject(npc);

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
    for (let i = game.projectiles.getSize() - 1; i >= 0; i--)    
    {     
        const proj = game.projectiles.getIndex(i);     
        for (let j = game.gameSprites.getSize() - 1; j >= 0; j--)      
        {       
            const npc = game.gameSprites.getIndex(j);  
            
            // Early-out: skip distant objects
            if (!proj.isNear(npc.posX, npc.posY, npc.halfWidth, npc.halfHeight)) continue;

            if (proj.checkObjCollision(npc.posX, npc.posY, npc.halfWidth, npc.halfHeight))        
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
    for (let i = game.gameSprites.getSize() -1; i >= 0; i--)     
    {         
        const npc = game.gameSprites.getIndex(i);  
        
        if (!game.player.isNear(npc.posX, npc.posY, npc.halfWidth, npc.halfHeight)) continue;
        
        if (game.player.checkObjCollision(npc.posX, npc.posY, npc.halfWidth, npc.halfHeight))          
        {             
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
    }     
    return true; 
} 

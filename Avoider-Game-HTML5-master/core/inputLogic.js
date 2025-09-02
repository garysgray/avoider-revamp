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
function checkUserKeyInput(device, game) {     
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
    // Spawn orb
    if (Math.random() < 1 / game.gameConsts.RND_RATIO)      
    {         
        let rndXValue = Math.floor(Math.random() * ((device.canvas.width - game.gameConsts.BUFFER_1) - game.gameConsts.BUFFER_2 + 1));         
        const orb = new NPC(spriteTypes.ORB, game.gameConsts.ORB_SPRITE_W, game.gameConsts.ORB_SPRITE_H, rndXValue, 0, game.gameConsts.ORB_SPEED);          

        // Prevent overlap with existing NPCs
        for (let i = 0; i < game.gameSprites.getSize(); i++)          
        {             
            let count = 0;             
            let temp = game.gameSprites.getIndex(i);             
            while (orb.checkObjCollision(temp.posX, temp.posY, temp.halfWidth, temp.halfHeight))              
            {                 
                if (count > 3) break;                 
                rndXValue = Math.floor(Math.random() * ((device.canvas.width - (game.gameConsts.BUFFER_1 * count)) - (game.gameConsts.BUFFER_2 * count) + 1));                 
                orb.movePos(rndXValue, 0);                 
                count++;             
            }         
        }         
        game.gameSprites.addObject(orb);     
    }      

    // Spawn fireAmmo
    if (Math.random() < 1 / 99)      
    {         
        let rndXValue = Math.floor(Math.random() * ((device.canvas.width - game.gameConsts.BUFFER_1) - game.gameConsts.BUFFER_2 + 1));         
        const fireAmmo = new NPC(spriteTypes.FIRE_AMMO, game.gameConsts.FIRE_AMMO_SPRITE_W, game.gameConsts.FIRE_AMMO_SPRITE_H, rndXValue, 0, game.gameConsts.ORB_SPEED);          

        // Prevent overlap with existing NPCs
        for (let i = 0; i < game.gameSprites.getSize(); i++)          
        {             
            let count = 0;             
            let temp = game.gameSprites.getIndex(i);             
            while (fireAmmo.checkObjCollision(temp.posX, temp.posY, temp.halfWidth, temp.halfHeight))              
            {                 
                if (count > 3) break;                 
                rndXValue = Math.floor(Math.random() * ((device.canvas.width - (game.gameConsts.BUFFER_1 * count)) - (game.gameConsts.BUFFER_2 * count) + 1));                 
                fireAmmo.movePos(rndXValue, 0);                 
                count++;             
            }         
        }         
        game.gameSprites.addObject(fireAmmo);     
    }      

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
            if (proj.checkObjCollision(npc.posX, npc.posY, npc.halfWidth, npc.halfHeight))        
            {         
                device.audio.playSound(soundTypes.HIT);         
                game.gameSprites.subObject(j);         
                game.projectiles.subObject(i);         
                game.increaseScore(game.gameConsts.SCORE_INCREASE);         
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
        if (game.player.checkObjCollision(npc.posX, npc.posY, npc.halfWidth, npc.halfHeight))          
        {             
            if (npc.name === spriteTypes.FIRE_AMMO)             
            {                 
                game.gameSprites.subObject(i);                 
                device.audio.playSound(soundTypes.GET);                 
                game.playState = playStates.SHOOT;                 
                game.increaseAmmo(game.gameConsts.AMMO_AMOUNT);                           
            }              
            else              
            {                 
                game.gameSprites.subObject(i);                 
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

// ============================================================================
// update-game.js
// Core update logic for handling user input, projectiles, NPCs, and collisions.
// Called every frame from controller.js update loop.
// ============================================================================


// -----------------------------------------------------------------------------
// USER INPUT HANDLERS
// -----------------------------------------------------------------------------

/**
 * Handles player shooting input (mouse/keyboard).
 * Enforces projectile cooldown (shootDelay).
 * Creates a new bullet when allowed and decreases ammo.
 */
function checkForFireButton(device, game) 
{
    const canShoot = 
        (device.mouseDown || device.keys.isKeyPressed(game.gameConsts.PLAY_KEY)) &&
        (Date.now() - game.player.projectileTimer > game.player.shootDelay);

    if (canShoot)
    {
        // Create projectile at player's position
        const bullet = new GameObject(spriteTypes.BULLET, game.gameConsts.BULLET_SPRITE_W, game.gameConsts.BULLET_SPRITE_H, game.player.posX, game.player.posY, game.gameConsts.BULLET_SPEED);

        // Center adjustment
        bullet.posX -= bullet.width * 0.5;
        bullet.posY += bullet.height * 0.5;

        game.projectiles.addObject(bullet);

        // Reset player shoot timer
        game.player.projectileTimer = Date.now();

        // Play sound effect
        device.audio.playSound(soundTypes.SHOOT);

        // Ammo check
        if (game.ammo <= 0) {
            game.playState = playStates.AVOID;
        } else {
            game.decreaseAmmo(1);
        }
    }
}

/**
 * Handles pause/unpause input.
 * Stores player position when paused and restores state on resume.
 */
function checkforPause(device, game) {
    if (device.keys.isKeyReleased(game.gameConsts.PAUSE_KEY)) {
        if (game.state === gameStates.PLAY) {
            game.holdX = game.player.posX;
            game.holdY = game.player.posY;
            game.state = gameStates.PAUSE;
        } else if (game.state === gameStates.PAUSE) {
            game.state = gameStates.PLAY;
        }
    }
}

function checkUserKeyInput(device, game)
{
    // If in SHOOT mode, allow firing on user input (mouse/button)
     if(game.playState == playStates.SHOOT)
    {
        checkForFireButton(device, game); 
    }

    // Check if pause input is triggered
    checkforPause(device, game);
}


// -----------------------------------------------------------------------------
// PROJECTILE UPDATES
// -----------------------------------------------------------------------------

/**
 * Updates all projectiles:
 * - Moves them upward by speed.
 * - Removes off-screen projectiles.
 * - Runs collision check against NPCs.
 */
function updateProjectiles(device, game, delta)
 {
    for (let i = game.projectiles.getSize() - 1; i >= 0; i--)  
        {
        const proj = game.projectiles.getIndex(i);
        proj.posY -= proj.speed * delta;

        if (proj.posY < 0) 
        {
            game.projectiles.subObject(i);
        }
    }
    updateProjectilesCollision(device, game, delta);
}


// -----------------------------------------------------------------------------
// NPC UPDATES
// -----------------------------------------------------------------------------

/**
 * Spawns and updates NPC sprites:
 * - Orbs (common)
 * - FireAmmo (rare)
 * Ensures no overlapping spawns and removes off-screen sprites.
 */
function updateNPCSprites(device, game, delta) {
    // Spawn orb
    if (Math.random() < 1 / game.gameConsts.RND_RATIO) {
        let rndXValue = Math.floor(Math.random() * ((device.canvas.width - game.gameConsts.BUFFER_1) - game.gameConsts.BUFFER_2 + 1));
        const orb = new GameObject(spriteTypes.ORB, game.gameConsts.ORB_SPRITE_W, game.gameConsts.ORB_SPRITE_H, rndXValue, 0, game.gameConsts.ORB_SPEED);

        // Prevent overlap with existing NPCs
        for (let i = 0; i < game.gameSprites.getSize(); i++) {
            let count = 0;
            let temp = game.gameSprites.getIndex(i);
            while (orb.checkObjCollision(temp.posX, temp.posY, temp.width, temp.height)) {
                if (count > 3) break;
                rndXValue = Math.floor(Math.random() * ((device.canvas.width - (game.gameConsts.BUFFER_1 * count)) - (game.gameConsts.BUFFER_2 * count) + 1));
                orb.movePos(rndXValue, 0);
                count++;
            }
        }
        game.gameSprites.addObject(orb);
    }

    // Spawn fireAmmo
    if (Math.random() < 1 / 99) {
        let rndXValue = Math.floor(Math.random() * ((device.canvas.width - game.gameConsts.BUFFER_1) - game.gameConsts.BUFFER_2 + 1));
        const fireAmmo = new GameObject(spriteTypes.FIRE_AMMO, game.gameConsts.FIRE_AMMO_SPRITE_W, game.gameConsts.FIRE_AMMO_SPRITE_H, rndXValue, 0, game.gameConsts.ORB_SPEED);

        // Prevent overlap with existing NPCs
        for (let i = 0; i < game.gameSprites.getSize(); i++) {
            let count = 0;
            let temp = game.gameSprites.getIndex(i);
            while (fireAmmo.checkObjCollision(temp.posX, temp.posY, temp.width, temp.height)) {
                if (count > 3) break;
                rndXValue = Math.floor(Math.random() * ((device.canvas.width - (game.gameConsts.BUFFER_1 * count)) - (game.gameConsts.BUFFER_2 * count) + 1));
                fireAmmo.movePos(rndXValue, 0);
                count++;
            }
        }
        game.gameSprites.addObject(fireAmmo);
    }

    // Update NPC positions, remove off-screen
   for (let i = game.gameSprites.getSize() - 1; i >= 0; i--)  
        {
        const npc = game.gameSprites.getIndex(i);
        npc.moveDown(delta);

        if (npc.posY > device.canvas.height - 100) {
            game.gameSprites.subObject(i);
        }
    }
}


// -----------------------------------------------------------------------------
// COLLISION HANDLERS
// -----------------------------------------------------------------------------

/**
 * Checks projectile collisions with NPCs.
 * - Removes projectile and NPC on hit.
 * - Plays "hit" sound.
 * - Increases score.
 */
function updateProjectilesCollision(device, game, delta) 
{
    for (let i = 0; i < game.projectiles.getSize(); i++) 
    {
        for (let j = 0; j < game.gameSprites.getSize(); j++) 
        {
            const npc = game.gameSprites.getIndex(j);

            if (game.projectiles.getIndex(i).checkObjCollision(npc.posX, npc.posY, npc.width, npc.height)) 
            {
                game.gameSprites.subObject(j);
                game.projectiles.subObject(i); 
                device.audio.playSound(soundTypes.HIT);
                game.increaseScore(game.gameConsts.SCORE_INCREASE);           
                break;
            }
        }
    }
}

/**
 * Checks player collisions with NPCs.
 * - fireAmmo → gives ammo, switches to SHOOT state.
 * - orb/others → causes damage, reduces life, sets DEATH/LOSE state.
 */
function check_NPC_Collision(device, game) 
{
    for (let i = 0; i < game.gameSprites.getSize(); i++)
    {
        const npc = game.gameSprites.getIndex(i);
        if (game.player.checkObjCollision(npc.posX, npc.posY, npc.width, npc.height)) 
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

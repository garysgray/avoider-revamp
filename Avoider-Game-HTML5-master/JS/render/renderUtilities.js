//***************************************************************
// Rendering Functions for Game Objects
//***************************************************************
// These helper functions are called inside renderGameObjectsLayer
// (which is wrapped in a Layer and managed by controller.js).
// Each function is responsible for rendering a specific type of
// object in the game: NPC sprites, projectiles, and the player.
//***************************************************************

//---------------------------------------------------------------
// Render NPC Sprites (orbs, fireAmmo, etc.)
//---------------------------------------------------------------
function renderNPCSprites(device, game) 
{
    try {
        if (!device?.images || typeof device.centerImage !== "function") {
            console.warn("Device or centerImage function not available.");
            return;
        }
        if (!game?.gameSprites || typeof game.gameSprites.getSize !== "function") {
            console.warn("gameSprites not found or invalid.");
            return;
        }

        // Preload references to images (avoid repeated lookups each frame)
        const orbImage      = device.images.getImage?.(GameDefs.spriteTypes.ORB.type);
        const fireAmmoImage = device.images.getImage?.(GameDefs.spriteTypes.FIRE_AMMO.type);

        for (let i = 0; i < game.gameSprites.getSize(); i++) 
        {
            const tempObj = game.gameSprites.getIndex?.(i);
            if (!tempObj) continue;

            switch(tempObj.name) 
            {
                case GameDefs.spriteTypes.ORB.type:
                    if (orbImage) device.centerImage(orbImage, tempObj.posX, tempObj.posY);
                    else console.warn("ORB image missing.");
                break;

                case GameDefs.spriteTypes.FIRE_AMMO.type:
                    if (fireAmmoImage) device.centerImage(fireAmmoImage, tempObj.posX, tempObj.posY);
                    else console.warn("FIRE_AMMO image missing.");
                break;

                default:
                    console.warn("Unknown NPC type:", tempObj.name);
            }

            if (DEBUG_DRAW_HITBOXES && tempObj) drawHitBoxs(device, tempObj);
        }

    } catch (e) {
        console.error("Error in renderNPCSprites:", e);
    }
}

//---------------------------------------------------------------
// Render Bullets (projectiles)
//---------------------------------------------------------------
function renderBullets(device, game) 
{
    try {
        if (!device?.images || typeof device.centerImage !== "function") {
            console.warn("Device or centerImage function not available.");
            return;
        }
        if (!game?.projectiles || typeof game.projectiles.getSize !== "function") {
            console.warn("projectiles not found or invalid.");
            return;
        }

        const bulletImage = device.images.getImage?.(GameDefs.spriteTypes.BULLET.type);
        if (!bulletImage) console.warn("Bullet image missing.");

        for (let i = 0; i < game.projectiles.getSize(); i++) 
        {
            const tempObj = game.projectiles.getIndex?.(i);
            if (!tempObj) continue;

            if (bulletImage) device.centerImage(bulletImage, tempObj.posX, tempObj.posY);
            if (DEBUG_DRAW_HITBOXES) drawHitBoxs(device, tempObj);
        }

    } catch (e) {
        console.error("Error in renderBullets:", e);
    }
}

//---------------------------------------------------------------
// Render Player (different clips based on playState)
//---------------------------------------------------------------
function renderPlayer(device, game) 
{
    try {
        const tempObj = game?.player;
        if (!tempObj) {
            console.warn("Player object missing.");
            return;
        }

        const playerImage = device.images.getImage?.(GameDefs.spriteTypes.PLAYER.type);
        if (!playerImage) {
            console.warn("Player image missing.");
        }

        // // Set state according to current playState safely
        // if (game?.playState && tempObj.state !== undefined) {
        //     const validStates = [
        //         GameDefs.playStates.AVOID,
        //         GameDefs.playStates.SHIELD,
        //         GameDefs.playStates.SHOOT,
        //         GameDefs.playStates.SUPER,
        //         GameDefs.playStates.DEATH
        //     ];
        //     if (validStates.includes(game.playState)) {
        //         tempObj.state = game.playState;
        //     }
        // }

         // Always draw according to the internal state
        if (typeof device.renderClip === "function") {
            device.renderClip(
                playerImage,
                tempObj.posX,
                tempObj.posY,
                tempObj.width,
                tempObj.height,
                tempObj.state
            );
        }

        if (DEBUG_DRAW_HITBOXES) drawHitBoxs(device, tempObj);

    } catch (e) {
        console.error("Error in renderPlayer:", e);
    }
}

//---------------------------------------------------------------
// Render HITBOXES if DEBUG_DRAW_HITBOXES == true
//---------------------------------------------------------------
function drawHitBoxs(device, tempObj) 
{
    try {
        if (!device?.ctx || !tempObj) return;

        const x = tempObj.posX - (tempObj.halfWidth ?? 0);
        const y = tempObj.posY - (tempObj.halfHeight ?? 0);
        const w = tempObj.width ?? 0;
        const h = tempObj.height ?? 0;

        device.ctx.strokeStyle = "lime";
        device.ctx.strokeRect(x, y, w, h);

    } catch (e) {
        console.error("Error in drawHitBoxs:", e);
    }
}

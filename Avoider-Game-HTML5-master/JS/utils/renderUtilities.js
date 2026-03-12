// ============================================================================
// renderHelpers.js
// Rendering helpers for NPCs, projectiles, and player.
// Called from renderGameObjectsLayer.
// ============================================================================


// ---- NPCs -------------------------------------------------------------------
function renderNPCSprites(device, game)
{
    try
    {
        const droneImg = device.images.getImage(spriteTypes.DRONE.name);
        const ammoImg  = device.images.getImage(spriteTypes.AMMO.name);

        for (let i = 0; i < game.gameSprites.getSize(); i++)
        {
            const obj = game.gameSprites.getIndex(i);
            if (!obj) continue;

            switch (obj.name)
            {
                case spriteTypes.DRONE.name:
                    device.renderClip(droneImg, obj.posX, obj.posY, spriteTypes.DRONE.w, spriteTypes.DRONE.h, obj.type);
                    break;
                case spriteTypes.AMMO.name:
                    device.renderClip(ammoImg,  obj.posX, obj.posY, spriteTypes.AMMO.w,  spriteTypes.AMMO.h,  obj.type);
                    break;
                default:
                    console.warn("Unknown NPC name:", obj.name);
            }

            if (DebugUtil.DRAW_DEBUG_HITBOXES) renderHitBoxs(device, obj);
        }
    }
    catch (e) { console.error("renderNPCSprites error:", e); }
}


// ---- Projectiles ------------------------------------------------------------
function renderProjectiles(device, game)
{
    try
    {
        const bulletImg = device.images.getImage(spriteTypes.BULLET.name);

        for (let i = 0; i < game.projectiles.getSize(); i++)
        {
            const obj = game.projectiles.getIndex(i);
            if (!obj) continue;

            if (bulletImg) device.centerImage(bulletImg, obj.posX, obj.posY);
            if (DebugUtil.DRAW_DEBUG_HITBOXES) renderHitBoxs(device, obj);
        }
    }
    catch (e) { console.error("renderProjectiles error:", e); }
}

function renderPlayer(device, game)
{
    try
    {
        const obj       = game.player;
        const playerImg = device.images.getImage(playerSpriteTypes.PLAYER.name);
        if (!playerImg) return;

        // Get background angle and lean ship against it
        const bg           = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
        const counterAngle = bg ? bg.angle * 0.3 : 0;

        device.ctx.save();
        device.ctx.translate(obj.posX, obj.posY);
        device.ctx.rotate(counterAngle);
        device.ctx.translate(-obj.posX, -obj.posY);

        getPlayerEffects().draw(device.ctx, obj);
        device.renderClip(playerImg, obj.posX, obj.posY, obj.width, obj.height, obj.playerState);

        device.ctx.restore();

        if (DebugUtil.DRAW_DEBUG_HITBOXES) renderHitBoxs(device, obj);
    }
    catch (e) { console.error("renderPlayer error:", e); }
}

// ---- Debug Hitboxes ---------------------------------------------------------
function renderHitBoxs(device, tempObj)
{
    try 
        {
            const x = tempObj.posX - tempObj.halfWidth;
            const y = tempObj.posY - tempObj.halfHeight;
            const w = tempObj.width;
            const h = tempObj.height;
            device.ctx.strokeStyle = "lime";
            device.ctx.strokeRect(x, y, w, h);
        } 
        catch (e)
        {
            console.error("Error in renderHitBoxs:", e);
        }
}


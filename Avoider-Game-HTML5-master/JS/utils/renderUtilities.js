// ============================================================================
// RenderUtilities.js
// Rendering helpers for NPCs, projectiles, player, and debug hitboxes.
// Called from GameObjectsRenderLayer — no game logic, drawing only.
// ============================================================================

// ---- Render Constants -------------------------------------------------------

const RENDER_CONSTS = Object.freeze(
{
    ANGLE_DAMPENING : 0.3,        // fraction of background rotation applied to player
    DEFAULT_ANGLE   : 0,          // fallback angle when no background is present
    HITBOX_COLOR    : "lime",     // debug hitbox outline color
});


// ---- NPCs -------------------------------------------------------------------

// Renders all active NPC sprites using sprite sheet clipping by type
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

// Renders all active projectiles centered on their position
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


// ---- Player -----------------------------------------------------------------

// Renders the player with background-synced rotation and per-state glow effects
function renderPlayer(device, game)
{
    try
    {
        const obj       = game.player;
        const playerImg = device.images.getImage(playerSpriteTypes.PLAYER.name);
        if (!playerImg) return;

        // Match player rotation to a fraction of background drift
        const bg    = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
        const angle = bg ? bg.angle * RENDER_CONSTS.ANGLE_DAMPENING : RENDER_CONSTS.DEFAULT_ANGLE;

        device.ctx.save();
        try
        {
            device.ctx.translate(obj.posX, obj.posY);
            device.ctx.rotate(angle);
            device.ctx.translate(-obj.posX, -obj.posY);

            // Draw per-state glow effect beneath the sprite
            getPlayerEffects().draw(device.ctx, obj);

            device.renderClip(playerImg, obj.posX, obj.posY, obj.width, obj.height, obj.playerState);
        }
        finally { device.ctx.restore(); }

        if (DebugUtil.DRAW_DEBUG_HITBOXES) renderHitBoxs(device, obj);
    }
    catch (e) { console.error("renderPlayer error:", e); }
}


// ---- Debug Hitboxes ---------------------------------------------------------

// Draws a wireframe outline around the object's bounding box — toggled by debug flag
function renderHitBoxs(device, obj)
{
    try
    {
        device.ctx.strokeStyle = RENDER_CONSTS.HITBOX_COLOR;
        device.ctx.strokeRect(
            obj.posX - obj.halfWidth,
            obj.posY - obj.halfHeight,
            obj.width,
            obj.height
        );
    }
    catch (e) { console.error("renderHitBoxs error:", e); }
}
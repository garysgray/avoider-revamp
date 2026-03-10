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
        const droneImg = device.images.getImage(GameDefs.spriteTypes.DRONE.name);
        const ammoImg  = device.images.getImage(GameDefs.spriteTypes.AMMO.name);

        for (let i = 0; i < game.gameSprites.getSize(); i++)
        {
            const obj = game.gameSprites.getIndex(i);
            if (!obj) continue;

            switch (obj.name)
            {
                case GameDefs.spriteTypes.DRONE.name:
                    device.renderClip(droneImg, obj.posX, obj.posY, GameDefs.spriteTypes.DRONE.w, GameDefs.spriteTypes.DRONE.h, obj.type);
                    break;
                case GameDefs.spriteTypes.AMMO.name:
                    device.renderClip(ammoImg,  obj.posX, obj.posY, GameDefs.spriteTypes.AMMO.w,  GameDefs.spriteTypes.AMMO.h,  obj.type);
                    break;
                default:
                    console.warn("Unknown NPC name:", obj.name);
            }

            if (DebugUtil.DRAW_DEBUG_HITBOXES) drawHitBoxs(device, obj);
        }
    }
    catch (e) { console.error("renderNPCSprites error:", e); }
}


// ---- Projectiles ------------------------------------------------------------

function renderProjectiles(device, game)
{
    try
    {
        const bulletImg = device.images.getImage(GameDefs.spriteTypes.BULLET.name);

        for (let i = 0; i < game.projectiles.getSize(); i++)
        {
            const obj = game.projectiles.getIndex(i);
            if (!obj) continue;

            if (bulletImg) device.centerImage(bulletImg, obj.posX, obj.posY);
            if (DebugUtil.DRAW_DEBUG_HITBOXES) drawHitBoxs(device, obj);
        }
    }
    catch (e) { console.error("renderProjectiles error:", e); }
}


// ---- Player -----------------------------------------------------------------

function renderPlayer(device, game)
{
    try
    {
        const obj       = game.player;
        const playerImg = device.images.getImage(GameDefs.spriteTypes.PLAYER.name);
        const isShield  = obj.playerState === GameDefs.playStates.SHIELD;
        const isUltra   = obj.playerState === GameDefs.playStates.ULTRA;

        device.ctx.save();

        if (isShield)
        {
            device.ctx.globalCompositeOperation = "lighter";
            // Outer soft glow ring
            const shieldGlow = device.ctx.createRadialGradient(obj.posX, obj.posY, 10, obj.posX, obj.posY, 35);
            shieldGlow.addColorStop(0,   "rgba(186, 209, 231, 0.3)");
            shieldGlow.addColorStop(0.6, "rgba(186, 209, 231, 0.15)");
            shieldGlow.addColorStop(1,   "rgba(186, 209, 231, 0)");
            device.ctx.fillStyle = shieldGlow;
            device.ctx.beginPath();
            device.ctx.arc(obj.posX, obj.posY, 35, 0, Math.PI * 2);
            device.ctx.fill();
        }

        if (isUltra)
        {
            // Pulsing radial burst
            const ultraGlow = device.ctx.createRadialGradient(obj.posX, obj.posY, 5, obj.posX, obj.posY, 38);
            ultraGlow.addColorStop(0,   "rgba(212, 32, 203, 0.5)");
            ultraGlow.addColorStop(0.5, "rgba(212, 32, 203, 0.25)");
            ultraGlow.addColorStop(1,   "rgba(212, 32, 203, 0)");
            device.ctx.fillStyle = ultraGlow;
            device.ctx.beginPath();
            device.ctx.arc(obj.posX, obj.posY, 38, 0, Math.PI * 2);
            device.ctx.fill();
        }

        device.renderClip(playerImg, obj.posX, obj.posY, obj.width, obj.height, obj.playerState);
        device.ctx.restore();

        if (DebugUtil.DRAW_DEBUG_HITBOXES) drawHitBoxs(device, obj);
    }
    catch (e) { console.error("renderPlayer error:", e); }
}

// ---- Debug Hitboxes ---------------------------------------------------------

function drawHitBoxs(device, obj)
{
    if (!device?.ctx || !obj) return;
    device.ctx.strokeStyle = "lime";
    device.ctx.strokeRect(
        obj.posX - (obj.halfWidth  ?? 0),
        obj.posY - (obj.halfHeight ?? 0),
        obj.width  ?? 0,
        obj.height ?? 0
    );
}
// ============================================================================
// projectileLogic.js
// Core update logic for projectiles and collisions.
// Called every frame from the controller update loop.
// ============================================================================


// ---- Projectile Updates -----------------------------------------------------

function updateProjectilesSprites(device, game, delta)
{
    try
    {
        for (let i = game.projectiles.getSize() - 1; i >= 0; i--)
        {
            const proj = game.projectiles.getIndex(i);

            try   { proj.update(device, game, delta); }
            catch (e) { console.error("Projectile update error:", e); }

            const offscreen = proj.posY + proj.halfHeight < game.gameConsts.SCREEN_HEIGHT * game.gameConsts.HUD_BUFFER;
            if (offscreen || !proj.alive)
            {
                try   { game.projectiles.subObject(i); }
                catch (e) { console.error("Failed to remove projectile:", e); }
            }
        }

        updateProjectilesCollision(device, game);
    }
    catch (e) { console.error("updateProjectilesSprites error:", e); }
}


// ---- Collision --------------------------------------------------------------

function updateProjectilesCollision(device, game)
{
    try
    {
        const projCount   = game.projectiles.getSize();
        const spriteCount = game.gameSprites.getSize();

        for (let i = projCount - 1; i >= 0; i--)
        {
            const proj    = game.projectiles.getIndex(i);
            const projBox = proj.getHitbox(1.0, 0);

            for (let j = spriteCount - 1; j >= 0; j--)
            {
                const npc    = game.gameSprites.getIndex(j);
                const npcBox = npc.getHitbox(1.0, 0);

                if (rectsCollide(projBox, npcBox))
                {
                    try { device.audio.playSound(soundTypes.HIT.name); } catch(e) {}
                    npc.kill();
                    proj.kill();
                    game.increaseScore(game.gameConsts.SCORE_INCREASE);
                    break;
                }
            }
        }
    }
    catch (e) { console.error("updateProjectilesCollision error:", e); }
}
// ============================================================================
// ProjectileLogic.js
// Per-frame update and collision logic for player projectiles.
// Called every frame from the controller update loop.
// ============================================================================

// ---- Projectile Updates -----------------------------------------------------

// Advances all projectiles and removes any that are dead or off-screen
function updateProjectilesSprites(device, game, delta)
{
    try
    {
        for (let i = game.projectiles.getSize() - 1; i >= 0; i--)
        {
            const proj = game.projectiles.getIndex(i);

            try   { proj.update(device, game, delta); }
            catch (e) { console.error("Projectile update error:", e); }

            // Remove if dead or scrolled past the HUD buffer at the top
            const offscreen = proj.posY + proj.halfHeight < game.gameConsts.SCREEN_HEIGHT * game.gameConsts.HUD_BUFFER;
            if (offscreen || !proj.alive)
            {
                try   { game.projectiles.subObject(i); }
                catch (e) { console.error("Failed to remove projectile:", e); }
            }
        }
    }
    catch (e) { console.error("updateProjectilesSprites error:", e); }
}


// ---- Collision --------------------------------------------------------------

// Checks all projectiles against all NPCs — calls handleProjectileHit on contact
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
                const npc = game.gameSprites.getIndex(j);
                if (rectsCollide(projBox, npc.getHitbox(1.0, 0)))
                {
                    handleProjectileHit(device, game, proj, npc);
                    break;  // one hit per projectile per frame
                }
            }
        }
    }
    catch (e) { console.error("updateProjectilesCollision error:", e); }
}
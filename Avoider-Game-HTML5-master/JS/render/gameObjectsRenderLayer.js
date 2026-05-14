// ============================================================================
// GameObjectsLayer.js
// Renders all gameplay visuals (NPCs, projectiles, player).
// No game logic — drawing only.
// ============================================================================
function renderGameObjectsLayer(device, game)
{

    // --- PARTICLE RENDERING (DO THIS FIRST OR LAST DEPENDING ON LAYER PREFERENCE) ---
    // We do this outside the switch so particles keep rendering/fading 
    // even during state transitions or on the LOSE screen.
    game.effects.particles.forEach(p =>
    {
        device.ctx.globalAlpha = p.life;
        device.ctx.fillStyle   = "orange"; 
        device.ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
        device.ctx.globalAlpha = 1.0;
    });
    switch (game.gameState)
    {
        case gameStates.INIT:
            try
            {
                // Grab the bullet image for rendering bullets below
                const bulletImg = device.images.getImage(spriteTypes.BULLET.name);

                // If the orb exists and is alive put it in a one-item array, otherwise empty array
                // This lets us combine it with enemies in one renderNPCs call below
                const orbList = game.attractMode.orb && game.attractMode.orb.alive ? [game.attractMode.orb] : [];

                // Spread both arrays into one combined list and render them all in one pass
                // [...enemies, ...orbList] = all enemies plus the orb if alive, or just enemies if not
                renderNPCs(device, [...game.attractMode.enemies, ...orbList]);

                // Loop every bullet — if it's alive draw it centered on its position
                game.attractMode.bullets.forEach(bullet =>
                {
                    if (bullet && bullet.alive) device.centerImage(bulletImg, bullet.posX, bullet.posY);
                });

                // game.attractMode.particles.forEach(p =>
                // {
                //     device.ctx.globalAlpha = p.life;           // fade out as life drops
                //     device.ctx.fillStyle   = "orange";
                //     device.ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
                //     device.ctx.globalAlpha = 1.0;              // always restore alpha
                // });

                renderPlayer(device, game);
            }
            catch (e) { console.error("Error rendering attract mode:", e); }
            break;

        case gameStates.PLAY:
            try
            {
                renderNPCSprites(device, game);
                renderProjectiles(device, game);
                renderPlayer(device, game);

                // game.attractMode.particles.forEach(p =>
                // {
                //     device.ctx.globalAlpha = p.life;           // fade out as life drops
                //     device.ctx.fillStyle   = "orange";
                //     device.ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
                //     device.ctx.globalAlpha = 1.0;              // always restore alpha
                // });
            }
            catch (e) { console.error("Error rendering gameplay objects:", e); }
            break;

        case gameStates.LOSE:
            try   { renderPlayer(device, game); }
            catch (e) { console.error("Error rendering player on lose screen:", e); }
            break;
    }
}
const gameObjectsLayer = new Layer("GameObjects", renderGameObjectsLayer);
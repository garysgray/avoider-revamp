// ============================================================================
// gameObjectsLayer.js
// Renders all gameplay visuals (NPCs, projectiles, player).
// No game logic — drawing only.
// ============================================================================

function renderGameObjectsLayer(device, game)
{
    switch (game.gameState)
    {
        case gameStates.PLAY:
            try
            {
                renderNPCSprites(device, game);
                renderProjectiles(device, game);
                renderPlayer(device, game);
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
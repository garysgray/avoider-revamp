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
    // Preload references to images (avoid repeated lookups each frame)
    let orbImage      = device.images.getImage("orb");
    let fireAmmoImage = device.images.getImage("fireAmmo");

    // Loop through all NPC sprites in gameSprites list
    for (let i = 0; i < game.gameSprites.getSize(); i++)
    {
        // Get reference to current sprite object
        let tempObj = game.gameSprites.getIndex(i);

        // Render sprite based on its name
        switch(tempObj.name)
        {
            case "orb":
                device.renderImage(orbImage, tempObj.posX, tempObj.posY);
            break;

            case "fireAmmo":
                device.renderImage(fireAmmoImage, tempObj.posX, tempObj.posY);
            break;
        }
    }
}

//---------------------------------------------------------------
// Render Bullets (projectiles)
//---------------------------------------------------------------
function renderBullets(device, game)
{
    // Preload bullet image
    let bulletImage = device.images.getImage("bullet");

    // Loop through all active bullets in projectiles list
    for (let i = 0; i < game.projectiles.getSize(); i++)
    {
        // Get reference to current bullet
        let tempObj = game.projectiles.getIndex(i);

        // Render bullet at its current position
        device.renderImage(bulletImage, tempObj.posX, tempObj.posY);
    }
}

//---------------------------------------------------------------
// Render Player (different clips based on playState)
//---------------------------------------------------------------
function renderPlayer(device, game)
{
    // Shortcut reference to player object
    const playerObj = game.player;

    // Render player based on their current playState
    switch(game.playState)
    {
        case playStates.AVOID:
        case playStates.SHIELD:
        case playStates.SHOOT:
        case playStates.SUPER:
        case playStates.DEATH:
            playerObj.state = game.playState;
        break;
    }

    device.renderClip(
        device.images.getImage("player"),
        playerObj.posX,
        playerObj.posY,
        playerObj.width,
        playerObj.height,
        playerObj.state
    );
}

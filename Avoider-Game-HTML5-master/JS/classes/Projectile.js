// ============================================================================
// Projectile.js
// Player-fired bullet — moves in a direction derived from a spawn angle.
// Killed automatically when it travels off the top of the screen.
// ============================================================================

class Projectile extends GameObject
{
    #velX;
    #velY;

    // angle (radians) tilts the bullet left/right — 0 fires straight up
    constructor(name, width, height, posX, posY, speed, angle = 0)
    {
        super(name, width, height, posX, posY, speed);
        this.#velX =  Math.sin(angle);   // horizontal component
        this.#velY = -Math.cos(angle);   // vertical component — negative = upward
    }

    // Moves along the velocity vector, kills self when off the top of the screen
    update(device, game, delta)
    {
        this.posX += this.#velX * this.speed * delta;
        this.posY += this.#velY * this.speed * delta;
        if (this.posY + this.halfHeight < 0) this.kill();
    }
}
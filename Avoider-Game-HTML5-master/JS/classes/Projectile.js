// ---- Projectile -------------------------------------------------------------

class Projectile extends GameObject
{
    constructor(name, width, height, posX, posY, speed)
    {
        super(name, width, height, posX, posY, speed);
    }

    update(device, game, delta)
    {
        this.posY -= this.speed * delta;
        if (this.posY + this.halfHeight < 0) this.kill();
    }
}

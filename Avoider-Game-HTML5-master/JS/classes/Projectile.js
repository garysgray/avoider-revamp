class Projectile extends GameObject
{
    #velX;
    #velY;

    constructor(name, width, height, posX, posY, speed, angle = 0)
    {
        super(name, width, height, posX, posY, speed);
        this.#velX = Math.sin(angle);
        this.#velY = -Math.cos(angle);
    }

    update(device, game, delta)
    {
        this.posX += this.#velX * this.speed * delta;
        this.posY += this.#velY * this.speed * delta;
        if (this.posY + this.halfHeight < 0) this.kill();
    }
}
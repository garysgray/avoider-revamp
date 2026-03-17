// ---- NPC --------------------------------------------------------------------

class NPC extends GameObject
{
    #type;

    constructor(name, width, height, x, y, speed, type)
    {
        super(name, width, height, x, y, speed);
        this.#type = type;
    }

    get type()  { return this.#type; }
    set type(v) { this.#type = v; }

    update(device, game, delta)
    {
        const hudBuff = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT;
        switch (this.#type)
        {
            case enemyEnum.BUG: this.moveDiagonalDownLeft(game, delta);  break;
            case enemyEnum.UFO: this.moveDiagonalDownRight(game, delta); break;
            default:            this.moveDown(game, delta);
        }
        if (this.posY > game.gameConsts.SCREEN_HEIGHT + hudBuff) this.kill();
    }

    // Shared multiplier helper
    #multiplier(game) { return game.npcSpeedMuliplyer > 0 ? game.npcSpeedMuliplyer : 1; }

    moveDown(game, delta)
    {
        this.posY += this.speed * this.#multiplier(game) * delta;
    }

    moveDiagonalDownLeft(game, delta)
    {
        const s = this.speed * this.#multiplier(game) * delta;
        this.posY += s * game.gameConsts.Y_ANGLE_SPEED;
        this.posX -= s * game.gameConsts.X_ANGLE_SPEED;
    }

    moveDiagonalDownRight(game, delta)
    {
        const s = this.speed * this.#multiplier(game) * delta;
        this.posY += s * game.gameConsts.Y_ANGLE_SPEED;
        this.posX += s * game.gameConsts.X_ANGLE_SPEED;
    }
}
// ============================================================================
// NPC.js
// Enemy and pickup entities — extends GameObject with type-based movement.
// ============================================================================

// ---- NPC Constants ----------------------------------------------------------

const NPC_CONSTS = Object.freeze(
{
    MIN_MULTIPLIER: 1,    // fallback speed multiplier if npcSpeedMultiplier is <= 0
});


// ---- NPC --------------------------------------------------------------------
// Spawned entities that move down the screen.
// Movement pattern is determined by type — EYE moves straight down,
// BUG diagonal left, UFO diagonal right.
// Killed automatically when it scrolls past the bottom of the screen.

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

    // Moves based on type, kills self if past the bottom of the screen
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

    // Returns the current speed multiplier — falls back to 1 if unset or invalid
    #multiplier(game)
    {
        return game.npcSpeedMuliplyer > 0 ? game.npcSpeedMuliplyer : NPC_CONSTS.MIN_MULTIPLIER;
    }

    // Moves straight down
    moveDown(game, delta)
    {
        this.posY += this.speed * this.#multiplier(game) * delta;
    }

    // Moves down and to the left at the configured angle
    moveDiagonalDownLeft(game, delta)
    {
        const s    = this.speed * this.#multiplier(game) * delta;
        this.posY += s * game.gameConsts.Y_ANGLE_SPEED;
        this.posX -= s * game.gameConsts.X_ANGLE_SPEED;
    }

    // Moves down and to the right at the configured angle
    moveDiagonalDownRight(game, delta)
    {
        const s    = this.speed * this.#multiplier(game) * delta;
        this.posY += s * game.gameConsts.Y_ANGLE_SPEED;
        this.posX += s * game.gameConsts.X_ANGLE_SPEED;
    }
}
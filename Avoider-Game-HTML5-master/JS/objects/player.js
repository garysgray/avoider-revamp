// ============================================================================
// Player
// Controllable entity. Handles input, shooting, bounds, and state transitions.
// ============================================================================

class Player extends GameObject
{
    #coolDownTimer;
    #playerState;
    #savedPlayerState;

    constructor(width, height, x, y, speed)
    {
        super(GameDefs.spriteTypes.PLAYER, width, height, x, y, speed);
        this.#playerState      = GameDefs.playStates.AVOID;
        this.#savedPlayerState = GameDefs.playStates.AVOID;
        this.#coolDownTimer    = new Timer(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER, 0, GameDefs.timerModes.COUNTDOWN);
    }

    // ---- Getters / Setters ----
    get coolDownTimer()      { return this.#coolDownTimer; }
    get playerState()        { return this.#playerState; }
    get savedPlayerState()   { return this.#savedPlayerState; }
    set playerState(v)       { this.#playerState = v; }
    set savedPlayerState(v)  { this.#savedPlayerState = v; }

    // ---- State Helpers ----
    setPlayerState(s)    { this.#playerState = s; }
    savePlayerState(s)   { this.#savedPlayerState = s; }
    restorePlayerState() { this.#playerState = this.#savedPlayerState; }

    // ---- Update ----
    update(device, game, delta, collisionFunction)
    {
        if (typeof collisionFunction === "function") this.checkNPCCollision(device, game, collisionFunction);

        if (this.#playerState === GameDefs.playStates.DEATH)
        {
            this.#savedPlayerState = GameDefs.playStates.DEATH;
            return;
        }

        this.#coolDownTimer.update(delta);
        this.tryShoot(device, game);
        this.enforceBounds(game);

        // If shield/ultra timer expires, revert to appropriate state
        const shieldTimer = game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER);
        if (shieldTimer.active && shieldTimer.update(delta))
        {
            this.#playerState = game.ammo > 0 ? GameDefs.playStates.SHOOT : GameDefs.playStates.AVOID;
        }

        if (this.#savedPlayerState !== this.#playerState) this.#savedPlayerState = this.#playerState;
    }

    // ---- Shooting ----
    tryShoot(device, game)
    {
        if (this.#playerState !== GameDefs.playStates.SHOOT) return false;
        if (this.#coolDownTimer.active) return false;

        if (game.ammo <= 0)
        {
            this.#playerState = GameDefs.playStates.AVOID;
            return false;
        }

        const firePressed = device.mouseDown || device.keys.isKeyPressed(GameDefs.keyTypes.PLAY_KEY);
        if (!firePressed) return false;

        const def    = GameDefs.spriteTypes.BULLET;
        const bullet = new Projectile(
            def.name,
            def.w,
            def.h,
            this.posX,
            this.posY - this.halfHeight - def.spawnRatio - (def.h * 0.5),
            def.speed
        );

        game.projectiles.addObject(bullet);
        game.decreaseAmmo(1);
        this.#coolDownTimer.reset(game.gameConsts.SHOOT_COOLDOWN, GameDefs.timerModes.COUNTDOWN, false);
        try { device.audio.playSound(GameDefs.soundTypes.SHOOT.name); } catch(e) {}
        return true;
    }

    // ---- Bounds ----
    enforceBounds(game)
    {
        const hudBuffer = game.gameConsts.SCREEN_HEIGHT * game.gameConsts.HUD_BUFFER;
        const maxX      = game.gameConsts.SCREEN_WIDTH;
        const maxY      = game.gameConsts.SCREEN_HEIGHT;

        if (this.posX - this.halfWidth  < 0)       this.posX = this.halfWidth;
        if (this.posX + this.halfWidth  > maxX)     this.posX = maxX - this.halfWidth;
        if (this.posY - this.halfHeight < hudBuffer) this.posY = this.halfHeight + hudBuffer;
        if (this.posY + this.halfHeight > maxY)      this.posY = maxY - this.halfHeight;
    }

    // ---- Collision ----
    checkNPCCollision(device, game, collisionFunction)
    {
        if (this.#playerState === GameDefs.playStates.SHIELD) return;

        if (collisionFunction(device, game) === false)
        {
            this.savePos(this.posX, this.posY);
            this.#playerState = GameDefs.playStates.DEATH;
        }
    }

    // ---- Mouse ----
    setMouseToPlayer(device)
    {
        device.setupMouse(this, device);
    }
}
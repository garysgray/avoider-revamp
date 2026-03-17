// ============================================================================
// Player.js
// Controllable entity — handles input, shooting, bounds, and state transitions.
// ============================================================================

// ---- Player Constants -------------------------------------------------------

const PLAYER_CONSTS = Object.freeze(
{
    CENTER          : 0.5,    // multiplier for centering calculations
    ANGLE_DAMPENING : 0.3,    // how much background rotation affects bullet angle
    DEFAULT_ANGLE   : 0,      // bullet angle when no background is present
    MIN_AMMO        : 0,      // ammo floor — can't shoot below this
    AMMO_DECREASE   : 1,      // ammo consumed per shot
});


// ---- Player -----------------------------------------------------------------
// The player entity. Reads input from device, fires projectiles, enforces
// screen bounds, and manages state transitions (AVOID, SHOOT, SHIELD, ULTRA, DEATH).

class Player extends GameObject
{
    #coolDownTimer;
    #playerState;
    #savedPlayerState;

    constructor(width, height, x, y, speed)
    {
        super(playerSpriteTypes.PLAYER, width, height, x, y, speed);
        this.#playerState      = playStates.AVOID;
        this.#savedPlayerState = playStates.AVOID;
        this.#coolDownTimer    = new Timer(timerTypes.SHOOT_COOL_DOWN_TIMER, 0, timerModes.COUNTDOWN);
    }

    // ---- Getters / Setters --------------------------------------------------

    get coolDownTimer()      { return this.#coolDownTimer; }
    get playerState()        { return this.#playerState; }
    get savedPlayerState()   { return this.#savedPlayerState; }
    set playerState(v)       { this.#playerState = v; }
    set savedPlayerState(v)  { this.#savedPlayerState = v; }

    // ---- State Helpers ------------------------------------------------------

    setPlayerState(s)    { this.#playerState = s; }
    savePlayerState(s)   { this.#savedPlayerState = s; }
    restorePlayerState() { this.#playerState = this.#savedPlayerState; }

    // ---- Update -------------------------------------------------------------

    update(device, game, delta, collisionFunction)
    {
        if (typeof collisionFunction === "function") this.checkNPCCollision(device, game, collisionFunction);

        // Freeze all logic on death
        if (this.#playerState === playStates.DEATH)
        {
            this.#savedPlayerState = playStates.DEATH;
            return;
        }

        this.#coolDownTimer.update(delta);
        this.tryShoot(device, game);
        this.enforceBounds(game);

        // When shield/ultra timer expires, revert to SHOOT or AVOID based on ammo
        const shieldTimer = game.gameTimers.getObjectByName(timerTypes.SHIELD_TIMER);
        if (shieldTimer.active && shieldTimer.update(delta))
        {
            this.#playerState = game.ammo > PLAYER_CONSTS.MIN_AMMO
                ? playStates.SHOOT
                : playStates.AVOID;
        }

        // Keep saved state in sync
        if (this.#savedPlayerState !== this.#playerState) this.#savedPlayerState = this.#playerState;
    }

    // ---- Shooting -----------------------------------------------------------

    // Attempts to fire a bullet — returns false if conditions aren't met
    tryShoot(device, game)
    {
        if (this.#playerState !== playStates.SHOOT)   return false;
        if (this.#coolDownTimer.active)                return false;
        if (game.ammo <= PLAYER_CONSTS.MIN_AMMO)
        {
            this.#playerState = playStates.AVOID;
            return false;
        }

        const firePressed = device.mouseDown || device.keys.isKeyPressed(keyTypes.PLAY_KEY);
        if (!firePressed) return false;

        // Bullet inherits a fraction of background rotation for visual effect
        const bg    = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
        const angle = bg ? bg.angle * PLAYER_CONSTS.ANGLE_DAMPENING : PLAYER_CONSTS.DEFAULT_ANGLE;
        const def   = spriteTypes.BULLET;

        const bullet = new Projectile(
            def.name,
            def.w,
            def.h,
            this.posX,
            this.posY - this.halfHeight - def.spawnRatio - (def.h * PLAYER_CONSTS.CENTER),
            def.speed,
            angle
        );

        game.projectiles.addObject(bullet);
        game.decreaseAmmo(PLAYER_CONSTS.AMMO_DECREASE);
        this.#coolDownTimer.reset(game.gameConsts.SHOOT_COOLDOWN, timerModes.COUNTDOWN, false);
        try { device.audio.playSound(soundTypes.SHOOT.name); } catch(e) {}

        return true;
    }

    // ---- Bounds -------------------------------------------------------------

    // Clamps player position within the playfield, respecting the HUD buffer at the top
    enforceBounds(game)
    {
        const hudBuffer = game.gameConsts.SCREEN_HEIGHT * game.gameConsts.HUD_BUFFER;
        const maxX      = game.gameConsts.SCREEN_WIDTH;
        const maxY      = game.gameConsts.SCREEN_HEIGHT;

        if (this.posX - this.halfWidth  < 0)         this.posX = this.halfWidth;
        if (this.posX + this.halfWidth  > maxX)       this.posX = maxX - this.halfWidth;
        if (this.posY - this.halfHeight < hudBuffer)  this.posY = this.halfHeight + hudBuffer;
        if (this.posY + this.halfHeight > maxY)       this.posY = maxY - this.halfHeight;
    }

    // ---- Collision ----------------------------------------------------------

    // Runs the collision function unless shielded — triggers death state on hit
    checkNPCCollision(device, game, collisionFunction)
    {
        if (this.#playerState === playStates.SHIELD) return;

        if (collisionFunction(device, game) === false)
        {
            this.savePos(this.posX, this.posY);
            this.#playerState = playStates.DEATH;

            // Reset background rotation on death
            const bg = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
            if (bg) bg.reset();
        }
    }

    // ---- Mouse --------------------------------------------------------------

    // Binds mouse movement to this player instance
    setMouseToPlayer(device)
    {
        device.setupMouse(this, device);
    }

    // ---- Factory ------------------------------------------------------------

    // Creates a player from the configured sprite type definitions
    static buildPlayer()
    {
        try
        {
            return new Player(
                playerSpriteTypes.PLAYER.w,
                playerSpriteTypes.PLAYER.h,
                0,
                0,
                0
            );
        }
        catch (err) { console.error("Failed to initialize player:", err); }
    }

    // ---- Movement -----------------------------------------------------------

    // Reads directional input and moves the player — updates facing state
    checkForMoveInput(device, game, delta)
    {
        const { dx, dy } = device.keys.getMovementVector();
        if (dx === 0 && dy === 0) return false;

        // Update facing state based on direction
        if      (dx === 0 && dy < 0) this.playerState = playStates.UP;
        else if (dx === 0 && dy > 0) this.playerState = playStates.DOWN;
        else if (dx > 0 && dy === 0) this.playerState = playStates.RIGHT;
        else if (dx < 0 && dy === 0) this.playerState = playStates.LEFT;
        else if (dx > 0 && dy < 0)  this.playerState = playStates.UP_RIGHT;
        else if (dx < 0 && dy < 0)  this.playerState = playStates.UP_LEFT;
        else if (dx > 0 && dy > 0)  this.playerState = playStates.DOWN_RIGHT;
        else if (dx < 0 && dy > 0)  this.playerState = playStates.DOWN_LEFT;

        // Normalize diagonal movement to prevent faster diagonal speed
        const len = Math.hypot(dx, dy);
        this.tryMoveWithCollision(
            game.mapHolder,
            (dx / len) * this.speed * delta,
            (dy / len) * this.speed * delta
        );

        return true;
    }
}
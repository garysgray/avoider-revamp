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
        super(playerSpriteTypes.PLAYER, width, height, x, y, speed);
        this.#playerState      = playStates.AVOID;
        this.#savedPlayerState = playStates.AVOID;
        this.#coolDownTimer    = new Timer(timerTypes.SHOOT_COOL_DOWN_TIMER, 0, timerModes .COUNTDOWN);
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

        if (this.#playerState === playStates.DEATH)
        {
            this.#savedPlayerState = playStates.DEATH;
            return;
        }

        this.#coolDownTimer.update(delta);
        this.tryShoot(device, game);
        this.enforceBounds(game);

        // If shield/ultra timer expires, revert to appropriate state
        const shieldTimer = game.gameTimers.getObjectByName(timerTypes.SHIELD_TIMER);
        if (shieldTimer.active && shieldTimer.update(delta))
        {
            this.#playerState = game.ammo > 0 ? playStates.SHOOT : playStates.AVOID;
        }

        if (this.#savedPlayerState !== this.#playerState) this.#savedPlayerState = this.#playerState;
    }

    // ---- Shooting ----
    tryShoot(device, game)
    {
        if (this.#playerState !== playStates.SHOOT) return false;
        if (this.#coolDownTimer.active) return false;
        if (game.ammo <= 0)
        {
            this.#playerState = playStates.AVOID;
            return false;
        }
        const firePressed = device.mouseDown || device.keys.isKeyPressed(keyTypes.PLAY_KEY);
        if (!firePressed) return false;
        const bg    = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
        const angle = bg ? bg.angle * 0.3 : 0;
        const def   = spriteTypes.BULLET;
        
        const bullet = new Projectile(
            def.name,
            def.w,
            def.h,
            this.posX,
            this.posY - this.halfHeight - def.spawnRatio - (def.h * 0.5),
            def.speed,
            angle
        );
        game.projectiles.addObject(bullet);
        game.decreaseAmmo(1);
        this.#coolDownTimer.reset(game.gameConsts.SHOOT_COOLDOWN, timerModes.COUNTDOWN, false);
        try { device.audio.playSound(soundTypes.SHOOT.name); } catch(e) {}
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
        if (this.#playerState === playStates.SHIELD) return;

        if (collisionFunction(device, game) === false)
        {
            this.savePos(this.posX, this.posY);
            this.#playerState = playStates.DEATH;

            const bg = game.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
            if (bg) bg.reset();
        }
    }

    // ---- Mouse ----
    setMouseToPlayer(device)
    {
        //device.teardownMouse();
        device.setupMouse(this, device);
    }

    static buildPlayer()
    {
        try 
        {
            const player = new Player(
                playerSpriteTypes.PLAYER.w,
                playerSpriteTypes.PLAYER.h,
                0,
                0,
                 0
            );
            return player;
        } 
        catch (err) 
        {
            console.error("Failed to initialize player:", err);
        }
        
    }

    checkForMoveInput(device, game, delta) 
    {
        const { dx, dy } = device.keys.getMovementVector();

        if (dx === 0 && dy === 0)
            return false;

        // Player state (animation / facing)
        if (dx === 0 && dy < 0) this.playerState = playStates.UP;
        else if (dx === 0 && dy > 0) this.playerState = playStates.DOWN;
        else if (dx > 0 && dy === 0) this.playerState = playStates.RIGHT;
        else if (dx < 0 && dy === 0) this.playerState = playStates.LEFT;
        else if (dx > 0 && dy < 0) this.playerState = playStates.UP_RIGHT;
        else if (dx < 0 && dy < 0) this.playerState = playStates.UP_LEFT;
        else if (dx > 0 && dy > 0) this.playerState = playStates.DOWN_RIGHT;
        else if (dx < 0 && dy > 0) this.playerState = playStates.DOWN_LEFT;

        // Normalize
        const len = Math.hypot(dx, dy);
        const nx = dx / len;
        const ny = dy / len;

        this.tryMoveWithCollision(
            game.mapHolder,
            nx * this.speed * delta,
            ny * this.speed * delta
        );

        return true;
    }
    
}
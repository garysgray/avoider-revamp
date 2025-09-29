// --------------------------------------------
// Player
// --------------------------------------------
// The main controllable entity
// - Tracks shooting cooldown
// - Enforces screen boundaries
// - Spawns projectiles when input detected
// --------------------------------------------
class Player extends GameObject 
{
    #coolDownTimer;
    #playerState;
    #savedPlayerState; 

    constructor(width, height, x, y, speed) 
    {
        super(GameDefs.spriteTypes.PLAYER, width, height, x, y, speed);

        this.#playerState = GameDefs.playStates.AVOID;
        this.#savedPlayerState = GameDefs.playStates.AVOID;

        this.#coolDownTimer =  new Timer(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER, 0, GameDefs.timerModes.COUNTDOWN);
    }

    get coolDownTimer() { return this.#coolDownTimer; }
    get playerState() { return this.#playerState; }
    get savedPlayerState() { return this.#savedPlayerState; }

    set playerState(v) { this.#playerState = v; }
    set savedPlayerState(v) { this.#savedPlayerState = v; }


    // Attempt to fire a projectile
    // - Checks play state, ammo, input, and cooldown
    tryShoot(device, game) 
    {
        try 
        {
            if (this.playerState !== GameDefs.playStates.SHOOT) return false;
    
            if ( this.coolDownTimer.active) return false;
            if (game.ammo <= 0) 
            {
                this.playerState = GameDefs.playStates.AVOID;
                return false;
            }

            const firePressed = device.mouseDown || device.keys.isKeyPressed(GameDefs.keyTypes.PLAY_KEY);
            if (!firePressed) return false;

            const bulletDef = GameDefs.spriteTypes.BULLET
            const bullet = new Projectile(bulletDef.name,
                bulletDef.w,
                bulletDef.h,
                this.posX,
                this.posY - this.halfHeight - bulletDef.spawnRatio - (bulletDef.h  * 0.5),
                bulletDef.speed 
            );

            game.projectiles.addObject(bullet);
            game.decreaseAmmo(1);
            this.coolDownTimer.reset(game.gameConsts.SHOOT_COOLDOWN, GameDefs.timerModes.COUNTDOWN, false);

            device.audio.playSound(GameDefs.soundTypes.SHOOT.name);
            return true;
        } 
        catch (e) 
        {
            console.error("Player tryShoot error:", e);
            return false;
        }
    }

    // Update player each frame
    // - Updates cooldown
    // - Enforces screen bounds
    // - Handles shooting
    update(device, game, delta, collisionFunction) 
    {
        try 
        {
            if (typeof collisionFunction === "function") 
            {
                this.checkNPCCollision(device, game, collisionFunction);
            }

            // If dead, freeze state until game handles respawn/lose
            if (this.playerState === GameDefs.playStates.DEATH) 
            {
                this.savedPlayerState = GameDefs.playStates.DEATH;
                return;
            }

            // Update cooldowns
            if (this.coolDownTimer.update) this.coolDownTimer.update(delta);

            // Handle shooting
            this.tryShoot(device, game);

            // Enforce screen bounds
            this.enforceBounds(game);

            // Handle shield timer: if shield expired, switch back
            const shieldTimer = game.gameTimers.getObjectByName(GameDefs.timerTypes.SHIELD_TIMER);
            if (shieldTimer.active && shieldTimer.update) 
            {
                if (shieldTimer.update(delta)) 
                {
                    if (game.ammo > 0) this.playerState = GameDefs.playStates.SHOOT;
                    else this.playerState = GameDefs.playStates.AVOID;
                }
            }

            // Sync player state with current playState
            if (this.savedPlayerState !== this.playerState) 
            {
                this.savedPlayerState = this.playerState;
            }   
        } 
        catch (e) 
        {
            console.error("Player update error:", e);
        }
    }
    // Prevents player from leaving visible play area
    enforceBounds(game) 
    {
        try 
        {
            const hudBuffer = game.gameConsts.SCREEN_HEIGHT * game.gameConsts.HUD_BUFFER;
            if (this.posX - this.halfWidth < 0) this.posX = this.halfWidth;
            if (this.posX + this.halfWidth > game.gameConsts.SCREEN_WIDTH) this.posX = game.gameConsts.SCREEN_WIDTH - this.halfWidth;
            if (this.posY - this.halfHeight < 0 + hudBuffer) this.posY = this.halfHeight + hudBuffer;
            if (this.posY + this.halfHeight > game.gameConsts.SCREEN_HEIGHT) 
            {
                this.posY = (game.gameConsts.SCREEN_HEIGHT) - this.halfHeight;
            }
        }  
        catch (e) 
        {
            console.error("Player enforceBounds error:", e);
        }
    }

    checkNPCCollision(device, game, collisionFunction)
    {
        if (this.playerState !== GameDefs.playStates.SHIELD) 
        {
            const avoidedCollision = collisionFunction(device, game);
            if (avoidedCollision === false) 
            {
                // When player dies from collision we save his position to show dead player in pause menue
                this.savePos(this.posX, this.posY);
                this.playerState = GameDefs.playStates.DEATH;
            }
        }

    }

    savePlayerState(state)    { this.#savedPlayerState = state; }
    restorePlayerState()      { this.#playerState = this.#savedPlayerState; }
    setPlayerState(playerState) { this.#playerState = playerState; }
}

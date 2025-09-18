// ============================================================================
// Base GameObject + Child Classes (Player, Projectile, NPC, BackDrop)
// ============================================================================
// --------------------------------------------
// GameObject is the base class for all in-game entities
// - Tracks position, size, speed, and state
// - Provides movement and collision functions
//
// Player extends GameObject
// - Adds shooting mechanics (timer + delay)
// - Enforces screen boundaries
//
// Projectile extends GameObject
// - Moves upward each frame until offscreen
// - Has alive flag for cleanup
//
// NPC extends GameObject
// - Moves downward each frame until offscreen
// - Has alive flag for cleanup
//
// BackDrop extends GameObject
// - Used for static/scrolling backgrounds or decorative elements
// --------------------------------------------

class GameObject 
{
    #name;
    #width;
    #height;
    #posX;
    #posY;
    #speed;
    #state;
    #alive = true;

    #halfWidth; #halfHeight;

    #holdPosX = 0;
    #holdPosY = 0;

    constructor(name, width, height, posX, posY, speed) 
    {
        try
        {
            this.#name = name;
            this.#width = width;
            this.#height = height;
            this.#posX = posX;
            this.#posY = posY;
            this.#speed = speed;
            this.#state = 0;

            this.#halfWidth = width * 0.5;
            this.#halfHeight = height * 0.5;
        } 
        catch (e) 
        {
            console.error("GameObject constructor error:", e);
        }
    }

    // ---- Getters ----
    get name() { return this.#name; }
    get width() { return this.#width; }
    get height() { return this.#height; }
    get posX() { return this.#posX; }
    get posY() { return this.#posY; }
    get speed() { return this.#speed; }

    get state() { return this.#state; }
    get alive() { return this.#alive; }

    get halfWidth() { return this.#halfWidth; }
    get halfHeight() { return this.#halfHeight; }

    get holdPosX() { return this.#holdPosX; }
    get holdPosY() { return this.#holdPosY; }

    // ---- Setters ----
    set name(v) { this.#name = v; }
    set width(v) { this.#width = v; }
    set height(v) { this.#height = v; }
    set posX(v) { this.#posX = v; }
    set posY(v) { this.#posY = v; }
    set speed(v) { this.#speed = v; }

    set state(v) { this.#state = v; }
    set alive(v) { this.#alive = Boolean(v); }

    set holdPosX(v) { this.#holdPosX = v; }
    set holdPosY(v) { this.#holdPosY = v; }

    kill() { this.#alive = false; }

    // ---- Core Methods ----
    // Placeholder update (to be overridden by child classes if needed)
    update(device, delta) {}

    // Move object down based on its speed
    moveDown(delta) 
    {
        try
         {
            this.#posY += this.#speed * delta;
        } 
        catch (e) 
        {
            console.error(`moveDown error for ${this.#name}:`, e);
        }
    }

    movePos(newX, newY) 
    {
        try 
        {
            this.#posX = newX;
            this.#posY = newY;
        } 
        catch (e) 
        {
            console.error(`movePos error for ${this.#name}:`, e);
        }
    }

    // Save player position so it can be restored on resume
    savePos(x, y)
    {
         this.#holdPosX = x;             
         this.#holdPosY = y;             
    }

    restoreSavedPos()
    {
         this.#posX =  this.#holdPosX; 
         this.#posY =  this.#holdPosY ;
    }

    // Return an axis-aligned hitbox for this object.
    // scale lets you make the box a bit smaller (e.g., 0.9 for friendlier hits).
    // buffer shrinks it further by pixels on each side.
    // Both are clamped so they can’t go negative.
    getHitbox(scale = 1.0, buffer = 0) 
    {
        try 
        {
            const hw = Math.max(0, this.#halfWidth * scale - buffer);
            const hh = Math.max(0, this.#halfHeight * scale - buffer);
            return {
                left: this.#posX - hw,
                right: this.#posX + hw,
                top: this.#posY - hh,
                bottom: this.#posY + hh
            };
        } 
        catch (e) 
        {
            console.error(`getHitbox error for ${this.#name}:`, e);
            return { left: 0, right: 0, top: 0, bottom: 0 };
        }
    }

    getRoughRadius() 
    {
        return Math.max(this.#halfWidth, this.#halfHeight);
    }
}

// --------------------------------------------
// Projectile
// --------------------------------------------
// Fired by the player (or NPCs in the future)
// - Moves upward each frame
// - Becomes inactive if offscreen
// --------------------------------------------
class Projectile extends GameObject 
{
    constructor(name, width, height, posX, posY, speed) {
        super(name, width, height, posX, posY, speed);
    }

    update(device, game, delta) 
    {
        try 
        {
            this.posY -= this.speed * delta;
            if (this.posY + this.halfHeight < 0) this.kill();
        } 
        catch (e) 
        {
            console.error("Projectile update error:", e);
        }
    }
}

// --------------------------------------------
// NPC (Enemy/Obstacle)
// --------------------------------------------
// Moves downward from top of screen
// Dies if it leaves the play area
// --------------------------------------------
class NPC extends GameObject 
{
    constructor(name, width, height, x, y, speed) 
    {
        super(name, width, height, x, y, speed);
    }

    update(device, game, delta) 
    {
        try 
        {
            const hud_buff = game.gameConsts.HUD_BUFFER ? game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT : 0;
            this.moveDown(game, delta);
            if (this.posY > (game.gameConsts.SCREEN_HEIGHT ?? Infinity) + hud_buff) this.kill();
        } 
        catch (e) 
        {
            console.error("NPC update error:", e);
        }
    }

    moveDown(game, delta) 
    {
        try 
        {
            if (game.npcSpeedMuliplyer > 0)
            {
                this.posY += (this.speed * game.npcSpeedMuliplyer)  * delta;
            }
            else
            {
                this.posY += this.speed  * delta;
            }
            
        } 
        catch (e) 
        {
            console.error(`moveDown error for ${this.name}:`, e);
        }
    }

}

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
    constructor(width, height, x, y, speed) 
    {
        super(GameDefs.spriteTypes.PLAYER, width, height, x, y, speed);
    }

    // Attempt to fire a projectile
    // - Checks play state, ammo, input, and cooldown
    tryShoot(device, game) 
    {
        try 
        {
            if (game.playState !== GameDefs.playStates.SHOOT) return false;
            const shootTimer = game.gameTimers.getObjectByName(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER);
            if (shootTimer.active) return false;
            if (game.ammo <= 0) 
            {
                game.playState = GameDefs.playStates.AVOID;
                return false;
            }

            const firePressed = device.mouseDown || device.keys.isKeyPressed(GameDefs.keyTypes.PLAY_KEY);
            if (!firePressed) return false;

            const bulletDef = GameDefs.spriteTypes.BULLET ?? {};
            const bullet = new Projectile(
                bulletDef.name ||GameDefs.spriteTypes.BULLET.type,
                bulletDef.w || GameDefs.spriteTypes.BULLET.w,
                bulletDef.h || GameDefs.spriteTypes.BULLET.h,
                this.posX,
                this.posY - this.halfHeight - (bulletDef.spawnGap || 0) - ((bulletDef.h || GameDefs.spriteTypes.BULLET.h) * 0.5),
                bulletDef.speed || GameDefs.spriteTypes.BULLET.speed
            );

            game.projectiles.addObject(bullet);
            game.decreaseAmmo(1);
            shootTimer.reset(game.gameConsts.SHOOT_COOLDOWN ?? 0, GameDefs.timerModes.COUNTDOWN, false);

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
    update(device, game, delta) 
    {
        try 
        {
            // If dead, freeze state until game handles respawn/lose
            if (game.playState === GameDefs.playStates.DEATH) 
            {
                this.state = GameDefs.playStates.DEATH;
                return;
            }

            // Update cooldowns
            const shootTimer = game.gameTimers.getObjectByName(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER);
            if (shootTimer.update) shootTimer.update(delta);

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
                    if (game.ammo > 0) game.playState = GameDefs.playStates.SHOOT;
                    else game.playState = GameDefs.playStates.AVOID;
                }
            }

            // Sync player state with current playState
            if (this.state !== game.playState) 
            {
                this.state = game.playState;
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
}

// --------------------------------------------
// BillBoard
// --------------------------------------------
// Static or decorative background object
// Currently does nothing, but could support parallax or animation
// --------------------------------------------
class BillBoard extends GameObject 
{
    constructor(name, width, height, x, y) 
    {
        super(name, width, height, x, y, 0);
    }

    centerObjectInWorld(screenW, screenH) 
    {
        try 
        {
            this.posX = (screenW - this.width) * 0.5;
            this.posY = (screenH - this.height) * 0.5;
        } 
        catch (e) 
        {
            console.error("BillBoard centerObjectInWorld error:", e);
        }
    }
    update(device, delta) 
    {
        // Optional: BillBoard scrolling/animation
    }
}

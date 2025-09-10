// --------------------------------------------
// Base GameObject + Child Classes (Player, Projectile, NPC, BackDrop)
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
        this.#name = name;
        this.#width = width;
        this.#height = height;
        this.#posX = posX;
        this.#posY = posY;
        this.#speed = speed;
        this.#state = 0;

        // cache half-sizes once
        this.#halfWidth = width * 0.5;
        this.#halfHeight = height * 0.5;
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
        this.#posY += this.#speed * delta;
    }

    // Teleport object to new position
    movePos(newX, newY) 
    {
        this.#posX = newX;
        this.#posY = newY;
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
        const hw = Math.max(0, this.#halfWidth  * scale - buffer);
        const hh = Math.max(0, this.#halfHeight * scale - buffer);
        return {
            left:   this.#posX - hw,
            right:  this.#posX + hw,
            top:    this.#posY - hh,
            bottom: this.#posY + hh
        };
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
    constructor(name, width, height, posX, posY, speed) 
    {
        super(name, width, height, posX, posY, speed);
    }

    // Update position each frame
    // - Moves upward
    // - Marks dead if it leaves screen
    update(device, game, delta) 
    {
        this.posY -= this.speed * delta;
        if (this.posY + this.halfHeight < 0) this.kill();
        // NOTE: collision detection is handled outside for now
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

    // Update NPC each frame
    // - Moves down
    // - Marks dead if it exits screen bottom
    update(device, game, delta) 
    {
        const hud_buff = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT
        this.moveDown(delta);
        if (this.posY > game.gameConsts.SCREEN_HEIGHT + hud_buff) this.kill();
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
        //const shootCooldownTimer = game.gameTimers.getObjectByName(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER).active;
        if (game.playState !== GameDefs.playStates.SHOOT) return false;
        if ( game.gameTimers.getObjectByName(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER).active) return false;

        // Optional: add player ammo system
        if (game.ammo <= 0)
        {
            game.playState = GameDefs.playStates.AVOID;
            return false;
        }

        // Fire if mouse is down OR shoot key pressed
        const firePressed = device.mouseDown || device.keys.isKeyPressed(GameDefs.keyTypes.PLAY_KEY);
        if (!firePressed) return false;
        
        // Spawn projectile
        const bullet = new Projectile(
            GameDefs.spriteTypes.BULLET.name,
            GameDefs.spriteTypes.BULLET.w,
            GameDefs.spriteTypes.BULLET.h,
            this.posX,
            this.posY - this.halfHeight - (GameDefs.spriteTypes.BULLET.spawnGap || 0) - ( GameDefs.spriteTypes.BULLET.h * 0.5),
            GameDefs.spriteTypes.BULLET.speed
        );

        game.projectiles.addObject(bullet);

        // Consume ammo + trigger cooldown
        game.decreaseAmmo(1);
        game.gameTimers.getObjectByName(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER).reset(game.gameConsts.SHOOT_COOLDOWN, GameDefs.timerModes.COUNTDOWN, false);

        // Play sound effect
        device.audio.playSound(GameDefs.soundTypes.SHOOT.name);
        return true;
    }

    // Update player each frame
    // - Updates cooldown
    // - Enforces screen bounds
    // - Handles shooting
    update(device, game, delta) 
    {
        game.gameTimers.getObjectByName(GameDefs.timerTypes.SHOOT_COOL_DOWN_TIMER).update(delta);
        this.enforceBounds(game);
        this.tryShoot(device, game);
    }

    // Prevents player from leaving visible play area
    enforceBounds(game) 
    {
       // const canvas = device.canvas;
        const hudBuffer = game.gameConsts.SCREEN_HEIGHT * game.gameConsts.HUD_BUFFER;

        if (this.posX - this.halfWidth < 0) this.posX = this.halfWidth;
        if (this.posX + this.halfWidth > game.gameConsts.SCREEN_WIDTH) this.posX = game.gameConsts.SCREEN_WIDTH - this.halfWidth;
        if (this.posY - this.halfHeight < 0) this.posY = this.halfHeight;
        if (this.posY + this.halfHeight > game.gameConsts.SCREEN_HEIGHT - hudBuffer) 
        {
            this.posY = (game.gameConsts.SCREEN_HEIGHT - hudBuffer) - this.halfHeight;
        }
    }
}

// --------------------------------------------
// BillBoard
// --------------------------------------------
// Static or decorative background object
// Currently does nothing, but could support parallax or animation
// --------------------------------------------
//FIX name bullshit
class BillBoard extends GameObject 
{
    constructor(name, width, height, x, y) 
    {
        super(name, width, height, x, y, 0);
    }

    centerObjectInWorld( screenW, screenH) 
    {
        this.posX = (screenW - this.width) * .5
        this.posY = (screenH - this.height) * .5;
    }

    update(device, delta) 
    {
        // Optional: BillBoard scrolling/animation
    }
}

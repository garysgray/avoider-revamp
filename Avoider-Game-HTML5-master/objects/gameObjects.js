// --------------------------------------------
// Base GameObject + Child Classes (Player, BackDrop)
// --------------------------------------------
// GameObject is the base class for all in-game entities
// - Tracks position, size, speed, and state
// - Provides movement and collision functions
//
// Player extends GameObject
// - Adds shooting mechanics (timer + delay)
// - Enforces screen boundaries
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
    #spaceBuffer;   // Collision margin
    #state;

    constructor(name, width, height, posX, posY, speed) 
    {
        this.#name = name;
        this.#width = width;
        this.#height = height;
        this.#posX = posX;
        this.#posY = posY;
        this.#speed = speed;

        this.#spaceBuffer = 12; // TODO: remove or parameterize later
        this.#state = 0;
    }

    // ---- Getters ----
    get name() { return this.#name; }
    get width() { return this.#width; }
    get height() { return this.#height; }
    get posX() { return this.#posX; }
    get posY() { return this.#posY; }
    get speed() { return this.#speed; }
    get spaceBuffer() { return this.#spaceBuffer; }
    get state() { return this.#state; }

    // ---- Setters ----
    set name(v) { this.#name = v; }
    set width(v) { this.#width = v; }
    set height(v) { this.#height = v; }
    set posX(v) { this.#posX = v; }
    set posY(v) { this.#posY = v; }
    set speed(v) { this.#speed = v; }
    set spaceBuffer(v) { this.#spaceBuffer = v; }
    set state(v) { this.#state = v; }

    // Placeholder update (to be overridden by child classes if needed)
    update(device, delta) {}

    // Move object down at its speed
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

    // Axis-Aligned Bounding Box (AABB) collision check
    checkObjCollision(otherX, otherY, otherWidth, otherHeight) 
    {
        return (
            this.#posX + this.#width * 0.5 - this.#spaceBuffer > otherX - otherWidth * 0.5 &&
            this.#posX - this.#width * 0.5 - this.#spaceBuffer < otherX + otherWidth * 0.5 &&
            this.#posY + this.#height * 0.5 - this.#spaceBuffer > otherY - otherHeight * 0.5 &&
            this.#posY - this.#height * 0.5 - this.#spaceBuffer < otherY + otherHeight * 0.5
        );
    }
}

// --------------------------------------------
// Player
// --------------------------------------------
// Adds shooting cooldown system + screen boundary enforcement
// Inherits base movement + collision functions
// --------------------------------------------
class Player extends GameObject 
{

    #shootCooldownTimer; // Timer measured in seconds

    constructor(width, height, x, y, speed) 
    {
        super(spriteTypes.PLAYER, width, height, x, y, speed);


        this.#shootCooldownTimer = new Timer(0);

    }

    // ---- Getters/Setters ----
    get shootCooldownTimer() { return this.#shootCooldownTimer; }


    tryShoot(device, game)
    {
        if (game.playState !== playStates.SHOOT) return false;
        

        if (this.#shootCooldownTimer.active) return false;
        

            //FIX should player have ammo??
        if (game.ammo <= 0)
        {
            game.playState = playStates.AVOID;
            return false;
        }

        // INPUT: mouse donwn or space pressed this frame
        const firePressed = device.mouseDown  || device.keys.isKeyPressed(game.gameConsts.PLAY_KEY)

        if (!firePressed) return false;
        
        const bullet = new GameObject(
            spriteTypes.BULLET,
            game.gameConsts.BULLET_SPRITE_W,
            game.gameConsts.BULLET_SPRITE_H,
            this.posX,
            this.posY,
            game.gameConsts.BULLET_SPEED
        );

        //FIX do this in bullet?
        // Center adjustment
        bullet.posX -= bullet.width * 0.5;
        bullet.posY += bullet.height * 0.5;

        game.projectiles.addObject(bullet);

        // consume ammo & start coldown
        game.decreaseAmmo(1);
        this.#shootCooldownTimer.reset(game.gameConsts.SHOOT_COOLDOWN);

        // Play sound effect
        device.audio.playSound(soundTypes.SHOOT);
        return true;
    }

    // Placeholder update for movement/shooting logic
    update(device, delta, game) 
    {
        // Update cooldown timer
        this.#shootCooldownTimer.update(delta);
        this.enforceBounds(device);

        // Handle movement/animation here if needed...
        this.tryShoot(device, game);
        
    }

    // Prevents player from leaving screen bounds
    enforceBounds(device) 
    {
        const canvas = device.canvas;
        const halfW = this.width * 0.5;
        const halfH = this.height * 0.5;
        const hudBuffer = 50; // Reserved space at bottom (HUD zone)

        if (this.posX - halfW < 0) this.posX = halfW;
        if (this.posX + halfW > canvas.width) this.posX = canvas.width - halfW;
        if (this.posY - halfH < 0) this.posY = halfH;
        if (this.posY + halfH > canvas.height - hudBuffer) 
        {
            this.posY = (canvas.height - hudBuffer) - halfH;
        }
    }
}

// --------------------------------------------
// BackDrop
// --------------------------------------------
// Decorative or background objects
// Inherits positioning but speed is always 0
// Could later support parallax scrolling or animation
// --------------------------------------------
class BackDrop extends GameObject 
{
    constructor(width, height, x, y) 
    {
        super("BackDrop", width, height, x, y, 0);
    }

    update(device, delta) 
    {
        // Optional: background movement/scrolling
    }
}

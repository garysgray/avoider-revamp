// ============================================================================
// GameObject.js
// Base class for all game entities — position, size, hitbox, and lifecycle.
// ============================================================================

// ---- GameObject Constants ---------------------------------------------------

const GAMEOBJECT_CONSTS = Object.freeze(
{
    CENTER       : 0.5,    // multiplier for calculating half dimensions
    MIN_HITBOX   : 0,      // minimum hitbox dimension — prevents negative values
    DEFAULT_SCALE: 1.0,    // default hitbox scale — no shrink
    DEFAULT_BUFF : 0,      // default hitbox buffer — no pixel shrink
});


// ---- GameObject -------------------------------------------------------------
// Base class for all game entities.
// Tracks position, size, speed, alive state, and provides hitbox helpers.

class GameObject
{
    #name;
    #width;
    #height;
    #posX;
    #posY;
    #speed;
    #alive      = true;
    #halfWidth;
    #halfHeight;
    #holdPosX   = 0;
    #holdPosY   = 0;

    constructor(name, width, height, posX, posY, speed)
    {
        this.#name       = name;
        this.#width      = width;
        this.#height     = height;
        this.#posX       = posX;
        this.#posY       = posY;
        this.#speed      = speed;
        this.#halfWidth  = width  * GAMEOBJECT_CONSTS.CENTER;
        this.#halfHeight = height * GAMEOBJECT_CONSTS.CENTER;
    }

    // ---- Getters ------------------------------------------------------------

    get name()       { return this.#name; }
    get width()      { return this.#width; }
    get height()     { return this.#height; }
    get posX()       { return this.#posX; }
    get posY()       { return this.#posY; }
    get speed()      { return this.#speed; }
    get alive()      { return this.#alive; }
    get halfWidth()  { return this.#halfWidth; }
    get halfHeight() { return this.#halfHeight; }
    get holdPosX()   { return this.#holdPosX; }
    get holdPosY()   { return this.#holdPosY; }

    // ---- Setters ------------------------------------------------------------

    set name(v)      { this.#name     = v; }
    set width(v)     { this.#width    = v; }
    set height(v)    { this.#height   = v; }
    set posX(v)      { this.#posX     = v; }
    set posY(v)      { this.#posY     = v; }
    set speed(v)     { this.#speed    = v; }
    set alive(v)     { this.#alive    = Boolean(v); }
    set holdPosX(v)  { this.#holdPosX = v; }
    set holdPosY(v)  { this.#holdPosY = v; }

    // ---- Lifecycle ----------------------------------------------------------

    // Marks the object as dead — will be removed on next cleanup pass
    kill() { this.#alive = false; }

    // Override in subclasses to implement per-frame behaviour
    update(device, delta) {}

    // ---- Position -----------------------------------------------------------

    // Sets position directly
    movePos(x, y)
    {
        this.#posX = x;
        this.#posY = y;
    }

    // Saves current position for later restoration
    savePos(x, y)
    {
        this.#holdPosX = x;
        this.#holdPosY = y;
    }

    // Restores previously saved position
    restoreSavedPos()
    {
        this.#posX = this.#holdPosX;
        this.#posY = this.#holdPosY;
    }

    // ---- Collision ----------------------------------------------------------

    // Returns an AABB hitbox centered on posX/posY.
    // scale shrinks proportionally (e.g. 0.8 = 80% size).
    // buffer shrinks by a flat pixel amount on each side.
    getHitbox(scale = GAMEOBJECT_CONSTS.DEFAULT_SCALE, buffer = GAMEOBJECT_CONSTS.DEFAULT_BUFF)
    {
        const hw = Math.max(GAMEOBJECT_CONSTS.MIN_HITBOX, this.#halfWidth  * scale - buffer);
        const hh = Math.max(GAMEOBJECT_CONSTS.MIN_HITBOX, this.#halfHeight * scale - buffer);
        return {
            left   : this.#posX - hw,
            right  : this.#posX + hw,
            top    : this.#posY - hh,
            bottom : this.#posY + hh
        };
    }

    // Returns the larger of halfWidth/halfHeight — used for broad-phase collision check
    getRoughRadius()
    {
        return Math.max(this.#halfWidth, this.#halfHeight);
    }
}
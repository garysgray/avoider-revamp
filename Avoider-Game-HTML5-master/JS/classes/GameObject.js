// ============================================================================
// gameObjects.js
// Base GameObject and all child classes: Projectile, NPC, BillBoard, ParallaxBillBoard
// ============================================================================


// ---- GameObject (Base) ------------------------------------------------------

class GameObject
{
    #name;
    #width;
    #height;
    #posX;
    #posY;
    #speed;
    #alive    = true;
    #halfWidth;
    #halfHeight;
    #holdPosX = 0;
    #holdPosY = 0;

    constructor(name, width, height, posX, posY, speed)
    {
        this.#name       = name;
        this.#width      = width;
        this.#height     = height;
        this.#posX       = posX;
        this.#posY       = posY;
        this.#speed      = speed;
        this.#halfWidth  = width  * 0.5;
        this.#halfHeight = height * 0.5;
    }

    // ---- Getters ----
    get name()      { return this.#name; }
    get width()     { return this.#width; }
    get height()    { return this.#height; }
    get posX()      { return this.#posX; }
    get posY()      { return this.#posY; }
    get speed()     { return this.#speed; }
    get alive()     { return this.#alive; }
    get halfWidth() { return this.#halfWidth; }
    get halfHeight(){ return this.#halfHeight; }
    get holdPosX()  { return this.#holdPosX; }
    get holdPosY()  { return this.#holdPosY; }

    // ---- Setters ----
    set name(v)     { this.#name  = v; }
    set width(v)    { this.#width = v; }
    set height(v)   { this.#height = v; }
    set posX(v)     { this.#posX  = v; }
    set posY(v)     { this.#posY  = v; }
    set speed(v)    { this.#speed = v; }
    set alive(v)    { this.#alive = Boolean(v); }
    set holdPosX(v) { this.#holdPosX = v; }
    set holdPosY(v) { this.#holdPosY = v; }

    kill() { this.#alive = false; }

    // ---- Methods ----
    update(device, delta) {}

    movePos(x, y)
    {
        this.#posX = x;
        this.#posY = y;
    }

    savePos(x, y)
    {
        this.#holdPosX = x;
        this.#holdPosY = y;
    }

    restoreSavedPos()
    {
        this.#posX = this.#holdPosX;
        this.#posY = this.#holdPosY;
    }

    // Returns an AABB hitbox. scale shrinks proportionally; buffer shrinks by pixels.
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

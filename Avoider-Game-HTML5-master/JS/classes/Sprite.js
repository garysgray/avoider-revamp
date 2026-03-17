// ============================================================================
// Sprite.js
// Wraps an HTML Image element with load state tracking and position.
// Used by Device.images to store and retrieve game assets.
// ============================================================================

class Sprite
{
    #name;
    #image;
    #loaded = false;
    #posX   = 0;
    #posY   = 0;

    // src    — image path
    // name   — lookup key used by ObjHolder
    // width/height — optional override dimensions
    constructor(src, name, x = 0, y = 0, width = null, height = null)
    {
        this.#name = name;
        this.#posX = x;
        this.#posY = y;

        try
        {
            if (!src) throw new Error("Sprite source missing");

            this.#image     = new Image();
            this.#image.src = src;

            if (width)  this.#image.width  = width;
            if (height) this.#image.height = height;

            // Flips loaded flag once the browser finishes decoding the image
            this.#image.onload = () => this.#loaded = true;
        }
        catch (err) { console.warn("Sprite init failed:", err.message); }
    }

    get name()   { return this.#name; }
    get image()  { return this.#image; }
    get width()  { return this.#image.width; }
    get height() { return this.#image.height; }
    get loaded() { return this.#loaded; }
    get posX()   { return this.#posX; }
    get posY()   { return this.#posY; }
    set posX(v)  { this.#posX = v; }
    set posY(v)  { this.#posY = v; }
}
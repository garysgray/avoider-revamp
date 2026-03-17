// ============================================================================
// Device.js
// Central access point for canvas, rendering, input, images, and audio.
// Passed throughout the game as the main hardware/platform interface.
// ============================================================================

// ---- Device Constants -------------------------------------------------------

const DEVICE_CONSTS = Object.freeze(
{
    MOUSE_STEP       : 80,       // max pixels the player can move per mouse event
    CENTER           : 0.5,      // reusable multiplier for centering
    DEBUG_FONT       : "24px Arial Black",
    DEBUG_COLOR      : "white",
    IMAGE_RENDERING  : "pixelated",
});


// ---- Device -----------------------------------------------------------------

class Device
{
    #canvas;
    #ctx;
    #mouseDown    = false;
    #images;
    #audio;
    #keys;
    #onMouseDown  = null;
    #onMouseUp    = null;
    #onMouseMove  = null;

    constructor(width, height, canvasEl = null)
    {
        this.#canvas                      = canvasEl || document.getElementById("canvas");
        this.#ctx                         = this.#canvas.getContext("2d");
        this.#canvas.width                = width;
        this.#canvas.height               = height;
        this.#canvas.style.width          = width  + "px";
        this.#canvas.style.height         = height + "px";
        this.#canvas.style.imageRendering = DEVICE_CONSTS.IMAGE_RENDERING;
        this.#ctx.imageSmoothingEnabled   = false;
        this.#images                      = new ObjHolder();
        this.#audio                       = new AudioPlayer();
        this.#keys                        = new KeyButtonManager();
    }

    get canvas()     { return this.#canvas; }
    get ctx()        { return this.#ctx; }
    get mouseDown()  { return this.#mouseDown; }
    get images()     { return this.#images; }
    get audio()      { return this.#audio; }
    get keys()       { return this.#keys; }

    set mouseDown(v) { this.#mouseDown = v; }

    // Binds mouse events to track clicks and move the given sprite toward the cursor.
    // Movement is capped at MOUSE_STEP per event to prevent teleporting.
    setupMouse(sprite)
    {
        if (!sprite) return;

        this.#onMouseDown = () => this.#mouseDown = true;
        this.#onMouseUp   = () => this.#mouseDown = false;
        this.#onMouseMove = e =>
        {
            const rect = this.#canvas.getBoundingClientRect();
            const tx   = e.clientX - rect.left;
            const ty   = e.clientY - rect.top;
            const dx   = tx - sprite.posX;
            const dy   = ty - sprite.posY;
            const dist = Math.hypot(dx, dy);

            if (dist > DEVICE_CONSTS.MOUSE_STEP)
            {
                sprite.posX += (dx / dist) * DEVICE_CONSTS.MOUSE_STEP;
                sprite.posY += (dy / dist) * DEVICE_CONSTS.MOUSE_STEP;
            }
            else
            {
                sprite.posX = tx;
                sprite.posY = ty;
            }
        };

        window.addEventListener("mousedown", this.#onMouseDown);
        window.addEventListener("mouseup",   this.#onMouseUp);
        window.addEventListener("mousemove", this.#onMouseMove);
    }

    // Removes all mouse event listeners and clears handler references
    teardownMouse()
    {
        if (this.#onMouseDown) window.removeEventListener("mousedown", this.#onMouseDown);
        if (this.#onMouseUp)   window.removeEventListener("mouseup",   this.#onMouseUp);
        if (this.#onMouseMove) window.removeEventListener("mousemove", this.#onMouseMove);
        this.#onMouseDown = null;
        this.#onMouseUp   = null;
        this.#onMouseMove = null;
    }

    // Draws an image at (x, y) — optionally stretched to (w, h)
    renderImage(img, x, y, w, h)
    {
        if (!img) return;
        const i = img.image ?? img;
        w !== undefined
            ? this.#ctx.drawImage(i, Math.round(x), Math.round(y), w, h)
            : this.#ctx.drawImage(i, Math.round(x), Math.round(y));
    }

    // Draws a sprite sheet frame — clips by state index, centered on (x, y)
    renderClip(clip, x, y, w, h, state = 0)
    {
        this.#ctx.drawImage(
            clip,
            state * w, 0, w, h,
            Math.round(x - w * DEVICE_CONSTS.CENTER),
            Math.round(y - h * DEVICE_CONSTS.CENTER),
            w, h
        );
    }

    // Draws an image centered on (x, y)
    centerImage(img, x, y)
    {
        const i = img.image ?? img;
        if (i) this.#ctx.drawImage(
            i,
            Math.round(x - i.width  * DEVICE_CONSTS.CENTER),
            Math.round(y - i.height * DEVICE_CONSTS.CENTER)
        );
    }

    putText(str, x, y)  { this.#ctx.fillText(str, x, y); }
    colorText(color)    { this.#ctx.fillStyle = color.toString(); }
    setFont(font)       { this.#ctx.font = font.toString(); }

    // Horizontally centers text on the canvas at the given y position
    centerTextOnY(text, y)
    {
        const x = (this.#canvas.width - this.#ctx.measureText(text).width) * DEVICE_CONSTS.CENTER;
        this.#ctx.fillText(text, x, y);
    }

    // Renders debug text — fixed font and color, useful for overlays
    debugText(text, x, y, color = DEVICE_CONSTS.DEBUG_COLOR)
    {
        this.setFont(DEVICE_CONSTS.DEBUG_FONT);
        this.colorText(color);
        this.putText(text.toString(), x, y);
    }

    // Loads images from a type definition object and registers them in the image holder
    setImagesForType(typeDefs, callback)
    {
        Object.values(typeDefs).forEach(def =>
        {
            if (!def.path) return;
            const sprite = new Sprite(def.path, def.name);
            this.#images.addObject(sprite);
            if (typeof callback === "function") callback(def, sprite);
        });
    }
}
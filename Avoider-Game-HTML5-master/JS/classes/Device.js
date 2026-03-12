class Device
{
    #canvas;
    #ctx;
    #mouseDown = null;
    #images;
    #audio;
    #keys;

    #onMouseDown = null;
    #onMouseUp = null;
    #onMouseMove = null;

    constructor(width, height, canvasEl = null)
    {
        this.#canvas = canvasEl || document.getElementById("canvas") || {
            width, height,
            getContext: () => ({
                drawImage:   () => {}, fillText:    () => {},
                measureText: () => ({ width: 0 }), save: () => {},
                restore:     () => {}, strokeRect:  () => {},
                fillRect:    () => {}
            })
        };

        this.#ctx            = this.#canvas.getContext("2d") || {};
        this.#canvas.width   = width;
        this.#canvas.height  = height;
        this.#images         = typeof ObjHolder    !== "undefined" ? new ObjHolder()    : { addObject: () => {} };
        this.#audio          = typeof AudioPlayer  !== "undefined" ? new AudioPlayer()  : { addSound:  () => {} };
        this.#keys           = typeof KeyButtonManager   !== "undefined" ? new KeyButtonManager()   : { clearFrameKeys: () => {} };
    }

    // ---- Getters / Setters ----
    get canvas()    { return this.#canvas; }
    get ctx()       { return this.#ctx; }
    get mouseDown() { return this.#mouseDown; }
    get images()    { return this.#images; }
    get audio()     { return this.#audio; }
    get keys()      { return this.#keys; }

    get onMouseDown() { return this.#onMouseDown; }
    get onMouseUp() { return this.#onMouseUp; }
    get onMouseMove() { return this.#onMouseMove; }

    set mouseDown(v){ this.#mouseDown = v; }

    set onMouseDown(v){ this.#onMouseDown = v; }
    set onMouseUp(v){ this.#onMouseUp = v; }
    set onMouseMove(v){ this.#onMouseMove = v; }

    // ---- Mouse ----
    
    setupMouse(sprite)
    {
        if (!sprite || !this.#canvas) return;
        this.#onMouseDown = () => this.#mouseDown = true;
        this.#onMouseUp   = () => this.#mouseDown = false;
        this.#onMouseMove = e =>
        {
            const rect  = this.#canvas.getBoundingClientRect();
            sprite.posX = e.clientX - rect.left;
            sprite.posY = e.clientY - rect.top;
        };
        window.addEventListener("mousedown", this.#onMouseDown);
        window.addEventListener("mouseup",   this.#onMouseUp);
        window.addEventListener("mousemove", this.#onMouseMove);
    }

    teardownMouse()
    {
        if (this.#onMouseDown) window.removeEventListener("mousedown", this.#onMouseDown);
        if (this.#onMouseUp)   window.removeEventListener("mouseup",   this.#onMouseUp);
        if (this.#onMouseMove) window.removeEventListener("mousemove", this.#onMouseMove);
    }
    // ---- Rendering ----
    renderImage(imgOrSprite, x = 0, y = 0, w, h)
    {
        try
        {
            if (!imgOrSprite) return;
            const img = imgOrSprite.image ?? imgOrSprite;
            (typeof w === "number" && typeof h === "number")
                ? this.#ctx.drawImage(img, x, y, w, h)
                : this.#ctx.drawImage(img, x, y);
        }
        catch (err) { console.warn("renderImage failed:", err.message); }
    }

    renderClip(clip, x, y, w, h, state = 0)
    {
        try
        {
            this.#ctx.drawImage(clip, state * w, 0, w, h, x - w * 0.5, y - h * 0.5, w, h);
        }
        catch (err) { console.warn("renderClip failed:", err.message); }
    }

    centerImage(image, x, y)
    {
        try
        {
            const img = image.image ?? image;
            if (img) this.#ctx.drawImage(img, x - img.width * 0.5, y - img.height * 0.5);
        }
        catch (err) { console.warn("centerImage failed:", err.message); }
    }

    // ---- Text ----
    putText(str, x, y)         { try { this.#ctx.fillText(str, x, y); }          catch {} }
    colorText(color)           { try { this.#ctx.fillStyle = color.toString(); } catch {} }
    setFont(font)              { try { this.#ctx.font = font.toString(); }       catch {} }

    centerTextOnY(text, posY)
    {
        try
        {
            const x = (this.#canvas.width - this.#ctx.measureText(text).width) * 0.5;
            this.#ctx.fillText(text, x, posY);
        }
        catch {}
    }

    debugText(text, x, y, color = "white")
    {
        try
        {
            this.setFont("24px Arial Black");
            this.colorText(color);
            this.putText(text.toString(), x, y);
        }
        catch {}
    }
    // ------------------------------------------------------------------------
    // Asset loading
    // ------------------------------------------------------------------------
    setImagesForType(typeDefs, callback) 
    {
        Object.values(typeDefs).forEach(def => 
        {
            if (!def.path) return;

            const sprite = new Sprite(def.path, def.name);
            this.#images.addObject(sprite);

            if (typeof callback === "function") 
            {
                callback(def, sprite);
            }
        });
    }
}

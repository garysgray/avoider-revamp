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
        this.#canvas                    = canvasEl || document.getElementById("canvas");
        this.#ctx                       = this.#canvas.getContext("2d");
        this.#canvas.width              = width;
        this.#canvas.height             = height;
        this.#canvas.style.width        = width  + "px";
        this.#canvas.style.height       = height + "px";
        this.#canvas.style.imageRendering = "pixelated";
        this.#ctx.imageSmoothingEnabled = false;
        this.#images                    = new ObjHolder();
        this.#audio                     = new AudioPlayer();
        this.#keys                      = new KeyButtonManager();
    }

    get canvas()    { return this.#canvas; }
    get ctx()       { return this.#ctx; }
    get mouseDown() { return this.#mouseDown; }
    get images()    { return this.#images; }
    get audio()     { return this.#audio; }
    get keys()      { return this.#keys; }

    set mouseDown(v) { this.#mouseDown = v; }

    setupMouse(sprite)
    {
        if (!sprite) return;
        this.#onMouseDown = () => this.#mouseDown = true;
        this.#onMouseUp   = () => this.#mouseDown = false;
        this.#onMouseMove = e =>
        {
            const rect  = this.#canvas.getBoundingClientRect();
            const tx    = e.clientX - rect.left;
            const ty    = e.clientY - rect.top;
            const dx    = tx - sprite.posX;
            const dy    = ty - sprite.posY;
            const dist  = Math.hypot(dx, dy);
            const step  = 80;
            if (dist > step)
            {
                sprite.posX += (dx / dist) * step;
                sprite.posY += (dy / dist) * step;
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

    teardownMouse()
    {
        if (this.#onMouseDown) window.removeEventListener("mousedown", this.#onMouseDown);
        if (this.#onMouseUp)   window.removeEventListener("mouseup",   this.#onMouseUp);
        if (this.#onMouseMove) window.removeEventListener("mousemove", this.#onMouseMove);
        this.#onMouseDown = null;
        this.#onMouseUp   = null;
        this.#onMouseMove = null;
    }

    renderImage(img, x, y, w, h)
    {
        if (!img) return;
        const i = img.image ?? img;
        w !== undefined
            ? this.#ctx.drawImage(i, Math.round(x), Math.round(y), w, h)
            : this.#ctx.drawImage(i, Math.round(x), Math.round(y));
    }

    renderClip(clip, x, y, w, h, state = 0)
    {
        this.#ctx.drawImage(clip, state * w, 0, w, h, Math.round(x - w * 0.5), Math.round(y - h * 0.5), w, h);
    }

    centerImage(img, x, y)
    {
        const i = img.image ?? img;
        if (i) this.#ctx.drawImage(i, Math.round(x - i.width * 0.5), Math.round(y - i.height * 0.5));
    }

    putText(str, x, y)       { this.#ctx.fillText(str, x, y); }
    colorText(color)         { this.#ctx.fillStyle = color.toString(); }
    setFont(font)            { this.#ctx.font = font.toString(); }

    centerTextOnY(text, y)
    {
        const x = (this.#canvas.width - this.#ctx.measureText(text).width) * 0.5;
        this.#ctx.fillText(text, x, y);
    }

    debugText(text, x, y, color = "white")
    {
        this.setFont("24px Arial Black");
        this.colorText(color);
        this.putText(text.toString(), x, y);
    }

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
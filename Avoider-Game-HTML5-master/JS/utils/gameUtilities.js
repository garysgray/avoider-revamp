// ============================================================================
// gameUtilities.js
// Device, ObjHolder, KeyManager, Sound, AudioPlayer, Sprite, Timer, drawHitbox
// ============================================================================


// ---- Device -----------------------------------------------------------------

class Device
{
    #canvas;
    #ctx;
    #mouseDown = false;
    #images;
    #audio;
    #keys;

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
        this.#keys           = typeof KeyManager   !== "undefined" ? new KeyManager()   : { clearFrameKeys: () => {} };
    }

    // ---- Getters / Setters ----
    get canvas()    { return this.#canvas; }
    get ctx()       { return this.#ctx; }
    get mouseDown() { return this.#mouseDown; }
    get images()    { return this.#images; }
    get audio()     { return this.#audio; }
    get keys()      { return this.#keys; }
    set mouseDown(v){ this.#mouseDown = v; }

    // ---- Mouse ----
    setupMouse(sprite)
    {
        if (!sprite || !this.#canvas) return;
        window.addEventListener("mousedown", () => this.#mouseDown = true);
        window.addEventListener("mouseup",   () => this.#mouseDown = false);
        window.addEventListener("mousemove", e =>
        {
            const rect   = this.#canvas.getBoundingClientRect();
            sprite.posX  = e.clientX - rect.left;
            sprite.posY  = e.clientY - rect.top;
        });
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
    putText(str, x, y)         { try { this.#ctx.fillText(str, x, y); }                                                              catch {} }
    colorText(color)           { try { this.#ctx.fillStyle = color.toString(); }                                                      catch {} }
    setFont(font)              { try { this.#ctx.font = font.toString(); }                                                            catch {} }

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
}


// ---- ObjHolder --------------------------------------------------------------

class ObjHolder
{
    #objects     = [];
    #orderedList = [];

    addObject(obj, addToOrder = true)
    {
        this.#objects.push(obj);
        if (addToOrder) this.#orderedList.push(obj);
    }

    subObject(index)
    {
        const obj = this.#objects[index];
        if (!obj) return;
        this.#objects.splice(index, 1);
        const i = this.#orderedList.indexOf(obj);
        if (i >= 0) this.#orderedList.splice(i, 1);
    }

    clearObjects()        { this.#objects = []; this.#orderedList = []; }
    getIndex(index)       { return this.#objects[index]; }
    getSize()             { return this.#objects.length; }
    getObjectByName(name) { return this.#objects.find(o => o.name === name); }
    getImage(name)        { return this.getObjectByName(name)?.image ?? null; }
    forEach(cb)           { if (typeof cb === "function") this.#objects.forEach(cb); }

    setOrder(arr)
    {
        if (Array.isArray(arr)) this.#orderedList = arr.filter(o => this.#objects.includes(o));
    }
}


// ---- KeyManager -------------------------------------------------------------

class KeyManager
{
    #keysDown     = {};
    #keysPressed  = {};
    #keysReleased = {};

    constructor() { this.initKeys(); }

    initKeys()
    {
        window.addEventListener("keydown", e =>
        {
            if (!this.#keysDown[e.code]) this.#keysPressed[e.code] = true;
            this.#keysDown[e.code] = true;
        });
        window.addEventListener("keyup", e =>
        {
            delete this.#keysDown[e.code];
            this.#keysReleased[e.code] = true;
        });
    }

    isKeyDown(key)     { return !!this.#keysDown[key]; }
    isKeyPressed(key)  { return !!this.#keysPressed[key]; }
    isKeyReleased(key) { return !!this.#keysReleased[key]; }
    clearFrameKeys()   { this.#keysPressed = {}; this.#keysReleased = {}; }
}


// ---- Sound ------------------------------------------------------------------

class Sound
{
    #name;
    #src;
    #volume;
    #pool;
    #index    = 0;
    #poolSize;

    constructor(name, src, poolSize, volume)
    {
        this.#name     = name;
        this.#src      = src;
        this.#volume   = volume;
        this.#pool     = [];
        this.#poolSize = Math.max(1, poolSize);

        try
        {
            for (let i = 0; i < this.#poolSize; i++)
            {
                const a   = new Audio(this.#src);
                a.preload = "auto";
                a.volume  = this.#volume;
                this.#pool.push(a);
            }
        }
        catch (err) { console.warn("Sound pool creation failed:", name, err.message); }
    }

    get name() { return this.#name; }

    play()
    {
        try
        {
            let a = this.#pool[this.#index];
            if (!a.paused) a = a.cloneNode(true);
            a.volume      = this.#volume;
            a.currentTime = 0;
            a.play();
            this.#index = (this.#index + 1) % this.#poolSize;
        }
        catch {}
    }

    playLooping()
    {
        try
        {
            const a = this.#pool[0];
            if (!a.paused) return;
            a.loop        = true;
            a.volume      = this.#volume;
            a.currentTime = 0;
            a.play();
        }
        catch {}
    }

    stopAll()
    {
        this.#pool.forEach(a => { try { a.pause(); a.currentTime = 0; } catch {} });
    }
}


// ---- AudioPlayer ------------------------------------------------------------

class AudioPlayer
{
    #sounds = new ObjHolder();

    addSound(name, src, poolSize = 1, volume = 1)
    {
        if (name && src) this.#sounds.addObject(new Sound(name, src, poolSize, volume));
    }

    getSound(name)         { return this.#sounds.getObjectByName(name); }
    hasSound(name)         { return !!this.getSound(name); }

    playSound(name)
    {
        const s = this.getSound(name);
        if (s) try { s.play(); } catch (e) { console.error(`Failed to play "${name}":`, e); }
    }

    playSoundLooping(name)
    {
        const s = this.getSound(name);
        if (s) try { s.playLooping(); } catch (e) { console.error(`Failed to loop "${name}":`, e); }
    }

    stopSound(name)
    {
        const s = this.getSound(name);
        if (s) try { s.stopAll(); } catch (e) { console.error(`Failed to stop "${name}":`, e); }
    }

    stopAll()
    {
        this.#sounds.forEach(s => { try { s.stopAll(); } catch {} });
    }
}


// ---- Sprite -----------------------------------------------------------------

class Sprite
{
    #name;
    #image;
    #loaded = false;
    #posX   = 0;
    #posY   = 0;

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


// ---- Timer ------------------------------------------------------------------

class Timer
{
    #name;
    #duration;
    #timeLeft;
    #elapsedTime = 0;
    #active      = false;
    #mode;
    #loop;

    constructor(name, durationSeconds = 0, mode = GameDefs.timerModes.COUNTDOWN, loop = false)
    {
        this.#name     = name;
        this.#duration = durationSeconds;
        this.#timeLeft = durationSeconds;
        this.#mode     = mode;
        this.#loop     = loop;
    }

    get name()        { return this.#name; }
    get active()      { return this.#active; }
    get timeLeft()    { return Math.max(0, this.#timeLeft); }
    get elapsedTime() { return this.#elapsedTime; }
    get progress()
    {
        return this.#mode === GameDefs.timerModes.COUNTDOWN
            ? 1 - (this.#timeLeft / (this.#duration || 1))
            : (this.#duration ? Math.min(1, this.#elapsedTime / this.#duration) : 0);
    }
    get formatted()
    {
        const total = Math.floor(this.#elapsedTime);
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
    }

    start()
    {
        if (this.#mode === GameDefs.timerModes.COUNTDOWN) this.#timeLeft    = this.#duration;
        else                                               this.#elapsedTime = 0;
        this.#active = true;
    }

    stop()  { this.#active = false; }

    reset(duration = this.#duration, mode = this.#mode, loop = this.#loop)
    {
        this.#duration = duration;
        this.#mode     = mode;
        this.#loop     = loop;
        this.start();
    }

    update(delta)
    {
        if (!this.#active) return false;

        if (this.#mode === GameDefs.timerModes.COUNTDOWN)
        {
            this.#timeLeft -= delta;
            if (this.#timeLeft <= 0)
            {
                if (this.#loop) this.#timeLeft += this.#duration;
                else            this.#active    = false;
                return true;
            }
        }
        else
        {
            this.#elapsedTime += delta;
            if (this.#loop && this.#duration > 0 && this.#elapsedTime >= this.#duration)
            {
                this.#elapsedTime -= this.#duration;
                return true;
            }
        }
        return false;
    }
}


// ---- drawHitbox -------------------------------------------------------------

function drawHitbox(device, obj, options = {})
{
    if (typeof obj.getHitbox !== "function") return;

    try
    {
        const hb  = obj.getHitbox(options.scale ?? 1.0, options.buffer ?? 0);
        const w   = hb.right  - hb.left;
        const h   = hb.bottom - hb.top;
        const ctx = device.ctx;

        ctx.save();
        ctx.globalAlpha = options.alpha     ?? 1.0;
        ctx.lineWidth   = options.lineWidth ?? 1;
        ctx.strokeStyle = options.color     || "magenta";

        options.fill
            ? (ctx.fillStyle = options.color || "magenta", ctx.fillRect(hb.left, hb.top, w, h))
            : ctx.strokeRect(hb.left, hb.top, w, h);

        ctx.restore();
    }
    catch (err) { console.warn("drawHitbox failed:", err.message); }
}
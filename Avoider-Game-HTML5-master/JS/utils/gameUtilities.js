// helpers.js
// 
// This file contains utility classes that support the core game engine. 
// It does NOT contain game logic itself — these classes are tools for the controller and game objects.
//
// - Device: Manages the canvas, rendering functions, and user input tools (mouse, keyboard).
// - ObjHolder: Container for sprites or other objects, with optional ordering for rendering or updates.
// - Sprite: Encapsulates an image with a name and optional width/height helpers, fully load-aware.
// - AudioPlayer & Sound: Manage audio assets and playback.
// - Timer: Simple countdown timer for timed events in the game.
//
// These helpers provide a consistent and reusable foundation for rendering, input, audio, and timing,
// so that the game controller can focus on high-level game logic.

class Device
{
	#canvas;
    #ctx;
    #mouseDown;
    #images;
    #audio;
    #keys;

    constructor(width,height)
    {
        this.#canvas = document.getElementById("canvas");
        this.#ctx = this.#canvas.getContext('2d');
        this.#canvas.width = width;
        this.#canvas.height = height;
        this.#mouseDown =  false;
        this.#images = new ObjHolder();
        this.#audio = new AudioPlayer(); 
		this.#keys = new KeyManager();    
    }
    
    //----get Functions----
    get canvas(){return this.#canvas;}
    get ctx(){return this.#ctx;}
    get mouseDown(){return this.#mouseDown;}
    get images(){return this.#images;}
    get audio(){return this.#audio;}
	get keys(){return this.#keys;}
    
    //----set Functions----
    set mouseDown(newState){this._mouseDown = newState;}
    
    setupMouse(sprite, aDev)
	{       
		window.addEventListener('mousedown', (e) => {
        this.#mouseDown = true; // update private field directly
        });
            
		window.addEventListener('mouseup', (e) => {
        this.#mouseDown = false;
        });
        
		window.addEventListener("mousemove", function(mouseEvent) 
		{
			sprite.posX = mouseEvent.clientX - canvas.offsetLeft;
			sprite.posY = mouseEvent.clientY - canvas.offsetTop;	
		});
	}

    renderImage(aImageOrSprite, aX = 0, aY = 0, w, h) 
    {
        if (!aImageOrSprite) return;

        const img = aImageOrSprite.image ? aImageOrSprite.image : aImageOrSprite;

        if (typeof w === "number" && typeof h === "number") 
        {
            // Width + height provided → scale image
            this.#ctx.drawImage(img, aX, aY, w, h);
        } 
        else 
        {
            // Width/height not provided → draw at natural size
            this.#ctx.drawImage(img, aX, aY);
        }
    }   
    
    renderClip(aClip, aPosX, aPosY, aWidth, aHeight, aState)
	{
		this.#ctx.drawImage(
        aClip,
        aState * aWidth,
        0, 
        aWidth,
		aHeight,
        aPosX - aWidth * .5,
		aPosY - aHeight * .5,
        aWidth,
        aHeight);
	}
    
    centerImage(aImage, aPosX, aPosY) 
    {
        const img = aImage.image ?? aImage; // unwrap if it has .image
        const w = img.width;
        const h = img.height;

        this.#ctx.drawImage(img, aPosX - w * 0.5, aPosY - h * 0.5);
    }


    putText(aString, x, y)
	{
		this.#ctx.fillText(aString, x, y);
	}

    centerTextOnY(text, posY) 
    {
        const textWidth = this.#ctx.measureText(text).width;
        const centerX = (this.#canvas.width - textWidth) * .5;
        this.#ctx.fillText(text, centerX, posY);
    }
	
	colorText(color)
	{
		this.#ctx.fillStyle = color.toString(); 
	}
    
	setFont(font)
	{
		this.#ctx.font= font.toString();
	}
    
    debugText(text,posX,posY)
    {
        this.setFont("24px Arial Black");
        this.colorText("white");		
        this.putText(text.toString(), posX, posY);
    }  
}

class ObjHolder 
{
	#objects;       // main container
    #orderedList;   // keeps objects in order

    constructor() 
	{
        this.#objects = [];        // main container
        this.#orderedList = [];    // keeps objects in a specific order if needed
    }

    // --- Add / remove objects ---
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

        // Also remove from ordered list if present
        const orderIndex = this.#orderedList.indexOf(obj);
        if (orderIndex !== -1) this.#orderedList.splice(orderIndex, 1);
    }

    clearObjects() 
	{
        this.#objects = [];
        this.#orderedList = [];
    }

    getIndex(index) 
	{
        return this.#objects[index];
    }

    getSize() {
        return this.#objects.length;
    }

    // --- Lookup ---
    getObjectByName(name) 
	{
        return this.#objects.find(obj => obj.name === name);
    }

    getImage(name) 
	{
        const obj = this.#objects.find(obj => obj.name === name);
        return obj ? obj.image : null;
    }

    // --- Reorder ---
    setOrder(newOrderArray) 
	{
        this.#orderedList = newOrderArray.filter(obj => this.#objects.includes(obj));
    }
}

class KeyManager 
{
	#keysDown;       // currently held keys
    #keysPressed;    // keys pressed this frame
    #keysReleased;   // keys released this frame

	constructor() 
	{
        this.#keysDown = {};       // currently held keys
        this.#keysPressed = {};    // pressed this frame
        this.#keysReleased = {};   // released this frame

        this.initKeys();
    }

    initKeys() 
	{
        window.addEventListener("keydown", (e) => {
            if (!this.#keysDown[e.code]) 
			{
                this.#keysPressed[e.code] = true; // only once
            }
            this.#keysDown[e.code] = true;
        });

        window.addEventListener("keyup", (e) => {
            delete this.#keysDown[e.code];
            this.#keysReleased[e.code] = true; // only once
        });
    }

    // --- Query methods ---
    isKeyDown(key)
	{
        return !!this.#keysDown[key]; // held
    }

    isKeyPressed(key) 
	{
        return !!this.#keysPressed[key]; // just pressed
    }

    isKeyReleased(key) 
	{
        return !!this.#keysReleased[key]; // just released
    }

    // Clear one-frame states (call at end of game loop)
    clearFrameKeys() 
	{
        this.#keysPressed = {};
        this.#keysReleased = {};
    }

}

class Sound
{
    #name;
    #volume
    #src;
    #pool;
    #index;
    #poolSize;

    // FIX add  constants?
    constructor(name, src, poolSize, volume)
    {
        this.#name = name;
        this.#src = src;
        this.#volume = volume;
        this.#pool = [];
        this.#index = 0;
        this.#poolSize = Math.max(1, poolSize); // never <1
     

        // preload audio pool
        for (let i = 0; i < poolSize; i++) 
        {
            const audio = new Audio(this.#src);
            audio.preload = "auto";
            this.#pool.push(audio);
        }

    }

    get name() { return this.#name; }
    
    play() 
    {
        let audio = this.#pool[this.#index];
        
        //if this audio is being used basiclly
        if (!audio.paused)
        {   
            // Fallback: clone for guaranteed playback
            audio = audio.cloneNode;
        }

        audio.volume = this.#volume;
        // forces the audio playback position back to the start of the file before playing
        audio.currentTime = 0;
        audio.play();

        this.#index = (this.#index + 1) % this.#poolSize;
    }

    stopAll() 
    {
        this.#pool.forEach(a => {
            a.pause();
            a.currentTime = 0;
        });
    }
    
}

class AudioPlayer
 {
    #sounds;

    constructor()
    {
        //this.#sounds = {};
        this.#sounds = new ObjHolder();
    }

    addSound(name, src, poolSize, volume)
    {
        //this.#sounds[name] = new Sound(name, src);

        const sound = new Sound(name, src, poolSize, volume)
        this.#sounds.addObject(sound);
        
    }

    getSound(name)
    {
         return this.#sounds.getObjectByName(name);
    }

    playSound(name) 
    {
        const sound = this.getSound(name);
        if (sound) 
        {
            sound.play(sound.volume);
        } 
        else 
        {
            console.warn(`Sound "${name}" not found`);
        }
    }

    stopSound(name) 
    {
        const sound = this.getSound(name);
        if (sound) sound.stopAll();
    }

    stopAll() 
    {
        this.#sounds.forEach(s => s.stopAll());
    }

 }



class Sprite
 {
    #image;
    #name;
	#loaded;
    #posX = 0;   // current X position
    #posY = 0;   // current Y position

    constructor(src, name, x = 0, y = 0, width = null, height = null) 
	{
        this.#image = new Image();
        this.#image.src = src;
        this.#name = name;
		this.#loaded = false;
        this.#posX = x;
        this.#posY = y;

		// Optional width/height override
        this.#image.width = width ?? this.#image.width;
        this.#image.height = height ?? this.#image.height;

		this.#image.onload = () => {
            this.#loaded = true;
        };
    }

    // --- Getters ---
    get name() { return this.#name; }
    get image() { return this.#image; }
    get width() { return this.#image.width; }
    get height() { return this.#image.height; }
    get loaded() { return this.#loaded; }
    get posX() { return this.#posX; }
    get posY() { return this.#posY; }

    // --- Position helpers ---
    set posX(value) { this.#posX = value; }
    set posY(value) { this.#posY = value; }
}

class Timer
{
    #duration;     // seconds for one cycle
    #timeLeft;     // countdown mode: seconds remaining
    #elapsedTime;  // countup mode: seconds elapsed
    #active;       // is the timer running?
    #mode;         // GameDefs.timerModes.COUNTDOWN or COUNTUP
    #loop;         // true = auto restart after finish

    constructor(durationSeconds = 0, mode = GameDefs.timerModes.COUNTDOWN, loop = false) 
    {
        this.#duration = durationSeconds;
        this.#timeLeft = durationSeconds;
        this.#elapsedTime = 0;
        this.#active = false;
        this.#mode = mode;
        this.#loop = loop;
    }

    // --- Getters ---
    get active() { return this.#active; }
    get timeLeft() { return Math.max(0, this.#timeLeft); }
    get elapsedTime() { return this.#elapsedTime; }
    get progress() {
        return this.#mode === GameDefs.timerModes.COUNTDOWN
            ? 1 - (this.#timeLeft / (this.#duration || 1))
            : (this.#duration ? Math.min(1, this.#elapsedTime / this.#duration) : 0);
    }

    // --- Control ---
    start() 
    {
        if (this.#mode === GameDefs.timerModes.COUNTDOWN) 
        {
            this.#timeLeft = this.#duration;
        } 
        else 
        {
            this.#elapsedTime = 0;
        }
        this.#active = true;
    }

    stop() 
    {
        this.#active = false;
    }

    // reset now explicitly sets duration, mode, and loop
    reset(durationSeconds = this.#duration, mode = this.#mode, loop = this.#loop) 
    {
        this.#duration = durationSeconds;
        this.#mode = mode;
        this.#loop = loop;
        this.start();
    }

    // update returns true on a "tick/finish" moment
    update(delta) 
    {
        if (!this.#active) return false;

        if (this.#mode === GameDefs.timerModes.COUNTDOWN) 
        {
            this.#timeLeft -= delta;
            if (this.#timeLeft <= 0) {
                if (this.#loop) 
                {
                    // restart but preserve slight overflow
                    this.#timeLeft += this.#duration;
                } else {
                    this.#active = false;
                }
                return true;
            }
        } 
        else 
        { // COUNTUP
            this.#elapsedTime += delta;
            if (this.#loop && this.#duration > 0 && this.#elapsedTime >= this.#duration) 
            {
                this.#elapsedTime -= this.#duration;
                return true;
            }
        }
        return false;
    }

    // Formatted MM:SS
    get formatted() 
    {
        const total = Math.floor(this.elapsedTime);
        const minutes = Math.floor(total / 60);
        const seconds = total % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
}

// Draw a rectangle around an object's hitbox (uses object's getHitbox())
function drawHitbox(device, obj, options = {}) 
{
    const color = options.color || 'magenta';
    const lineWidth = options.lineWidth ?? 1;
    const fill = options.fill || false;
    const alpha = options.alpha ?? 1.0;

    if (typeof obj.getHitbox !== 'function') return; // safety

    const hb = obj.getHitbox(options.scale ?? 1.0, options.buffer ?? 0);
    const w = hb.right - hb.left;
    const h = hb.bottom - hb.top;
    const ctx = device.ctx;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    if (fill) {
        ctx.fillStyle = color;
        ctx.fillRect(hb.left, hb.top, w, h);
    } else {
        ctx.strokeRect(hb.left, hb.top, w, h);
    }
    ctx.restore();
}

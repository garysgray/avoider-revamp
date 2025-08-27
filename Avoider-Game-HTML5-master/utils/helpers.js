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
    constructor(width,height)
    {
        this._canvas = document.getElementById("canvas");
        this._ctx = this._canvas.getContext('2d');
        this._canvas.width = width;
        this._canvas.height = height;
        this._mouseDown =  false;
        this._images = new ObjHolder();
        this._audio = new AudioPlayer(); 
		this._keys = new KeyManager();    
    }
    
    //getter functions
    get canvas(){return this._canvas;}
    get ctx(){return this._ctx;}
    get mouseDown(){return this._mouseDown;}
    get images(){return this._images;}
    get audio(){return this._audio;}
	get keys(){return this._keys;}
    
    //setter functions
    set mouseDown(newState){this._mouseDown = newState;}
    
    setupMouse(sprite,aDev)
	{       
		window.addEventListener('mousedown', function(e) {
			aDev.mouseDown = true;
            
		});
		window.addEventListener('mouseup', function(e) {
			aDev.mouseDown = false;
            
		});		
		window.addEventListener("mousemove", function(mouseEvent) 
		{
			sprite._posX = mouseEvent.clientX - canvas.offsetLeft;
			sprite._posY = mouseEvent.clientY - canvas.offsetTop;	
		});
	}
    
	renderImage(aImageOrSprite, aX = 0, aY = 0) 
	{
		if (!aImageOrSprite) return;
		if (aImageOrSprite.image) {
			this._ctx.drawImage(aImageOrSprite.image, aX, aY);
		} else {
			this._ctx.drawImage(aImageOrSprite, aX, aY);
		}
	}

    renderClip(aClip, aPosX, aPosY, aWidth, aHeight, aState)
	{
		this._ctx.drawImage(
        aClip,
        aState * aWidth,
        0, 
        aWidth,
		aHeight,
        aPosX - aWidth*.5,
		aPosY  -aHeight*.5,
        aWidth,
        aHeight);
	}
    
    centerImage(aImage, aPosX, aPosY)
    {
		const w = aImage.width ?? aImage.image.width;
    	const h = aImage.height ?? aImage.image.height;

		if (aImage.image) {
        this._ctx.drawImage(aImage.image, aPosX - w / 2, aPosY - h / 2);
		} else {
	
			this._ctx.drawImage(aImage, aPosX - w / 2, aPosY - h / 2);
		}
    }

    putText(aString, x, y)
	{
		this._ctx.fillText(aString, x, y);
	}
	
	centerTextX(aString, y)
	{
		var temp = aString.length;
		var center = (this._canvas.width *.5) -temp*4;
		this._ctx.fillText(aString,center,y);
	}
	
	centerTextXY(aString)
	{
		var temp = aString.length;
		var centerX = (this._canvas.width *.5) -temp*3.5;
		var centerY = (this._canvas.height *.5);
		
		this._ctx.fillText(aString,centerX,centerY);
	}
	
	colorText(color)
	{
		this._ctx.fillStyle = color.toString(); 
	}
    
	setFont(font)
	{
		this._ctx.font= font.toString();
	}
    
    debugText(text,posX,posY)
    {
        this.setFont("24px Arial Black");
        this.colorText("white");		
        this.putText(text.toString(),posX,posY);
    }  
}

class ObjHolder {
    constructor() {
        this._objects = [];        // main container
        this._orderedList = [];    // keeps objects in a specific order if needed
    }

    // --- Add / remove objects ---
    addObject(obj, addToOrder = true) {
        this._objects.push(obj);
        if (addToOrder) this._orderedList.push(obj);
    }

    subObject(index) {
        const obj = this._objects[index];
        if (!obj) return;
        this._objects.splice(index, 1);

        // Also remove from ordered list if present
        const orderIndex = this._orderedList.indexOf(obj);
        if (orderIndex !== -1) this._orderedList.splice(orderIndex, 1);
    }

    clearObjects() {
        this._objects = [];
        this._orderedList = [];
    }

    getIndex(index) {
        return this._objects[index];
    }

    getSize() {
        return this._objects.length;
    }

    // --- Lookup ---
    getObjectByName(name) {
        return this._objects.find(obj => obj.name === name);
    }

    getImage(name) {
        const obj = this._objects.find(obj => obj.name === name);
        return obj ? obj.image : null;
    }

    // --- Reorder ---
    setOrder(newOrderArray) {
        this._orderedList = newOrderArray.filter(obj => this._objects.includes(obj));
    }
}

class KeyManager 
{
	constructor() {
        this.keysDown = {};       // currently held keys
        this.keysPressed = {};    // pressed this frame
        this.keysReleased = {};   // released this frame

        this.initKeys();
    }

    initKeys() {
        window.addEventListener("keydown", (e) => {
            if (!this.keysDown[e.code]) {
                this.keysPressed[e.code] = true; // only once
            }
            this.keysDown[e.code] = true;
        });

        window.addEventListener("keyup", (e) => {
            delete this.keysDown[e.code];
            this.keysReleased[e.code] = true; // only once
        });
    }

    // --- Query methods ---
    isKeyDown(key) {
        return !!this.keysDown[key]; // held
    }

    isKeyPressed(key) {
        return !!this.keysPressed[key]; // just pressed
    }

    isKeyReleased(key) {
        return !!this.keysReleased[key]; // just released
    }

    // Clear one-frame states (call at end of game loop)
    clearFrameKeys() {
        this.keysPressed = {};
        this.keysReleased = {};
    }

}

class Sound
{
    constructor(aName,aAudio)
    {
        this._name = aName;
        this._audio = new Audio(aAudio);
    }   
    get name()
    {
        return this._name;
    }
    get audio()
    {
        return this._audio;
    }
}

class AudioPlayer
{
    constructor()
    {
        this._sounds = new Array();
    }
	
	addSound(aName,aAudio)
	{
        var newSound = new Sound(aName,aAudio);
		this._sounds.push(newSound);	
	}
	getSize()
	{
		return this._sounds.length;
	}
	playSound(aSoundname)
	{
		for(var i = 0; i < this._sounds.length; i++)
		{
			if(this._sounds[i].name == aSoundname)
			{
				this._sounds[i].audio.play();
				break;
			}		
		}
	}
}

class Sprite {
    #image;
    #name;
	#loaded;

    constructor(src, name) {
        this.#image = new Image();
        this.#image.src = src;
        this.#name = name;
		this.#loaded = false;

		this.#image.onload = () => {
            this.#loaded = true;
        };
    }

    // Getter for the name
    get name() {
        return this.#name;
    }

    // Getter for the raw Image object (used for ctx.drawImage)
    get image() {
        return this.#image;
    }

    // Optional helper to return width/height directly from the image
    get width() {
        return this.#image.width;
    }

    get height() {
        return this.#image.height;
    }
	get loaded() {
        return this.#loaded;
    }
}

class Timer
{
    constructor(timeToCount)
    {
        this._currentTime = 0;
        this._lastTime = 0;
        this._totalTime = 0;
        this._enoughtTime = timeToCount;
        this._clock = 0;
        this._posX =0;
        this._posY = 0;
        this._active = false;
    }
    
    get active()
	{
		return this._active;
	}
    // getImage()
	// {
		// return this._image;
	// }
    
    update()
	{
		this._currentTime = Date.now();
		var  thisTime = this._currentTime - this._lastTime;
		this._totalTime += thisTime;
		
		if(this._clock < 1)
		{
            this._active = false;
			return true;
		}	
		if(this._totalTime > this._enoughtTime)
		{
			this._totalTime = 0;
			this._lastTime = this._currentTime;
			this._clock--;
		}
		else
		{
			this._lastTime = this._currentTime;
		}
	}
    posClock(x,y)
	{
		this._posX = x;
		this._posY = y;
	}
	display(aDev,x,y)
	{	
		if(this._clock < 0)
		{
			this._clock = 0;
		}
		aDev.putText("TIME:  " + this._clock, x, y);

	}
	set(startAmt)
	{
        this._active = true;
		this._clock = startAmt;
	}	
}


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
    
    //getter functions
    get canvas(){return this.#canvas;}
    get ctx(){return this.#ctx;}
    get mouseDown(){return this.#mouseDown;}
    get images(){return this.#images;}
    get audio(){return this.#audio;}
	get keys(){return this.#keys;}
    
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
			this.#ctx.drawImage(aImageOrSprite.image, aX, aY);
		} else {
			this.#ctx.drawImage(aImageOrSprite, aX, aY);
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
		const w = aImage.width ?? aImage.image.width;
    	const h = aImage.height ?? aImage.image.height;

		if (aImage.image) 
		{
        	this.#ctx.drawImage(aImage.image, aPosX - w / 2, aPosY - h / 2);
		}
		else
		{
			this.#ctx.drawImage(aImage, aPosX - w / 2, aPosY - h / 2);
		}
    }

    putText(aString, x, y)
	{
		this.#ctx.fillText(aString, x, y);
	}
	
	//FIX magic nums
	centerTextX(aString, y)
	{
		var temp = aString.length;
		var center = (this.#canvas.width * .5) -temp * 4;
		this.#ctx.fillText(aString, center, y);
	}
	
	//FIX magic nums
	centerTextXY(aString)
	{
		var temp = aString.length;
		var centerX = (this.#canvas.width * .5) -temp * 3.5;
		var centerY = (this.#canvas.height * .5);
		
		this.#ctx.fillText(aString,centerX,centerY);
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
        this.putText(text.toString(),posX,posY);
    }  
}

class ObjHolder {
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

    constructor(src, name, width = null, height = null) 
	{
        this.#image = new Image();
        this.#image.src = src;
        this.#name = name;
		this.#loaded = false;

		// Optional width/height override
        this.#image.width = width ?? this.#image.width;
        this.#image.height = height ?? this.#image.height;

		this.#image.onload = () => {
            this.#loaded = true;
        };
    }

    // Getter for the name
    get name() 
	{
        return this.#name;
    }

    // Getter for the raw Image object (used for ctx.drawImage)
    get image() 
	{
        return this.#image;
    }

    // Optional helper to return width/height directly from the image
    get width() 
	{
        return this.#image.width;
    }

    get height() 
	{
        return this.#image.height;
    }
	get loaded() 
	{
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


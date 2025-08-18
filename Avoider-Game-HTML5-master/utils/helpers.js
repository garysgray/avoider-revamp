//tools are here to help the controller render the game
//main tool is the device which holds the canvas tools for rendering
//also holds tools to help get user input , 
//holders to utilize sprite, and sound class objects
//last but not least there is also timer object

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
    
    //this one takes an image object that is passed in directly 
	renderImage(aImage,aObjectX,aObjectY)
	{
		this._ctx.drawImage(aImage,aObjectX,aObjectY);
	}
    
    renderClip(aClip,aPosX,aPosY,aWidth,aHeight,aState)
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
    
    centerImage(aImage,aPosX,aPosY,aWidth,aHeight)
    {
        this._ctx.drawImage(aImage,aPosX-aWidth*.5-12,aPosY-aHeight*.5-12);
    }
    
    putText(aString,x,y)
	{
		this._ctx.fillText(aString,x,y);
	}
	
	centerTextX(aString,y)
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

class Sprite
{
    constructor(aSrc,aName)
    {
        this._image = new Image();
        this._image.src = aSrc;
        this._name = aName;
    }
    get name()
	{
		return this._name;
	}
    get image()
	{
		return this._image;
	}
}

class ObjHolder
{
    constructor()
    {
        this._objects = new Array(); 
    }

    get objects()
    {
        return this._objects;
    }
    
    addImage(aSrc,aName)
    {
        var aObject = new Sprite(aSrc, aName);
        this._objects.push(aObject);
    }

	addObject(aObject)
	{
		this._objects.push(aObject);	
	}
	subObject(aIndex)
	{
		this._objects.splice(aIndex, 1);
	}
	clearObjects()
	{
		this._objects = [];
		this._objects = new Array();
	}
	getIndex(aIndex)
	{
		return this._objects[aIndex];
	}
	getSize()
	{
		return this._objects.length;
	}
	update(aDev,aDT)
	{
		for(var i = 0; i < this._objects.length; i++)
		{
			this._objects[i].update(aDev, aDT);
		}
	}
    getImage(aName)
	{
		for(var i = 0; i < this._objects.length; i++)
		{
			if(this._objects[i].name == aName)
			{
				return this._objects[i].image;
				break;
			}		
		}		
	}
    getObject(aName)
        {
            for(var i = 0; i < this._objects.length; i++)
            {
                if(this._objects[i].name == aName)
                {
                    return this._objects[i];
                    break;
                }		
            }		
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


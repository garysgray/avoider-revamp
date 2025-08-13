//game object is the super class and player and backdrops are children
//they for now just hold info with a few functions
//will probaly move more functionalaty into them over time
//for example actually utilize ther update functions

//your basic object for keeping track of positions and speed
//has a collision function, might get more
class GameObject
{
    constructor(aName,aWidth,aHeight,newX,newY,aSpeed)
    {
        this._name = aName;	
        this._width = aWidth;
        this._height = aHeight;
        this._posX = newX;
        this._posY = newY;
        this._speed = aSpeed;
        this._spaceBuffer = 12;
        this._state = 0
    } 
    
    get name(){return this._name;}
    get width(){return this._width;}
    get height(){return this._height;}
    get posX(){return this._posX;}
    get posY(){return this._posY;}
    get speed(){return this._speed;}
    get spaceBuffer(){return this._spaceBuffer;}
    get state(){return this._state;}
    
    set name(aName){this._name =aName;}
    set width(aWidth){this._width =aWidth;}
    set height(aHeight){this._height =aHeight;}
    set posX(aPosX){this._posX =aPosX;}
    set posY(aPosY){this._posY =aPosY;}
    set speed(aSpeed){this._speed =aSpeed;}
    set spaceBuffer(aSpaceBuffer){this._spaceBuffer =aSpaceBuffer;}
    set state(aState){this._state =aState;}
    
    update(aDev,aDT)
	{
		
	}
    
    moveDown(aDT)
	{   
		this._posY += this._speed * aDT;  
	}
    
	movePos(newX,newY)
	{
		this._posX = newX;
		this._posY = newY;
	}
       
	checkObjCollision(aPosX,aPosY,aWidth,aHeight)
	{
        if(this._posX + this._width*.5-this._spaceBuffer > aPosX - aWidth*.5 && this._posX-this._width*.5-this._spaceBuffer < aPosX + aWidth*.5
        &&
        this._posY + this._height*.5-this._spaceBuffer > aPosY - aHeight*.5 && this._posY- this._height*.5-this._spaceBuffer < aPosY + aHeight*.5 )   
        {
        return true;
        }		
	}   
}

//player has a timer and delay  for shooting bullets
class Player extends GameObject
{
    constructor(aWidth,aHeight,newX,newY,aSpeed)
    {
        super();
        this._width = aWidth;
        this._height = aHeight;
        this._posX = newX;
        this._posY = newY;
        this._speed = aSpeed
        
        this._state = 0;       
        this._projectileTimer = Date.now();
        this._shootDelay = 200;
        
    }
    get projectileTimer(){return this._projectileTimer;}    
    get shootDelay(){return this._shootDelay;}
    
    set projectileTimer(aNum){this._projectileTimer = aNum;}
    set shootDelay(aNum){this._shootDelay = aNum;}   
     
    update(aDev,aDT)
	{
		
	}
    //checks collision of canvas border and player position
    borderCheck(aDev)
	{
		if(this._posX - this._width*.5 < 0 )
		{
			this._posX = this._width*.5;
		}
		if(this._posX + this._width*.5 > aDev.canvas.width)
		{	
			this._posX = aDev.canvas.width - this._width*.5;
		}		
		if(this._posY - this._height*.5 < 0 )
		{
			this._posY = this._height*.5;
		}
		//// the -50 is for a buffer to keep player from hitting bottom for hud
		if(this._posY + this._height*.5 > aDev.canvas.height-50)
		{		
			this._posY =(aDev.canvas.height-50) - this._height*.5;
		}
	}   
}

//utilized for showing things in game like billboards are backgrounds
//they have game object functions so they can be moved around easily
class BackDrop extends GameObject
{
    constructor(aWidth,aHeight,newX,newY)
    {
        super();
        this._width = aWidth;
        this._height = aHeight;
        this._posX = newX;
        this._posY = newY;
        
        this._speed = 0
        this._state = 0
    }
      
    update(aDev,aDT)
	{
		
	}
}



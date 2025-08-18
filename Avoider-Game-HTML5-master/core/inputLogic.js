//**These Functions are called in update by controller

//user n put is mouse and keyboard clicks within shooting timer and player.shootdelay to help make it smooth
//then we shoot bullets
function checkUserInput(aDev,aGame)
{
     if(aDev.mouseDown && Date.now()-aGame.player.projectileTimer > aGame.player.shootDelay || 
        aDev.keys.isKeyPressed(aGame.gameConsts.playKey)  && Date.now()-aGame.player.projectileTimer > aGame.player.shootDelay)
    {
        var bullet = new GameObject("bullet",12,12,(aGame.player.posX) ,aGame.player.posY ,aGame.gameConsts.bulletSpeed);
        //this is where objects are getting adjusted to the center
        bullet.posX -= bullet.width*.5;
        bullet.posY += bullet.height*.5;
        aGame.projectiles.addObject(bullet);			
        ////this is where we set the players shoot delay timer 
        aGame.player.projectileTimer = Date.now();
        ////the audio sound of shooting
        aDev.audio.playSound("shoot");
        //if we are out of ammo we change the type of ship sprite 
        if(aGame.ammo <= 0)
        {
            aGame.playState = playStates.AVOID;
        }
        else
        {
             aGame.decreaseAmmo(1);
        }
    }
}

//looking for user to pause then we change game state
//grabs current position first for when un-pausing
function checkforPause(aDev,aGame)
{
    if(aDev.keys.isKeyReleased(aGame.gameConsts.pauseKey))//P-key
    {
        if (aGame.state === gameStates.PLAY)
        {	aGame.holdX = aGame.player.posX;
            aGame.holdY= aGame.player.posY;
            aGame.state = gameStates.PAUSE;
        }
        else if (aGame.state === gameStates.PAUSE) 
        {
            aGame.state = gameStates.PLAY;
        }
    }
}
   
//**functions that update game objects**

//basicly updates that y positions of the bullets and then calls the check collison function
function updateProjectiles(aDev,aGame, aDT)
{
    for( var i = 0; i< aGame.projectiles.getSize() ;i++)
    {
        aGame.projectiles.getIndex(i).posY -= aGame.projectiles.getIndex(i).speed * aDT;
         
        if(aGame.projectiles.getIndex(i).posY < 0)
        {
            aGame.projectiles.subObject(i);
        }
    }		
    updateProjectilesCollision(aDev,aGame,aDT);
}

//This updates all game objects other then player and bullets
//basicly updates there positions and then calls for collision
function updateNPCSprites(aDev,aGame,aDT)
{		
    if(Math.random() < 1/aGame.gameConsts.rndRatio)
    {
        //this is made to help get us a X pos  in range that will not let orb be off the screen
        //buff values help dial in perfect position
        var rndXValue = Math.floor(Math.random() *((aDev.canvas.width-aGame.gameConsts.buffer1)-aGame.gameConsts.buffer2+1));		
        orb = new GameObject("orb",29,29,rndXValue,0, aGame.gameConsts.orbSpeed);
                
        for(var i = 0;i < aGame.gameSprites.getSize();i++)
        {			
            var count = 0;
            temp = aGame.gameSprites.getIndex(i)
            while(orb.checkObjCollision(temp.posX,temp.posY,temp.width,temp.height) )
            {
                if(count > 3)
                {
                    break;
                }
                var rndXValue = Math.floor(Math.random() *((aDev.canvas.width-(aGame.gameConsts.buffer1*count))-(aGame.gameConsts.buffer2*count)+1));
                orb.movePos = (rndXValue,0);
                count ++;
            }		
        }
        aGame.gameSprites.addObject(orb);        
    }

    if(Math.random() < 1/99)
    {
        //this is made to help get us a X pos  in range that will not let sprite be off the screen
        //buff values help dial in perfect position
        var rndXValue = Math.floor(Math.random() *((aDev.canvas.width-aGame.gameConsts.buffer1)-aGame.gameConsts.buffer2+1));			
        fireAmmo = new GameObject("fireAmmo",20,20,rndXValue,0, aGame.gameConsts.orbSpeed);       
        for(var i = 0;i < aGame.gameSprites.getSize();i++)
        {
            var count = 0;
            temp = aGame.gameSprites.getIndex(i);
            while(fireAmmo.checkObjCollision(temp.posX,temp.posY,temp.width,temp.height) )
            {
                if(count > 3)
                {
                    break;
                }
                var rndXValue = Math.floor(Math.random() *((aDev.canvas.width-(aGame.gameConsts.buffer1*count))-(aGame.gameConsts.buffer2*count)+1));
                fireAmmo.movePos = (rndXValue,0);
                count ++;
            }				
        }
        aGame.gameSprites.addObject(fireAmmo);     
    }
    //magic numbers
    //check to see if sprite is off screen, if it is delete it from array
    for(var i = 0;i <  aGame.gameSprites.getSize(); i++)
    {
         aGame.gameSprites.getIndex(i).moveDown(aDT);			 
         if(aGame.gameSprites.getIndex(i).posY > aDev.canvas.height-100)
         {
            aGame.gameSprites.subObject(i);
         }
    }	 
}

//**functions that update game objects collision**

//checks the projectiles collision with other game objects such as orbs and fire ammo
//plays sounds if it a bullet hits an object
//then removes both objects from there holder objs 
function updateProjectilesCollision(aDev,aGame, aDT)
{
    for( var i = 0; i< aGame.projectiles.getSize() ;i++)
    {
        for( var j = 0; j< aGame.gameSprites.getSize() ;j++)
        {
            temp = aGame.gameSprites.getIndex(j);
            if(aGame.projectiles.getIndex(i).checkObjCollision(temp.posX,temp.posY,temp.width,temp.height))
            {
                aDev.audio.playSound("hit");
                aGame.gameSprites.subObject(j);
                aGame.increaseScore(aGame.gameConsts.scoreIncreaseAmount);
                aGame.projectiles.subObject();
                break;
            }
        }
    }
}

//checks the players collision with other game objects such as orbs and fire ammo
//plays sounds if it hits an object
//then removes both objects from there holder objs 
//game states get changed based on type  of object hit	
function check_NPC_Collision(aDev,aGame)
{
    for(var i =0;i< aGame.gameSprites.getSize();i++)
    {
        temp = aGame.gameSprites.getIndex(i)
        if(aGame.player.checkObjCollision(temp.posX,temp.posY,temp.width,temp.height))           
        {            
            if(aGame.gameSprites.getIndex(i).name == "fireAmmo")
            {					
                aDev.audio.playSound("get");
                aGame.gameSprites.subObject(i);
                aGame.playState = playStates.SHOOT;
                aGame.increaseAmmo(aGame.gameConsts.ammoAmount);					
            }
            else
            {
                aDev.audio.playSound("hurt");
                aGame.playState = playStates.DEATH;                   
                aGame.gameSprites.subObject(i);
                aGame.decreaseLives(1);
                aGame.state = gameStates.LOSE;                   
                return false;                
            }	
        }
    }
    return true;
}





   
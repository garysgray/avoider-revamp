//**These Functions are called in update by controller

//user n put is mouse and keyboard clicks within shooting timer and player.shootdelay to help make it smooth
//then we shoot bullets
function checkUserInput(device, game)
{
     if(device.mouseDown && Date.now() - game.player.projectileTimer > game.player.shootDelay || 
        device.keys.isKeyPressed(game.gameConsts.PLAY_KEY)  && Date.now() - game.player.projectileTimer > game.player.shootDelay)
    {
        //FIX magic numbers
        var bullet = new GameObject("bullet", 12, 12,(game.player.posX) , game.player.posY , game.gameConsts.BULLET_SPEED);
        //this is where objects are getting adjusted to the center
        bullet.posX -= bullet.width*.5;
        bullet.posY += bullet.height*.5;
        game.projectiles.addObject(bullet);			
        ////this is where we set the players shoot delay timer 
        game.player.projectileTimer = Date.now();
        ////the audio sound of shooting
        device.audio.playSound("shoot");
        //if we are out of ammo we change the type of ship sprite 
        if(game.ammo <= 0)
        {
            game.playState = playStates.AVOID;
        }
        else
        {
             game.decreaseAmmo(1);
        }
    }
}

//looking for user to pause then we change game state
//grabs current position first for when un-pausing
function checkforPause(device, game)
{
    if(device.keys.isKeyReleased(game.gameConsts.PAUSE_KEY))//P-key
    {
        if (game.state === gameStates.PLAY)
        {	game.holdX = game.player.posX;
            game.holdY= game.player.posY;
            game.state = gameStates.PAUSE;
        }
        else if (game.state === gameStates.PAUSE) 
        {
            game.state = gameStates.PLAY;
        }
    }
}
   
//**functions that update game objects**

//basicly updates that y positions of the bullets and then calls the check collison function
function updateProjectiles(device, game, delta)
{
    for( var i = 0; i< game.projectiles.getSize() ;i++)
    {
        game.projectiles.getIndex(i).posY -= game.projectiles.getIndex(i).speed * delta;
         
        if(game.projectiles.getIndex(i).posY < 0)
        {
            game.projectiles.subObject(i);
        }
    }		
    updateProjectilesCollision(device, game, delta);
}

//This updates all game objects other then player and bullets
//basicly updates there positions and then calls for collision
function updateNPCSprites(device, game, delta)
{		
    if(Math.random() < 1/game.gameConsts.RND_RATIO)
    {
        //this is made to help get us a X pos  in range that will not let orb be off the screen
        //buff values help dial in perfect position
        var rndXValue = Math.floor(Math.random() * ((device.canvas.width - game.gameConsts.BUFFER_1) - game.gameConsts.BUFFER_2 + 1));	
        //FIX magic numbers	
        orb = new GameObject("orb", 29, 29, rndXValue, 0, game.gameConsts.ORB_SPEED);
                
        for(var i = 0;i < game.gameSprites.getSize();i++)
        {			
            var count = 0;
            temp = game.gameSprites.getIndex(i)
            while(orb.checkObjCollision(temp.posX, temp.posY, temp.width, temp.height) )
            {
                if(count > 3)
                {
                    break;
                }
                var rndXValue = Math.floor(Math.random() * ((device.canvas.width - (game.gameConsts.BUFFER_1 * count)) - (game.gameConsts.BUFFER_2 * count) + 1));
                orb.movePos = (rndXValue,0);
                count ++;
            }		
        }
        game.gameSprites.addObject(orb);        
    }

    if(Math.random() < 1/99)
    {
        //this is made to help get us a X pos  in range that will not let sprite be off the screen
        //buff values help dial in perfect position
        var rndXValue = Math.floor(Math.random() * ((device.canvas.width - game.gameConsts.BUFFER_1) - game.gameConsts.BUFFER_2 + 1));
        //FIX magic numbers			
        fireAmmo = new GameObject("fireAmmo", 20, 20, rndXValue, 0, game.gameConsts.ORB_SPEED);       
        for(var i = 0;i < game.gameSprites.getSize();i++)
        {
            var count = 0;
            temp = game.gameSprites.getIndex(i);
            while(fireAmmo.checkObjCollision(temp.posX, temp.posY, temp.width, temp.height) )
            {
                if(count > 3)
                {
                    break;
                }
                var rndXValue = Math.floor(Math.random() * ((device.canvas.width - (game.gameConsts.BUFFER_1 * count)) - (game.gameConsts.BUFFER_2 * count) + 1));
                fireAmmo.movePos = (rndXValue,0);
                count ++;
            }				
        }
        game.gameSprites.addObject(fireAmmo);     
    }
    //magic numbers
    //check to see if sprite is off screen, if it is delete it from array
    for(var i = 0;i <  game.gameSprites.getSize(); i++)
    {
         game.gameSprites.getIndex(i).moveDown(delta);			 
         if(game.gameSprites.getIndex(i).posY > device.canvas.height-100)
         {
            game.gameSprites.subObject(i);
         }
    }	 
}

//**functions that update game objects collision**

//checks the projectiles collision with other game objects such as orbs and fire ammo
//plays sounds if it a bullet hits an object
//then removes both objects from there holder objs 
function updateProjectilesCollision(device, game, delta)
{
    for( var i = 0; i < game.projectiles.getSize(); i++)
    {
        for( var j = 0; j < game.gameSprites.getSize(); j++)
        {
            temp = game.gameSprites.getIndex(j);
            if(game.projectiles.getIndex(i).checkObjCollision(temp.posX, temp.posY, temp.width, temp.height))
            {
                device.audio.playSound("hit");
                game.gameSprites.subObject(j);
                game.increaseScore(game.gameConsts.SCORE_INCREASE);
                game.projectiles.subObject();
                break;
            }
        }
    }
}

//checks the players collision with other game objects such as orbs and fire ammo
//plays sounds if it hits an object
//then removes both objects from there holder objs 
//game states get changed based on type  of object hit	
function check_NPC_Collision(device, game)
{
    for(var i = 0; i < game.gameSprites.getSize(); i++)
    {
        temp = game.gameSprites.getIndex(i)
        if(game.player.checkObjCollision(temp.posX, temp.posY, temp.width, temp.height))           
        {            
            if(game.gameSprites.getIndex(i).name == "fireAmmo")
            {					
                device.audio.playSound("get");
                game.gameSprites.subObject(i);
                game.playState = playStates.SHOOT;
                game.increaseAmmo(game.gameConsts.AMMO_AMOUNT);					
            }
            else
            {
                device.audio.playSound("hurt");
                game.playState = playStates.DEATH;                   
                game.gameSprites.subObject(i);
                game.decreaseLives(1);
                game.state = gameStates.LOSE;                   
                return false;                
            }	
        }
    }
    return true;
}





   
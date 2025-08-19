//**These Functions are called in renderGameObjects by controller

//Using dev tools and game info renders gameSprites(ammo and orbs)
function renderNPCSprites(aDev,aGame)
{
    ////this makes a temp object of the image we want to use
    //this is so the image holder does not have to keep finding image
    tempImage1 = aDev.images.getImage("orb")
    tempImage2 = aDev.images.getImage("fireAmmo")	
     for (var i = 0; i < aGame.gameSprites.getSize(); i++)
    {	
        ////this is to make a temp object for easier code to write and understand
        tempObj = aGame.gameSprites.getIndex(i);            
        switch(tempObj.name)
        {
            case "orb":
             aDev.renderImage(tempImage1,tempObj.posX,tempObj.posY);
            break;
            case "fireAmmo":
              aDev.renderImage(tempImage2,tempObj.posX,tempObj.posY);
            break;
        }           
    }
}

//Using dev tools and game info renders projectiles(bullets)
function renderBullets(aDev,aGame)
{	
    ////this makes a temp object of the image we want to use
    //this is so the image holder does not have to keep finding image
    tempImage = aDev.images.getImage("bullet")	
     for (var i = 0; i < aGame.projectiles.getSize(); i++)
        {	
            ////this is to make a temp object for easier code to write and understand
            tempObj = aGame.projectiles.getIndex(i);
            aDev.renderImage(tempImage,tempObj.posX,tempObj.posY);
        }
}

//Using dev tools and game info renders player using different clips based on playerState	
function renderPlayer(aDev,aGame)
{    
    tempImage = aDev.images.getImage("player")
    temp = aGame.player;
    
    switch(aGame.playState)
    {
        case playStates.AVOID:
        {          
            aGame.player.state = playStates.AVOID;
            aDev.renderClip(tempImage,temp.posX,temp.posY,temp.width,temp.height,temp.state); 
        }
        break;
        case playStates.SHIELD:
        {         
            aGame.player.state = playStates.SHIELD;
            aDev.renderClip(tempImage,temp.posX,temp.posY,temp.width,temp.height,temp.state);  
        }
        break; 
        case playStates.SHOOT:
        {         
            aGame.player.state = playStates.SHOOT;
            aDev.renderClip(tempImage,temp.posX,temp.posY,temp.width,temp.height,temp.state);
        }
        break; 
        case playStates.SUPER:
        {         
            aGame.player.state = playStates.SUPER;
            aDev.renderClip(tempImage,temp.posX,temp.posY,temp.width,temp.height,temp.state); 
        }
        break; 
        case playStates.DEATH:
        {         
            aGame.player.state = playStates.DEATH;
            aDev.renderClip(tempImage,temp.posX,temp.posY,temp.width,temp.height,temp.state); 
        }
        break;      
    }   
}

	
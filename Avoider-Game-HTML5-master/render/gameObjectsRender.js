//big part of update cycle with in gameloop, basiclly the rendering part
//based on there positions  
//no game logic should be called in here some for placment of objects maybe
//called from controller 

function renderGameObjects(aDev, aGame)
{   
    //canvas render stuff//const thing bug for fillstyle
    aDev.ctx.fillStyle = '#000';
    aDev.ctx.fillRect(0, 0, aGame.canvasWidth, aGame.canvasHeight);
        
    //use game state to dictate what should render
    switch(aGame.state)
    {
        case gameStates.INIT://init-gameState
        {    
            //set up props background and title bar/splash screen no render of any game objects
            aDev.renderImage(aDev.images.getImage("background"), aGame.backGround.posX, aGame.backGround.posY);          
            aDev.centerImage(aDev.images.getImage("splash"), aGame.splashScreen.posX, aGame.splashScreen.posX);      
        }
        break;
        
        case gameStates.PLAY://play-gameState	
        {          
            //set up props background and then renders all game objects during play
            aDev.renderImage(aDev.images.getImage("background"), aGame.backGround.posX, aGame.backGround.posY);
            renderNPCSprites(aDev, aGame);
            renderBullets(aDev, aGame);
            renderPlayer(aDev, aGame);           
        }
        break;

        case gameStates.PAUSE://pause-state
        {            
            //set up props background and pause screen, no render of player
            aDev.renderImage(aDev.images.getImage("background"), aGame.backGround.posX, aGame.backGround.posY);
            aDev.centerImage(aDev.images.getImage("pause"), aGame.pauseScreen.posX, aGame.pauseScreen.posX);            
        }
        break;

        case gameStates.WIN://Win-gameState
        {
            ////something some day (nobody wins ha ha)
        }
        break;

        case gameStates.LOSE://Lose-gameState
        {	
            //set up props background and die screen, then shows dead player
            aDev.renderImage(aDev.images.getImage("background"), aGame.backGround._posX, aGame.backGround.posY);            
            aDev.centerImage(aDev.images.getImage("die"), aGame.dieScreen.posX, aGame.dieScreen.posX);
            renderPlayer(aDev, aGame);
        }
        break;

        default:		
    }	
}

// Wrap it in a Layer
const gameObjectsLayer = new Layer("GameObjects", renderGameObjects);
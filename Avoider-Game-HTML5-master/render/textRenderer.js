//big part of update cycle with in gameloop, basiclly the rendering text part
//based on there positions text will be shown based on what game state we are in 
//no game logic should be called in here some for placment of objects maybe
//called from controller in the update function
// gotta fix some magic numbers
function renderText(aDev,aGame)
{
    aDev.setFont("bold 14pt Calibri");
    aDev.colorText("white");
    
    //use game state to dictate what should text should render

    switch(aGame.state)
    {
        case gameStates.INIT://init-gameState
        {         
            //text to help player out
            aDev.centerTextX("CATCH  FIRE  BALLS  TO  GET  AMMO",aDev.canvas.height-150);
            aDev.centerTextX("USE  SPACE-BAR  TO  FIRE",aDev.canvas.height-100);
            aDev.centerTextX("PRESS  THE  SPACE-BAR  TO  START",aDev.canvas.height-50);
        }
        break;
        
        case gameStates.PLAY://play-gameState	
        {
            aDev.colorText("red");//changes color of font until its changed           
            ////HUD            
            aDev.centerTextX("Score :  "+ aGame.score.toString(),aDev.canvas.height-25);
            aDev.putText("Ammo :  "+ aGame.ammo.toString(),25,aDev.canvas.height-25);
            aDev.putText("Lives :  "+ aGame.lives.toString(),500,aDev.canvas.height-25);	  
        }
        break;

        case gameStates.PAUSE://pause-state
        {
            aDev.colorText("white");//font will be this color untill changed
            //text to help player out
            aDev.centerTextX("PRESS  P  TO  RESUME  GAME",aDev.canvas.width/4,aDev.canvas.height-50);
        }
        break;
        case gameStates.WIN://Win-gameState
        {
            aDev.centerTextX("PRESS  THE  R  KEY  TO  PLAY",aDev.canvas.width/4,aDev.canvas.height-50);
        }
        break;
        //die or game over text
        case gameStates.LOSE://Lose-gameState
        {	            
            if(aGame.lives <= 0)
            {				
                aDev.centerTextX("SORRY  YOU  LOST,  PRESS  R  TO  RETRY",aDev.canvas.width/4,aDev.canvas.height-50);
            }
            else
            {
                aDev.centerTextX("SORRY  YOU  DIED,  PRESS  R  TO  REVIVE",aDev.canvas.width/4,aDev.canvas.height-50);
            }            
        }
        break;
        default:		
    }	
}
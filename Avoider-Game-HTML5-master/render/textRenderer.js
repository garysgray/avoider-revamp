//big part of update cycle with in gameloop, basiclly the rendering text part
//based on there positions text will be shown based on what game state we are in 
//no game logic should be called in here some for placment of objects maybe
//called from controller in the update function
// gotta fix some magic numbers


const layout = {
    initTextY: [0.7, 0.75, 0.8, 0.85],   // percentages from top for INIT instructions
    hudY: 0.95,                     // 5% from top for HUD
    hudAmmoX: 0.05,                  // 5% from left
    hudLivesX: 0.85,                 // 85% from left
    pauseY: 0.65,                    // 75% from top
    winLoseY: 0.65                   // same as pause for WIN/LOSE
};

function renderText(aDev, aGame)
{
    const cw = aDev.canvas.width;
    const ch = aDev.canvas.height;
    const fontSize = 16; // in pts

    aDev.setFont(`bold ${fontSize}pt Calibri`);
    aDev.colorText("white");
    
    //use game state to dictate what should text should render

    switch(aGame.state)
    {
        case gameStates.INIT://init-gameState
        {         
           layout.initTextY.forEach((pct, idx) => {
                const msg = [
                    "SHOOT THE ORBS!!!",
                    "CATCH FIRE BALLS TO GET AMMO",
                    "USE SPACE-BAR TO FIRE",
                    "PRESS THE SPACE-BAR TO START"
                ][idx];
                aDev.centerTextOnY(msg, ch * pct);
            });
            break;
        }
        break;
        
        case gameStates.PLAY://play-gameState	
        {
            aDev.colorText("red");
            aDev.centerTextOnY("Score: " + aGame.score, ch * layout.hudY);
            aDev.putText("Ammo: " + aGame.ammo, cw * layout.hudAmmoX, ch * layout.hudY);
            aDev.putText("Lives: " + aGame.lives, cw * layout.hudLivesX, ch * layout.hudY);	  
        }
        break;

        case gameStates.PAUSE:
            aDev.colorText("white");
            aDev.centerTextOnY("PRESS P TO RESUME GAME", ch * layout.pauseY);
            break;

        case gameStates.WIN:
            aDev.centerTextOnY("PRESS R TO PLAY AGAIN", ch * layout.winLoseY);
            break;

        //die or game over text
        case gameStates.LOSE://Lose-gameState
        {	            
            if(aGame.lives <= 0)
            {				
                aDev.centerTextOnY("SORRY  YOU  LOST,  PRESS  R  TO  RETRY", ch * layout.winLoseY);
            }
            else
            {
                aDev.centerTextOnY("SORRY  YOU  DIED,  PRESS  R  TO  REVIVE", ch * layout.winLoseY);
            }            
        }
        break;
        default:		
    }	
}
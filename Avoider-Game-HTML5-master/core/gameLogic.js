//big part of update cycle with in gameloop, basiclly the updating game logic part
//game objects will be updated based on what game state they  are in 
//user input is also update here
//this update is called from controller in the update function

function update(aDev,aGame,aDT)
{		
    switch(aGame.state)
    {
        case gameStates.INIT:
        {
            //this is how to reset the whole map and back to play state
            aGame.setGame(aDev);           
            //check to see if player has used input to start game
            
            if(aDev.keys.isKeyPressed(aGame.gameConsts.PLAY_KEY))////spacebar key
            {
                //then change the state accordinly
                aGame.state = gameStates.PLAY;
            }
        }
        break;

        case gameStates.PLAY:
        {        

            //if the player has gotten a fire ammo they should be able to shoot now
            if(aGame.playState == playStates.SHOOT)
            {
                //this is used to have an event like shooting something when player hits mouse button
                checkUserInput(aDev,aGame); 
            }
            //changes state of game when player uses input to pause game which takes us to something else
            checkforPause(aDev,aGame);
        
            //**UPDATE Player**
            aGame.player.update(aDev,aDT);
            aGame.player.borderCheck(aDev);
            // Manage the shield timer:
            // If the timer is active, update it with the elapsed time (aDT).
            // When the timer finishes, automatically switch the player from SHIELD to AVOID mode.      
            if(aGame.timer.active)
            {
                if(aGame.timer.update(aDT))
                {
                 aGame.playState = playStates.AVOID;
                }
            }
            
            //**UPDATE NPC OBJECTS*           
            updateNPCSprites(aDev,aGame,aDT);
            updateProjectiles(aDev,aGame,aDT);
                      
            //if player is not in shield mode then we apply collisions
            if(aGame.playState != playStates.SHIELD)
            {    
                //**UPDATE COLLISIONS FUNCTIONS**
                if(check_NPC_Collision(aDev,aGame)==false)
                {
                    aGame.holdX = aGame.player.posX;
                    aGame.holdY = aGame.player.posY;
                }
            }
        }
        break;

        case gameStates.PAUSE:
        {
            //during pause hold player position set sheild time and wait for key press        
            if(aDev.keys.isKeyReleased(aGame.gameConsts.PAUSE_KEY))//P-key
            {	
                aGame.player.posX = aGame.holdX;
                aGame.player.posY = aGame.holdY;                
                aGame.playState = playStates.SHIELD
                aGame.timer.reset(aGame.gameConsts.SHIELD_TIME);
                aGame.state = gameStates.PLAY;
            }
            //little cheat to restart game
            if(aDev.keys.isKeyDown(aGame.gameConsts.RESET_KEY))//R-key
            {
                aGame.state = gameStates.INIT;
            }
        }
        break;
        
        case gameStates.WIN:
        {
            //check to see if player has used input to restart game
            if(aDev.keys.isKeyDown(aGame.gameConsts.RESET_KEY))//R-key
            {
                aGame.state = gameStates.INIT;
            }
        }
        break;
        
        case gameStates.LOSE:
        {	
            //this is to hold the image of the player in last location after dying
            //its to help show the death image in there location of death on screen
            aGame.player.posX = aGame.holdX;
            aGame.player.posY = aGame.holdY; 
            
            //based on how many lives game over or player just dies
            if(aGame.lives <= 0)
            {                
                //check to see if player has used input to restart game
                if(aDev.keys.isKeyDown(aGame.gameConsts.RESET_KEY))//R-key
                {
                    aGame.state = gameStates.INIT;      
                }
            }
            else
            {
                //check to see if player has used input to respawn player
                if(aDev.keys.isKeyDown(aGame.gameConsts.RESET_KEY))//R-key
                {
                    //clear all objects (orbs) out of arrays so that there is a fresh screen next round
                    //projectiles are cleared when they hit an object or go off screen
                    aGame.emptyAmmo();
                    aGame.gameSprites.clearObjects();
                    aGame.state = gameStates.PLAY;
                    aGame.timer.reset(aGame.gameConsts.SHIELD_TIME);
                    aGame.playState = playStates.SHIELD;
                }
            }
        }
        break;
  
        default:
    }
}

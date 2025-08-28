//big part of update cycle with in gameloop, basiclly the updating game logic part
//game objects will be updated based on what game state they  are in 
//user input is also update here
//this update is called from controller in the update function

function updateGameLogic(device, game, delta)
{		
    switch(game.state)
    {
        case gameStates.INIT:
        {
            //this is how to reset the whole map and back to play state
            game.setGame(device);           
            //check to see if player has used input to start game
            
            if(device.keys.isKeyPressed(game.gameConsts.PLAY_KEY))////spacebar key
            {
                //then change the state accordinly
                game.state = gameStates.PLAY;
            }
        }
        break;

        case gameStates.PLAY:
        {        

            //if the player has gotten a fire ammo they should be able to shoot now
            if(game.playState == playStates.SHOOT)
            {
                //this is used to have an event like shooting something when player hits mouse button
                checkUserInput(device, game); 
            }
            //changes state of game when player uses input to pause game which takes us to something else
            checkforPause(device, game);
        
            //**UPDATE Player**
            game.player.update(device, delta);
            game.player.borderCheck(device);
            // Manage the shield timer:
            // If the timer is active, update it with the elapsed time (delta).
            // When the timer finishes, automatically switch the player from SHIELD to AVOID mode.      
            if(game.timer.active)
            {
                if(game.timer.update(delta))
                {
                 game.playState = playStates.AVOID;
                }
            }
            
            //**UPDATE NPC OBJECTS*           
            updateNPCSprites(device, game, delta);
            updateProjectiles(device, game, delta);
                      
            //if player is not in shield mode then we apply collisions
            if(game.playState != playStates.SHIELD)
            {    
                //**UPDATE COLLISIONS FUNCTIONS**
                if(check_NPC_Collision(device, game)==false)
                {
                    game.holdX = game.player.posX;
                    game.holdY = game.player.posY;
                }
            }
        }
        break;

        case gameStates.PAUSE:
        {
            //during pause hold player position set sheild time and wait for key press        
            if(device.keys.isKeyReleased(game.gameConsts.PAUSE_KEY))//P-key
            {	
                game.player.posX = game.holdX;
                game.player.posY = game.holdY;                
                game.playState = playStates.SHIELD
                game.timer.reset(game.gameConsts.SHIELD_TIME);
                game.state = gameStates.PLAY;
            }
            //little cheat to restart game
            if(device.keys.isKeyDown(game.gameConsts.RESET_KEY))//R-key
            {
                game.state = gameStates.INIT;
            }
        }
        break;
        
        case gameStates.WIN:
        {
            //check to see if player has used input to restart game
            if(device.keys.isKeyDown(game.gameConsts.RESET_KEY))//R-key
            {
                aGame.state = gameStates.INIT;
            }
        }
        break;
        
        case gameStates.LOSE:
        {	
            //this is to hold the image of the player in last location after dying
            //its to help show the death image in there location of death on screen
            game.player.posX = game.holdX;
            game.player.posY = game.holdY; 
            
            //based on how many lives game over or player just dies
            if(game.lives <= 0)
            {                
                //check to see if player has used input to restart game
                if(device.keys.isKeyDown(game.gameConsts.RESET_KEY))//R-key
                {
                    game.state = gameStates.INIT;      
                }
            }
            else
            {
                //check to see if player has used input to respawn player
                if(device.keys.isKeyDown(game.gameConsts.RESET_KEY))//R-key
                {
                    //clear all objects (orbs) out of arrays so that there is a fresh screen next round
                    //projectiles are cleared when they hit an object or go off screen
                    game.emptyAmmo();
                    game.gameSprites.clearObjects();
                    game.state = gameStates.PLAY;
                    game.timer.reset(game.gameConsts.SHIELD_TIME);
                    game.playState = playStates.SHIELD;
                }
            }
        }
        break;
  
        default:
    }
}

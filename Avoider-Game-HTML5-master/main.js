//values for gameloop
const FRAME_RATE = 1000;	
var time = 0;

//make game object that loads game data
var myGame = new Game();

//controller helps set things up and directs how things should work using game
var myControl = new Controller(myGame.gameConsts.screenWidth, myGame.gameConsts.screenHeight);

//init the actual game using controller 
myControl.initGame(myGame);

//this is how we do the game loop 
function gameLoop() 
{
    window.requestAnimationFrame(gameLoop);
    var now = new Date().getTime();
    var dt = (now - (time || now))/FRAME_RATE;
	myControl.updateGame(myGame, dt);
    time = now;
    
	//***DEBUGING text lines example
    //myControl.m_Dev.debugText(myGame.playState,50,50);
}

//run it
gameLoop();


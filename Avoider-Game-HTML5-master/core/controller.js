//I like having a controller it helps when developing and then later relocate to a better place
//for example one could have 2 game objects running and controller is where one could delegate the updates to run both
class Controller
{
    constructor(newWidth,newHeight)
    {
        //our controller has a device object to control the HTML5 Canvas
        this._dev = new Device(newWidth,newHeight);
        //key events are wrapped in the device object as well, this sets them up
        this._dev.initKeys();
    }
    //getter of the device object
    get dev(){return this._dev;}
    
    //get game using device object
    initGame(aGame)
	{
		aGame.initGame(this._dev);
	}
    
    //update game logic and then render game objects and game text
    updateGame(aGame,aDT)
    {
        update(this._dev,aGame,aDT)
        renderGameObjects(this._dev,aGame,aDT)
        renderText(this._dev,aGame,aDT)
    }
}

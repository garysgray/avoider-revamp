//lot of stuff in here most info is related to the game as a whole 
//game data that helps game objects know where to be and what to do..
//assets, consts for image placments, game objects ect ect ..
//a few functions mainly for set up.


//state objects help keep track of what should happen or what assets get used during differnt points of game
const gameStates = { INIT: 0, PLAY: 1, PAUSE: 2, WIN:3, LOSE:4};
const playStates = {AVOID:0, SHIELD:1, SHOOT:2 ,SUPER: 3, DEATH:4};

class Game
{
    constructor()
    {
        this._state = gameStates.INIT; //init
        this._score = 0;
        this._lives = 0;
        this._ammo = 0;
        this._gameConsts = new GameConsts();
        this._canvasWidth = this._gameConsts.screenWidth;
        this._canvasHeight = this._gameConsts.screenHeight;
        this._player = new Player(32, 29, 100, 100);        
        this._playState = playStates.AVOID;        
        this._backGround = new BackDrop(600, 600, 0, 0);
        this._splashScreen = new BackDrop(400, 100,this._canvasWidth*.5,this._canvasHeight*.5);
        this._pauseScreen = new BackDrop(400, 100,this._canvasWidth*.5,this._canvasHeight*.5);
        this._dieScreen = new BackDrop(400, 100,this._canvasWidth*.5,this._canvasHeight*.5);
        this._projectiles = new ObjHolder();
        this._gameSprites = new ObjHolder();            
        this._timer = new Timer(1000);
        this._holdX = 0;
        this._holdY = 0;
    }
    
    //get functions
    get state(){return this._state;}
    get score(){return this._score;}
    get lives(){return this._lives;}
    get ammo(){return this._ammo;}
    get gameConsts(){return this._gameConsts;}
    get player(){return this._player;}   
    get playState(){return this._playState;}
    get backGround(){return this._backGround;}
    get splashScreen(){return this._splashScreen;}
    get pauseScreen(){return this._pauseScreen;}
    get dieScreen(){return this._dieScreen;}
    get projectiles(){return this._projectiles;}
    get gameSprites(){return this._gameSprites;}
    get timer(){return this._timer;}   
    get holdX(){return this._holdX;}
    get holdY(){return this._holdY;}
    
    //set Functions
    set state(newState){this._state = newState;}
    set playState(newState){this._playState = newState;}   
    set holdX(newX){this._holdX = newX;}
    set holdY(newY){this._holdY = newY;}
    
    emptyAmmo(){this._ammo =0;}    
    increaseAmmo(amount){this._ammo += amount;}
    decreaseAmmo(amount){this._ammo -= amount;}
    decreaseLives(amount){this._lives -= amount;}
    increaseScore(amount){this._score += amount;}
    
    //place where we set up game where we need a device to establish assets    
    initGame(aDev)
	{
		aDev.images.addImage("assets/sprites/bullet.png", "bullet");
        aDev.images.addImage("assets/sprites/orb.png", "orb");
		aDev.images.addImage("assets/sprites/fire.png", "fireAmmo");
        aDev.images.addImage("assets/sprites/ships.png", "player");
        aDev.images.addImage("assets/sprites/stars.png", "background");
        aDev.images.addImage("assets/sprites/splash.png", "splash");
		aDev.images.addImage("assets/sprites/pause.png", "pause");
        aDev.images.addImage("assets/sprites/die.png", "die");
        
        aDev.audio.addSound("hit", "assets/sounds/hit.wav");
        aDev.audio.addSound("shoot", "assets/sounds/shoot.wav");
        aDev.audio.addSound("get", "assets/sounds/get.wav");
        aDev.audio.addSound("hurt", "assets/sounds/hurt.wav");	
	}
    
    //set up game values each time game starts
    setGame(aDev)
	{
		this._score = 0;
		this._lives = 5;
		this._gameSprites.clearObjects();
		this._player.movePos(250, 250);
        this._playState = playStates.AVOID;
        this._ammo = 0;
        this.setMouseToPlayer(aDev, this._player);
    }
    
    //this is used when the game needs an object (player) bounded to mouses location
	setMouseToPlayer(aDev, aPlayer)
	{
		aDev.setupMouse(aPlayer, aDev);
	}  
}
//Its a bit wierd but it helps me keep key const in one place that I can add
//genrally help with game play and tweeking things
class GameConsts
{
    constructor()
    {
        this._BULLET_SPEED = 550;
        this._ORB_SPEED = 200;
        this._SHIELD_TIME = 3;
        this._PLAY_KEY = "Space";
        this._RESET_KEY = "KeyR";
        this._PAUSE_KEY = "KeyP";
        this._SCREEN_WIDTH = 600;
        this._SCREEN_HEIGHT = 600;
        this._AMMO_AMOUNT = 10;
        this._SCORE_INCREASE_VALUE = 10;
        this._BUFFER_1 = 10;
        this._BUFFER_2 = 20;
        this._RND_RATIO = 20;
    }
    //getters
    get bulletSpeed(){return this._BULLET_SPEED;}
    get orbSpeed(){return this._ORB_SPEED;}
    get shieldTime(){return this._SHIELD_TIME;}
    get playKey(){return this._PLAY_KEY;}
    get resetKey(){return this._RESET_KEY;}
    get pauseKey(){return this._PAUSE_KEY;}
    get screenWidth(){return this._SCREEN_WIDTH;}
    get screenHeight(){return this._SCREEN_HEIGHT;}
    get ammoAmount(){return this._AMMO_AMOUNT;}
    get scoreIncreaseAmount(){return this._SCORE_INCREASE_VALUE;}        
    get buffer1(){return this._BUFFER_1;}
    get buffer2(){return this._BUFFER_2;}
    get rndRatio(){return this._RND_RATIO;}
  
}


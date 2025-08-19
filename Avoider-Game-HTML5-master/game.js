//lot of stuff in here most info is related to the game as a whole 
//game data that helps game objects know where to be and what to do..
//assets, consts for image placments, game objects ect ect ..
//a few functions mainly for set up.

//Central constants
class GameConsts {
    #BULLET_SPEED = 550;
    #ORB_SPEED = 200;
    #SHIELD_TIME = 3;
    #PLAY_KEY = "Space";
    #RESET_KEY = "KeyR";
    #PAUSE_KEY = "KeyP";
    #SCREEN_WIDTH = 600;
    #SCREEN_HEIGHT = 600;
    #AMMO_AMOUNT = 10;
    #SCORE_INCREASE = 10;
    #BUFFER_1 = 10;
    #BUFFER_2 = 20;
    #RND_RATIO = 20;

    get BULLET_SPEED() { return this.#BULLET_SPEED; }
    get ORB_SPEED() { return this.#ORB_SPEED; }
    get SHIELD_TIME() { return this.#SHIELD_TIME; }
    get PLAY_KEY() { return this.#PLAY_KEY; }
    get RESET_KEY() { return this.#RESET_KEY; }
    get PAUSE_KEY() { return this.#PAUSE_KEY; }
    get SCREEN_WIDTH() { return this.#SCREEN_WIDTH; }
    get SCREEN_HEIGHT() { return this.#SCREEN_HEIGHT; }
    get AMMO_AMOUNT() { return this.#AMMO_AMOUNT; }
    get SCORE_INCREASE() { return this.#SCORE_INCREASE; }
    get BUFFER_1() { return this.#BUFFER_1; }
    get BUFFER_2() { return this.#BUFFER_2; }
    get RND_RATIO() { return this.#RND_RATIO; }
}

//state objects help keep track of what should happen or what assets get used during differnt points of game
const gameStates = { INIT: 0, PLAY: 1, PAUSE: 2, WIN: 3, LOSE: 4 };
const playStates = { AVOID: 0, SHIELD: 1, SHOOT: 2 ,SUPER: 3, DEATH: 4 };

class Game
{
    constructor()
    {
        this._state = gameStates.INIT; //init
        this._score = 0;
        this._lives = 0;
        this._ammo = 0;
        this._gameConsts = new GameConsts();
        this._canvasWidth = this.gameConsts.SCREEN_WIDTH
        this._canvasHeight = this.gameConsts.SCREEN_HEIGHT;
        this._player = new Player(32, 29, this._canvasWidth / 2, this._canvasHeight - (this._canvasHeight / 3));        
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
    set score(newScore){this._score = newScore;}
    set lives(newLives){this._lives = newLives;}
    set ammo(newAmmo){this._ammo = newAmmo;}
    
    emptyAmmo(){this._ammo = 0;}    
    increaseAmmo(amount){this._ammo += amount;}
    decreaseAmmo(amount){this._ammo -= amount;}
    decreaseLives(amount){this._lives -= amount;}
    increaseScore(amount){this._score += amount;}
    
    //place where we set up game where we need a device to establish assets    
    initGame(aDev)
	{
        const images = [
            { src: "assets/sprites/bullet.png", name: "bullet" },
            { src: "assets/sprites/orb.png", name: "orb" },
            { src: "assets/sprites/fire.png", name: "fireAmmo" },
            { src: "assets/sprites/ships.png", name: "player" },
            { src: "assets/sprites/stars.png", name: "background" },
            { src: "assets/sprites/splash.png", name: "splash" },
            { src: "assets/sprites/pause.png", name: "pause" },
            { src: "assets/sprites/die.png", name: "die" }
        ];
        images.forEach(img => aDev.images.addImage(img.src, img.name));
        
        const sounds = [
            { src: "assets/sounds/hit.wav", name: "hit" },
            { src: "assets/sounds/shoot.wav", name: "shoot" },
            { src: "assets/sounds/get.wav", name: "get" },
            { src: "assets/sounds/hurt.wav", name: "hurt" }
        ];
        sounds.forEach(snd => aDev.audio.addSound(snd.name, snd.src));
	}
    
    //set up game values each time game starts
    setGame(aDev)
	{ 
		this.score = 0;
		this.lives = 5;
        this.ammo = 0;
		this.gameSprites.clearObjects();
        this.playState = playStates.AVOID;   
        this.setMouseToPlayer(aDev, this._player);
    }
    
    //this is used when the game needs an object (player) bounded to mouses location
	setMouseToPlayer(aDev, aPlayer)
	{
		aDev.setupMouse(aPlayer, aDev);
	}  
}

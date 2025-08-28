// Game.js
// Serves as the central data hub for the game.
// - Stores core constants, dimensions, and configuration values.
// - Holds references to all fundamental game objects (player, projectiles, UI, etc).
// - Provides accessors to retrieve and update state as needed.
// Theae classwa dont run the game loop itself; instead, it acts as a
// structured container that the controller and other systems can use
// to coordinate the game’s logic.

//Central constants
class GameConsts 
{
    // ----Private fields----
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

    //----get Functions----
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

// ---- State Objects ----
const gameStates = Object.freeze({
    INIT: 0,
    PLAY: 1,
    PAUSE: 2,
    WIN: 3,
    LOSE: 4
});

const playStates = Object.freeze({
    AVOID: 0,
    SHIELD: 1,
    SHOOT: 2,
    SUPER: 3,
    DEATH: 4
});

class Game
{
    #gameConsts;
    #projectiles;
    #gameSprites;
    #timer;
    #player;
    #canvasWidth;
    #canvasHeight;
    #playState;
    #state;
    #backGround;
    #splashScreen;
    #pauseScreen;
    #dieScreen;
    #score;
    #lives;
    #ammo;
    #holdX;
    #holdY;

    constructor()
    {
        this.#gameConsts = new GameConsts();
        this.#projectiles = new ObjHolder();
        this.#gameSprites = new ObjHolder();            
        this.#timer = new Timer(1000);
        this.#player = new Player(32, 29, this.#canvasWidth / 2, this.#canvasHeight - (this.#canvasHeight / 3)); 

        this.#canvasWidth = this.#gameConsts.SCREEN_WIDTH
        this.#canvasHeight = this.#gameConsts.SCREEN_HEIGHT;
        
        this.#playState = playStates.AVOID; 
        this.#state = gameStates.INIT;
       
        this.#backGround = new BackDrop(600, 600, 0, 0);
        this.#splashScreen = new BackDrop(400, 100,this.#canvasWidth*.5,this.#canvasHeight*.5);
        this.#pauseScreen = new BackDrop(400, 100,this.#canvasWidth*.5,this.#canvasHeight*.5);
        this.#dieScreen = new BackDrop(400, 100,this.#canvasWidth*.5,this.#canvasHeight*.5);
        
        this.#score = 0;
        this.#lives = 0;
        this.#ammo = 0;   
        this.#holdX = 0;
        this.#holdY = 0;
    }
    
    //get functions

    get gameConsts(){ return this.#gameConsts; }
    get projectiles(){ return this.#projectiles; }
    get gameSprites(){ return this.#gameSprites; }
    get timer(){ return this.#timer; }
    get player(){ return this.#player; }

    get canvasWidth(){ return this.#canvasWidth; }
    get canvasHeight(){ return this.#canvasHeight; }

    get state() { return this.#state; }
    get playState(){ return this.#playState; }

    get backGround(){ return this.#backGround; }
    get splashScreen(){ return this.#splashScreen; }
    get pauseScreen(){ return this.#pauseScreen; }
    get dieScreen(){ return this.#dieScreen; }
   
    get score(){ return this.#score; }
    get lives(){ return this.#lives; }
    get ammo(){ return this.#ammo; } 
    get holdX(){ return this.#holdX; }
    get holdY(){ return this.#holdY; }
    
    //set Functions
    set state(v) { this.#state = v; }
    set score(v) { this.#score = v; }

    set playState(newState){ this.#playState = newState; }   
    set holdX(newX){ this._holdX = newX; }
    set holdY(newY){ this._holdY = newY; }

    set lives(newLives){ this.#lives = newLives; }
    set ammo(newAmmo){ this.#ammo = newAmmo; }
    
    emptyAmmo(){this._ammo = 0;}    
    increaseAmmo(amount){ this.#ammo += amount; }
    decreaseAmmo(amount){ this.#ammo -= amount; }
    decreaseLives(amount){ this.#lives -= amount; }
    increaseScore(amount){ this.#score += amount; }
    
    // ---- Game Setup ----    
   initGame(aDev)
	{
        aDev.keys.initKeys();

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
        //images.forEach(img => aDev.images.addObject(new Sprite(img.src, img.name)));
        images.forEach(img => {
        const sprite = new Sprite(img.src, img.name);
        aDev.images.addObject(sprite);
    });
        
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
        this.setMouseToPlayer(aDev, this.#player);
    }
    
    // ---- Player Mouse Binding ----
	setMouseToPlayer(aDev, aPlayer)
	{
		aDev.setupMouse(aPlayer, aDev);
	}  
}

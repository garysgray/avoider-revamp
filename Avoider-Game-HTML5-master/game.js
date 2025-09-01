// =======================================================
// Game.js
// -------------------------------------------------------
// Purpose:
// Acts as the **central data hub** for the game. 
// - Stores immutable constants (dimensions, speeds, input keys).
// - Defines enumerated game states and play modes.
// - Maintains all core state values (score, lives, ammo, etc).
// - Holds references to major objects (player, sprites, projectiles).
// - Provides controlled accessors & mutators to manage game state.
// 
// Note: This class does NOT run the game loop. Instead, it serves as 
// a structured container that other systems (like controller.js) use 
// to coordinate the game’s logic.
// =======================================================

// -----------------------------
// Global Constants
// -----------------------------
class GameConsts 
{
    // ---- Private fields ----
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

    #PLAYER_SPRITE_W = 32;
    #PLAYER_SPRITE_H = 29;

    #ORB_SPRITE_W = 29;
    #ORB_SPRITE_H = 29;

    #BULLET_SPRITE_W = 12;
    #BULLET_SPRITE_H = 12;

    #FIRE_AMMO_SPRITE_W = 20;
    #FIRE_AMMO_SPRITE_H = 20;

    #SHOOT_COOLDOWN = 0.2; // 200ms

    // ---- Getters (expose constants safely) ----
    get BULLET_SPEED()   { return this.#BULLET_SPEED; }
    get ORB_SPEED()      { return this.#ORB_SPEED; }
    get SHIELD_TIME()    { return this.#SHIELD_TIME; }

    get PLAY_KEY()       { return this.#PLAY_KEY; }
    get RESET_KEY()      { return this.#RESET_KEY; }
    get PAUSE_KEY()      { return this.#PAUSE_KEY; }

    get SCREEN_WIDTH()   { return this.#SCREEN_WIDTH; }
    get SCREEN_HEIGHT()  { return this.#SCREEN_HEIGHT; }

    get AMMO_AMOUNT()    { return this.#AMMO_AMOUNT; }
    get SCORE_INCREASE() { return this.#SCORE_INCREASE; }

    get SHOOT_COOLDOWN() { return this.#SHOOT_COOLDOWN; }

    //FIX look into getting rid or using better
    get BUFFER_1()       { return this.#BUFFER_1; }
    get BUFFER_2()       { return this.#BUFFER_2; }
    get RND_RATIO()      { return this.#RND_RATIO; }

    get PLAYER_SPRITE_W()   { return this.#PLAYER_SPRITE_W; }
    get PLAYER_SPRITE_H()  { return this.#PLAYER_SPRITE_H; }

    get ORB_SPRITE_W()   { return this.#ORB_SPRITE_W; }
    get ORB_SPRITE_H()  { return this.#ORB_SPRITE_H; }

    get BULLET_SPRITE_W()   { return this.#BULLET_SPRITE_W; }
    get BULLET_SPRITE_H()  { return this.#BULLET_SPRITE_H; }

    get FIRE_AMMO_SPRITE_W()   { return this.#FIRE_AMMO_SPRITE_W; }
    get FIRE_AMMO_SPRITE_H()  { return this.#FIRE_AMMO_SPRITE_H; }
}

// -----------------------------
// Enumerated Game States
// -----------------------------
const gameStates = Object.freeze({
    INIT: 0,    // Pre-game setup
    PLAY: 1,    // Actively playing
    PAUSE: 2,   // Paused mid-game
    WIN: 3,     // Player victory
    LOSE: 4     // Player defeat
});

const playStates = Object.freeze({
    AVOID: 0,   // Dodging orbs
    SHIELD: 1,  // Shield active
    SHOOT: 2,   // Firing bullets
    SUPER: 3,   // Powered-up state
    DEATH: 4    // Player destruction
});

const spriteTypes = Object.freeze({
    PLAYER: "player",
    ORB: "orb",
    FIRE_AMMO: "fireAmmo",
    BULLET: "bullet"
});

const soundTypes = Object.freeze({
    HIT: "hit",
    GET: "get",
    HURT: "hurt",
    SHOOT: "shoot"
});

// -----------------------------
// Game Class
// -----------------------------
class Game 
{
    // ---- Private fields ----
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

    // ---- Constructor ----
    constructor() 
    {
        // Core systems
        this.#gameConsts   = new GameConsts();
        this.#projectiles  = new ObjHolder();
        this.#gameSprites  = new ObjHolder();            
        this.#timer        = new Timer(1000);

        // Dimensions
        this.#canvasWidth  = this.#gameConsts.SCREEN_WIDTH;
        this.#canvasHeight = this.#gameConsts.SCREEN_HEIGHT;

        //FIX may be part of bug when player goes to corner
        // Player positioned near lower part of the screen
        this.#player = new Player(
            this.#gameConsts.PLAYER_SPRITE_W, this.#gameConsts.PLAYER_SPRITE_H, 
            this.#canvasWidth * .5, 
            this.#canvasHeight - (this.#canvasHeight * .15)
        ); 

        // Default states
        this.#playState = playStates.AVOID; 
        this.#state     = gameStates.INIT;
       
        //FIX magic numbers
        // UI/Background
        this.#backGround   = new BackDrop(600, 600, 0, 0);
        this.#splashScreen = new BackDrop(400, 100, this.#canvasWidth * .5, this.#canvasHeight * .5);
        this.#pauseScreen  = new BackDrop(400, 100, this.#canvasWidth * .5, this.#canvasHeight * .5);
        this.#dieScreen    = new BackDrop(400, 100, this.#canvasWidth * .5, this.#canvasHeight * .5);
        
        // Gameplay variables
        this.#score  = 0;
        this.#lives  = 0;
        this.#ammo   = 0;   
        this.#holdX  = 0;
        this.#holdY  = 0;
    }
    
    // -----------------------------
    // Accessors
    // -----------------------------
    get gameConsts()   { return this.#gameConsts; }
    get projectiles()  { return this.#projectiles; }
    get gameSprites()  { return this.#gameSprites; }
    get timer()        { return this.#timer; }
    get player()       { return this.#player; }

    get canvasWidth()  { return this.#canvasWidth; }
    get canvasHeight() { return this.#canvasHeight; }

    get state()        { return this.#state; }
    get playState()    { return this.#playState; }

    get backGround()   { return this.#backGround; }
    get splashScreen() { return this.#splashScreen; }
    get pauseScreen()  { return this.#pauseScreen; }
    get dieScreen()    { return this.#dieScreen; }

    get score()        { return this.#score; }
    get lives()        { return this.#lives; }
    get ammo()         { return this.#ammo; } 
    get holdX()        { return this.#holdX; }
    get holdY()        { return this.#holdY; }
    
    // -----------------------------
    // Mutators
    // -----------------------------
    set state(v)        { this.#state = v; }
    set score(v)        { this.#score = v; }
    set playState(v)    { this.#playState = v; }
    set holdX(v)        { this.#holdX = v; }
    set holdY(v)        { this.#holdY = v; }
    set lives(v)        { this.#lives = v; }
    set ammo(v)         { this.#ammo = v; }

    // Convenience modifiers
    emptyAmmo()         { this.#ammo = 0; }    
    increaseAmmo(a)     { this.#ammo += a; }
    decreaseAmmo(a)     { this.#ammo -= a; }
    decreaseLives(a)    { this.#lives -= a; }
    increaseScore(a)    { this.#score += a; }
    
    // -----------------------------
    // Game Setup
    // -----------------------------
    initGame(device) 
    {
        // Input
        device.keys.initKeys();

        // Load sprites
        const images = [
            { src: "assets/sprites/bullet.png", name: "bullet" },
            { src: "assets/sprites/orb.png",    name: "orb" },
            { src: "assets/sprites/fire.png",   name: "fireAmmo" },
            { src: "assets/sprites/ships.png",  name: "player" },
            { src: "assets/sprites/stars.png",  name: "background" },
            { src: "assets/sprites/splash.png", name: "splash" },
            { src: "assets/sprites/pause.png",  name: "pause" },
            { src: "assets/sprites/die.png",    name: "die" }
        ]; 
        images.forEach(img => {
            const sprite = new Sprite(img.src, img.name);
            device.images.addObject(sprite);
        });
        
        // Load sounds
        const sounds = [
            { src: "assets/sounds/hit.wav",   name: "hit" },
            { src: "assets/sounds/shoot.wav", name: "shoot" },
            { src: "assets/sounds/get.wav",   name: "get" },
            { src: "assets/sounds/hurt.wav",  name: "hurt" }
        ];
        sounds.forEach(snd => device.audio.addSound(snd.name, snd.src));
    }
    
    // Reset values each time a game starts
    setGame(device) 
    { 
        this.score     = 0;
        this.lives     = 5;
        this.ammo      = 0;
        this.gameSprites.clearObjects();

        this.playState = playStates.AVOID;   
        this.setMouseToPlayer(device, this.#player);
    }
    
    // -----------------------------
    // Player Input Binding
    // -----------------------------
    setMouseToPlayer(device, aPlayer) 
    {
        device.setupMouse(aPlayer, device);
    }  
}

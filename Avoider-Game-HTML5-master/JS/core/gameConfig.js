// =======================================================
// gameConfig.js
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
// Game Class
// -----------------------------
class Game 
{
    // ---- Private fields ---- 
    #gameConsts;
    #projectiles;
    #gameSprites;
    #timer;
    #stopwatch;
    #player;

    #canvasWidth;
    #canvasHeight;

    #canvasHalfW;
    #canvasHalfH

    #playState;
    #gameState;

    #score;
    #lives;
    #ammo;

    #savedPlayState;

    #billBoards;

    // ---- Constructor ----
    constructor() 
    {
        // Core systems
        this.#gameConsts   = new GameConsts();
        this.#projectiles  = new ObjHolder();
        this.#gameSprites  = new ObjHolder();

        this.#billBoards   = new ObjHolder();
        //FIX hard code value            
        this.#timer        = new Timer(this.#gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN);

        this.#stopwatch    = new Timer(0, GameDefs.timerModes.COUNTUP);

        // Dimensions
        this.#canvasWidth  = this.#gameConsts.SCREEN_WIDTH;
        this.#canvasHeight = this.#gameConsts.SCREEN_HEIGHT;

        this.#canvasHalfW  = this.#canvasWidth * .5
        this.#canvasHalfH = this.#canvasHeight * .5

        this.#player = new Player(
            GameDefs.spriteTypes.PLAYER.w, GameDefs.spriteTypes.PLAYER.h, 
            this.#canvasHalfW, 
            this.#canvasHeight 
        ); 

        // Default states
        this.#playState = GameDefs.playStates.AVOID; 
        this.#gameState = GameDefs.gameStates.INIT;

        this.savedPlayState = GameDefs.playStates.AVOID;
       
        // Gameplay variables
        this.#score  = 0;
        this.#lives  = 0;
        this.#ammo   = 0;   
    }
    
    // -----------------------------
    // Accessors
    // -----------------------------
    get gameConsts()   { return this.#gameConsts; }
    get projectiles()  { return this.#projectiles; }
    get gameSprites()  { return this.#gameSprites; }

    get billBoards()  { return this.#billBoards; }

    get timer()        { return this.#timer; }
    get stopwatch()    { return this.#stopwatch; }
    get player()       { return this.#player; }

    get canvasWidth()  { return this.#canvasWidth; }
    get canvasHeight() { return this.#canvasHeight; }

    get canvasHalfW()  { return this.#canvasHalfW; }
    get canvasHalfH()  { return this.#canvasHalfH; }

    get gameState()    { return this.#gameState; }
    get playState()    { return this.#playState; }

    get score()        { return this.#score; }
    get lives()        { return this.#lives; }
    get ammo()         { return this.#ammo; } 
    
    // -----------------------------
    // Mutators
    // -----------------------------
    set gameState(v)    { this.#gameState = v; }
    set score(v)        { this.#score = v; }
    set playState(v)    { this.#playState = v; }

    set lives(v)        { this.#lives = v; }
    set ammo(v)         { this.#ammo = v; }

    get savedPlayState() { return this.#savedPlayState; }
    set savedPlayState(v) { this.#savedPlayState = v; }


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
            //have it so it loads pos data by name of image
            device.images.addObject(sprite);
        });
        
        // Load sounds
        const sounds = [
            { src: "assets/sounds/hit.wav",   name: "hit" },
            { src: "assets/sounds/shoot.wav", name: "shoot" },
            { src: "assets/sounds/get.wav",   name: "get" },
            { src: "assets/sounds/hurt.wav",  name: "hurt" }
        ];
        sounds.forEach(snd => device.audio.addSound(snd.name, snd.src, this.#gameConsts.POOLSIZE, this.#gameConsts.VOLUME));

        // load BillBoards
        const boards = [
            new BillBoard(GameDefs.billBoardTypes.BACKGROUND.type, GameDefs.billBoardTypes.BACKGROUND.w, GameDefs.billBoardTypes.BACKGROUND.h, 0, 0),
            new BillBoard(GameDefs.billBoardTypes.SPLASH.type, GameDefs.billBoardTypes.SPLASH.w, GameDefs.billBoardTypes.SPLASH.h, 0, 0),
            new BillBoard(GameDefs.billBoardTypes.PAUSE.type, GameDefs.billBoardTypes.PAUSE.w, GameDefs.billBoardTypes.PAUSE.h, 0, 0),
            new BillBoard(GameDefs.billBoardTypes.DIE.type, GameDefs.billBoardTypes.DIE.w, GameDefs.billBoardTypes.DIE.h, 0, 0),
        ];
        boards.forEach(board => 
        {
            if(board.name != GameDefs.billBoardTypes.BACKGROUND.type)
            {
                board.centerObjectInWorld(this.#gameConsts.SCREEN_WIDTH, this.#gameConsts.SCREEN_HEIGHT);
            }
            this.#billBoards.addObject(board)
        });
    }

    // Reset values each time a game starts
    setGame(device) 
    { 
        this.score     = 0;
        this.lives     = this.#gameConsts.GAME_LIVES_START_AMOUNT;
        this.ammo      = 0;
        this.gameSprites.clearObjects();

        this.setPlayState(GameDefs.playStates.AVOID);
        this.setMouseToPlayer(device, this.#player);
        this.stopwatch.start();
    }
    
    // -----------------------------
    // Player Input Binding
    // -----------------------------
    setMouseToPlayer(device, aPlayer) 
    {
        device.setupMouse(aPlayer, device);
    }  

    savePlayState(state)
    {
        this.#savedPlayState = state;
    }

    restorePlayState()
    {
        this.#playState = this.#savedPlayState;
    }

    setGameState(state)
    {
        this.#gameState = state;
    }

    setPlayState(playstate)
    {
        this.#playState = playstate;
    }
}

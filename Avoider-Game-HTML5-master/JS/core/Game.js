// =======================================================
// gameConfig.js
// -------------------------------------------------------
// Central data hub for the game.
// - Stores immutable constants (dimensions, speeds, keys)
// - Defines enumerated game states and play modes
// - Maintains core state values (score, lives, ammo, etc)
// - Holds references to major objects (player, sprites, projectiles)
// - Provides controlled accessors & mutators for game state
//
// Note: Does NOT run the game loop — serves as a structured
// container that other systems (controller.js) use to coordinate.
// =======================================================

class Game 
{
    // ---- Private fields ----
    #gameConsts;
    #projectiles;
    #gameSprites;
    #billBoards;
    #gameTimers;
    #canvasWidth;
    #canvasHeight;
    #canvasHalfW;
    #canvasHalfH;
    #gameState;
    #score;
    #lives;
    #ammo;
    #npcSpeedMultiplyer;
    #npcSpawnMultiplyer;
    #player;

    constructor() 
    {
        try 
        {
            this.#gameConsts  = new GameConsts();
            this.#projectiles = new ObjHolder();
            this.#gameSprites = new ObjHolder();
            this.#billBoards  = new ObjHolder();
            this.#gameTimers  = new ObjHolder();
        }
        catch (err) { console.error("Failed to initialize object holders:", err); }

        this.#canvasWidth  = this.#gameConsts.SCREEN_WIDTH;
        this.#canvasHeight = this.#gameConsts.SCREEN_HEIGHT;
        this.#canvasHalfW  = this.#canvasWidth  * 0.5;
        this.#canvasHalfH  = this.#canvasHeight * 0.5;

        this.#gameState          = GameDefs.gameStates.INIT;
        this.#score              = 0;
        this.#lives              = 0;
        this.#ammo               = 0;
        this.#npcSpeedMultiplyer = 0;
        this.#npcSpawnMultiplyer = 0;

        try 
        {
            this.#player = new Player(
                GameDefs.spriteTypes.PLAYER.w,
                GameDefs.spriteTypes.PLAYER.h,
                this.#canvasHalfW,
                this.#canvasHeight,
                0
            );
        }
        catch (err) { console.error("Failed to initialize player:", err); }
    }

    // ---- Accessors ----
    get gameConsts()          { return this.#gameConsts; }
    get projectiles()         { return this.#projectiles; }
    get gameSprites()         { return this.#gameSprites; }
    get billBoards()          { return this.#billBoards; }
    get gameTimers()          { return this.#gameTimers; }
    get canvasWidth()         { return this.#canvasWidth; }
    get canvasHeight()        { return this.#canvasHeight; }
    get canvasHalfW()         { return this.#canvasHalfW; }
    get canvasHalfH()         { return this.#canvasHalfH; }
    get gameState()           { return this.#gameState; }
    get score()               { return this.#score; }
    get lives()               { return this.#lives; }
    get ammo()                { return this.#ammo; }
    get npcSpeedMuliplyer()   { return this.#npcSpeedMultiplyer; }
    get npcSpawnMultiplyer()  { return this.#npcSpawnMultiplyer; }
    get player()              { return this.#player; }

    // ---- Mutators ----
    set gameState(v)           { this.#gameState = v; }
    set score(v)               { this.#score = v; }
    set lives(v)               { this.#lives = v; }
    set ammo(v)                { this.#ammo = v; }
    set npcSpeedMuliplyer(v)   { this.#npcSpeedMultiplyer = v; }
    set npcSpawnMultiplyer(v)  { this.#npcSpawnMultiplyer = v; }

    emptyAmmo()       { this.#ammo = 0; }
    increaseAmmo(a)   { this.#ammo   += a; }
    decreaseAmmo(a)   { this.#ammo   -= a; }
    decreaseLives(a)  { this.#lives  -= a; }
    increaseScore(a)  { this.#score  += a; }
    setGameState(s)   { this.#gameState = s; }

    // ---- Game Setup ----
    initGame(device) 
    {
        try 
        {
            device.keys.initKeys();

            // Load sprite assets
            Object.values(GameDefs.spriteTypes).forEach(def => 
            {
                if (!def.path) return;
                try { device.images.addObject(new Sprite(def.path, def.name)); }
                catch (err) { console.error(`Failed to load sprite "${def.name}":`, err); }
            });

            // Load billboard assets
            Object.values(GameDefs.billBoardTypes).forEach(def => 
            {
                if (!def.path) return;
                try { device.images.addObject(new Sprite(def.path, def.name)); }
                catch (err) { console.error(`Failed to load billboard "${def.name}":`, err); }
            });

            // Initialize billboards
            const { BACKGROUND, HUD, SPLASH } = GameDefs.billBoardTypes;
            const boards = 
            [
                new ParallaxBillBoard(BACKGROUND.name, BACKGROUND.w, BACKGROUND.h, 0, 0, 60, BACKGROUND.isCenter, GameDefs.parallexType.VERICAL),
                new BillBoard(HUD.name,    HUD.w,    HUD.h,    0, 0, 0, HUD.isCenter),
                new BillBoard(SPLASH.name, SPLASH.w, SPLASH.h, 0, 0, 0, SPLASH.isCenter),
            ];
            boards.forEach(board => 
            {
                try 
                {
                    board.centerObjectInWorld(this.#gameConsts.SCREEN_WIDTH, this.#gameConsts.SCREEN_HEIGHT);
                    this.#billBoards.addObject(board);
                }
                catch (err) { console.error(`Failed to add board "${board.name}":`, err); }
            });

            // Load sounds
            Object.values(GameDefs.soundTypes).forEach(def => 
            {
                if (!def.path) return;
                try { device.audio.addSound(def.name, def.path, this.gameConsts.POOLSIZE, this.gameConsts.VOLUME); }
                catch (err) { console.error(`Failed to add sound "${def.name}":`, err); }
            });

            // Initialize timers
            const timers = 
            [
                new Timer(GameDefs.timerTypes.SHIELD_TIMER, this.#gameConsts.SHIELD_TIME, GameDefs.timerModes.COUNTDOWN),
                new Timer(GameDefs.timerTypes.GAME_CLOCK,   0,                            GameDefs.timerModes.COUNTUP),
            ];
            timers.forEach(timer => 
            {
                try { this.#gameTimers.addObject(timer); }
                catch (err) { console.error("Failed to add timer:", err); }
            });
        }
        catch (err) { console.error("Error in initGame:", err); }
    }

    // Reset values each time a new game starts
    setGame(device) 
    {
        this.score  = 0;
        this.lives  = this.#gameConsts.GAME_LIVES_START_AMOUNT;
        this.ammo   = 0;

        this.gameSprites.clearObjects();
        this.projectiles.clearObjects();

        this.npcSpeedMuliplyer  = 0;
        this.npcSpawnMultiplyer = 0;

        this.player.setPlayerState(GameDefs.playStates.AVOID);
        this.player.setMouseToPlayer(device);
        this.gameTimers.getObjectByName(GameDefs.timerTypes.GAME_CLOCK).start();

        device.audio.playSoundLooping(GameDefs.soundTypes.SPACE.name);
    }
}
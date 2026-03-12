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

        this.#gameState          = gameStates.INIT;
        this.#score              = 0;
        this.#ammo               = 0;
        this.#npcSpeedMultiplyer = 0;
        this.#npcSpawnMultiplyer = 0;

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
    get ammo()                { return this.#ammo; }
    get npcSpeedMuliplyer()   { return this.#npcSpeedMultiplyer; }
    get npcSpawnMultiplyer()  { return this.#npcSpawnMultiplyer; }
    get player()              { return this.#player; }

    // ---- Mutators ----
    set gameState(v)           { this.#gameState = v; }
    set score(v)               { this.#score = v; }
    set ammo(v)                { this.#ammo = v; }
    set npcSpeedMuliplyer(v)   { this.#npcSpeedMultiplyer = v; }
    set npcSpawnMultiplyer(v)  { this.#npcSpawnMultiplyer = v; }
    set player(v)    { this.#player = v; }

    emptyAmmo()       { this.#ammo    = 0; }
    increaseAmmo(a)   { this.#ammo   += a; }
    decreaseAmmo(a)   { this.#ammo   -= a; }
    increaseScore(a)  { this.#score  += a; }
    setGameState(s)   { this.#gameState = s; }

    // ---- Game Setup ----
    initGame(device) 
{
    try 
    {
        device.keys.initKeys();

        // Load images
        device.setImagesForType(playerSpriteTypes);
        device.setImagesForType(spriteTypes);

        // Load billboards — image + board object together
        device.setImagesForType(billBoardTypes, boardDef => 
        {
            const board = boardDef.name === billBoardTypes.BACKGROUND.name
                //? new ParallaxBillBoard(boardDef.name, boardDef.w, boardDef.h, 0, 0, 60, boardDef.isCenter, parallexEnum.VERTICLE)
                //? new CircularParallaxBillBoard(boardDef.name, boardDef.w, boardDef.h, 0, 0, 60, boardDef.isCenter, 0.2)
                ? new CircularParallaxBillBoard(boardDef.name, boardDef.w, boardDef.h, 0, 0, 175, boardDef.isCenter, parallexEnum.VERTICLE, 
                {
                    holdDuration: 6,
                    rotateSpeed:  0.5,
                    rotateAmount: 20
                })
                : new BillBoard(boardDef.name, boardDef.w, boardDef.h, 0, 0, 0, boardDef.isCenter);

            board.centerObjectInWorld(this.#gameConsts.SCREEN_WIDTH, this.#gameConsts.SCREEN_HEIGHT);
            this.#billBoards.addObject(board);
        });

        // Load sounds
        Object.values(soundTypes).forEach(def =>
        {
            if (!def.path) return;
            device.audio.addSound(def.name, def.path, this.#gameConsts.POOLSIZE, this.#gameConsts.VOLUME);
        });

        // Initialize timers
        const timers =
        [
            new Timer(timerTypes.SHIELD_TIMER,          this.#gameConsts.SHIELD_TIME, timerModes.COUNTDOWN),
            new Timer(timerTypes.SHOOT_COOL_DOWN_TIMER, 0,                            timerModes.COUNTDOWN),
            new Timer(timerTypes.GAME_CLOCK,            0,                            timerModes.COUNTUP),
        ];
        timers.forEach(timer => this.#gameTimers.addObject(timer));
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

        this.player = Player.buildPlayer();

        this.player.setPlayerState(playStates.AVOID);
        this.player.setMouseToPlayer(device);
        this.gameTimers.getObjectByName(timerTypes.GAME_CLOCK).start();

        device.audio.playSoundLooping(soundTypes.SPACE.name);

        const bg = this.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
        if (bg) bg.reset();
    }
}
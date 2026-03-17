// ============================================================================
// Game.js
// Central data hub for the game.
// Stores constants, state, collections, and provides controlled accessors.
// Does NOT run the game loop — used by GameController to coordinate systems.
// ============================================================================

class Game
{
    // ---- Private Fields -----------------------------------------------------

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
        this.#canvasHalfW  = this.#canvasWidth  * this.#gameConsts.CENTER;
        this.#canvasHalfH  = this.#canvasHeight * this.#gameConsts.CENTER;

        this.#gameState          = gameStates.INIT;
        this.#score              = this.#gameConsts.START_SCORE;
        this.#ammo               = this.#gameConsts.START_AMMO;
        this.#npcSpeedMultiplyer = this.#gameConsts.START_MULTIPLIER;
        this.#npcSpawnMultiplyer = this.#gameConsts.START_MULTIPLIER;
    }

    // ---- Getters ------------------------------------------------------------

    get gameConsts()         { return this.#gameConsts; }
    get projectiles()        { return this.#projectiles; }
    get gameSprites()        { return this.#gameSprites; }
    get billBoards()         { return this.#billBoards; }
    get gameTimers()         { return this.#gameTimers; }
    get canvasWidth()        { return this.#canvasWidth; }
    get canvasHeight()       { return this.#canvasHeight; }
    get canvasHalfW()        { return this.#canvasHalfW; }
    get canvasHalfH()        { return this.#canvasHalfH; }
    get gameState()          { return this.#gameState; }
    get score()              { return this.#score; }
    get ammo()               { return this.#ammo; }
    get npcSpeedMuliplyer()  { return this.#npcSpeedMultiplyer; }
    get npcSpawnMultiplyer() { return this.#npcSpawnMultiplyer; }
    get player()             { return this.#player; }

    // ---- Setters ------------------------------------------------------------

    set gameState(v)          { this.#gameState          = v; }
    set score(v)              { this.#score              = v; }
    set ammo(v)               { this.#ammo               = v; }
    set npcSpeedMuliplyer(v)  { this.#npcSpeedMultiplyer = v; }
    set npcSpawnMultiplyer(v) { this.#npcSpawnMultiplyer = v; }
    set player(v)             { this.#player             = v; }

    // ---- Score / Ammo -------------------------------------------------------

    emptyAmmo()      { this.#ammo   = this.#gameConsts.START_AMMO; }
    increaseAmmo(a)  { this.#ammo  += a; }
    decreaseAmmo(a)  { this.#ammo  -= a; }
    increaseScore(a) { this.#score += a; }
    setGameState(s)  { this.#gameState = s; }

    // ---- Game Setup ---------------------------------------------------------

    // One-time setup — loads assets, creates billboards, registers sounds and timers
    initGame(device)
    {
        try
        {
            // Load player and NPC sprite images
            device.setImagesForType(playerSpriteTypes);
            device.setImagesForType(spriteTypes);

            // Load billboard images and create corresponding board objects
            device.setImagesForType(billBoardTypes, boardDef =>
            {
                const board = boardDef.name === billBoardTypes.BACKGROUND.name
                    ? new CircularParallaxBillBoard(
                        boardDef.name, boardDef.w, boardDef.h, 0, 0,
                        this.#gameConsts.BG_SPEED,
                        boardDef.isCenter,
                        parallaxEnum.VERTICLE,
                        {
                            holdDuration: this.#gameConsts.BG_HOLD_DURATION,
                            rotateSpeed : this.#gameConsts.BG_ROTATE_SPEED,
                            rotateAmount: this.#gameConsts.BG_ROTATE_AMOUNT,
                        })
                    : new BillBoard(boardDef.name, boardDef.w, boardDef.h, 0, 0, 0, boardDef.isCenter);

                board.centerObjectInWorld(this.#gameConsts.SCREEN_WIDTH, this.#gameConsts.SCREEN_HEIGHT);
                this.#billBoards.addObject(board);
            });

            // Register all sounds with the audio player
            AudioPlayer.loadSounds(device, this.#gameConsts.POOLSIZE, soundTypes);

            // Create and register all game timers
            const timers =
            [
                new Timer(timerTypes.SHIELD_TIMER,          this.#gameConsts.SHIELD_TIME, timerModes.COUNTDOWN),
                new Timer(timerTypes.SHOOT_COOL_DOWN_TIMER, 0,                            timerModes.COUNTDOWN),
                new Timer(timerTypes.GAME_CLOCK,            0,                            timerModes.COUNTUP),
            ];
            timers.forEach(t => this.#gameTimers.addObject(t));
        }
        catch (err) { console.error("Error in initGame:", err); }
    }

    // Resets all runtime state — called at the start of each new game
    setGame(device)
    {
        this.score = this.#gameConsts.START_SCORE;
        this.ammo  = this.#gameConsts.START_AMMO;

        // Clear all active entities
        this.gameSprites.clearObjects();
        this.projectiles.clearObjects();

        // Reset difficulty multipliers
        this.npcSpeedMultiplier   = this.#gameConsts.START_MULTIPLIER;
        this.npcSpawnMultiplyer = this.#gameConsts.START_MULTIPLIER;

        // Build and configure the player
        this.player = Player.buildPlayer();
        this.player.setPlayerState(playStates.AVOID);
        this.player.setMouseToPlayer(device);

        // Start survival clock
        this.gameTimers.getObjectByName(timerTypes.GAME_CLOCK).start();

        // Start background music and reset background rotation
        device.audio.playSoundLooping(soundTypes.SPACE.name);

        const bg = this.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
        if (bg) bg.reset();
    }
}



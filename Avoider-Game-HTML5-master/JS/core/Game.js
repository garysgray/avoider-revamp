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

    #canvasWidth;
    #canvasHeight;
    #canvasHalfW;
    #canvasHalfH;

    #player;
    #score;
    #ammo;

    #gameState;
    #stateEntered;

    #gameSprites;
    #billBoards;
    #gameTimers;
    #projectiles;
    
    #attractMode;
    #effects;

    // ---- Spawn Counts — how many spawn per timer tick -----------------------
    #droneSpawnCount;
    #ammoSpawnCount;

     #npcSpeedMultiplier;

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

        this.#gameState         = gameStates.INIT;
        this.#stateEntered      = {};
        this.#score             = this.#gameConsts.START_SCORE;
        this.#ammo              = this.#gameConsts.START_AMMO;
        this.#npcSpeedMultiplier = this.#gameConsts.START_MULTIPLIER;

        this.#effects     = new EffectManager();
        this.#attractMode = new AttractMode(this.#gameConsts);

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
    get stateEntered()       { return this.#stateEntered; }
    get score()              { return this.#score; }
    get ammo()               { return this.#ammo; }
    get npcSpeedMultiplier() { return this.#npcSpeedMultiplier; }
    get player()             { return this.#player; }
    get attractMode()        { return this.#attractMode; }
    get effects()            { return this.#effects; }
    get droneSpawnCount()    { return this.#droneSpawnCount; }
    get ammoSpawnCount()     { return this.#ammoSpawnCount; }

    // ---- Setters ------------------------------------------------------------

    set gameState(v)          { this.#gameState          = v; }
    set score(v)              { this.#score              = v; }
    set ammo(v)               { this.#ammo               = v; }
    set npcSpeedMultiplier(v) { this.#npcSpeedMultiplier = v; }
    set player(v)             { this.#player             = v; }
    set droneSpawnCount(v)    { this.#droneSpawnCount    = v; }
    set ammoSpawnCount(v)     { this.#ammoSpawnCount     = v; }

    // ---- Score / Ammo -------------------------------------------------------

    emptyAmmo()      { this.#ammo   = this.#gameConsts.START_AMMO; }
    increaseAmmo(a)  { this.#ammo  += a; }
    decreaseAmmo(a)  { this.#ammo  -= a; }
    increaseScore(a) { this.#score += a; }

    // ---- State Management ---------------------------------------------------

    // Stores previous state and resets the entered flag for the new state
    setGameState(state)
    {
        this.#gameState       = state;
        this.#stateEntered[state] = false;
    }

    // Returns true only on the first call for this state — used for one-time setup
    isStateEnter(state)
    {
        if (this.#gameState !== state) return false;
        if (this.#stateEntered[state]) return false;
        this.#stateEntered[state] = true;
        return true;
    }

    // ---- Game Setup ---------------------------------------------------------

    // One-time setup — loads assets, creates billboards, registers sounds and timers
    initGame(device)
    {
        try
        {
            device.keys.initKeys();

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
                new Timer(timerTypes.SHIELD_TIMER,          this.#gameConsts.SHIELD_TIME,          timerModes.COUNTDOWN),
                new Timer(timerTypes.SHOOT_COOL_DOWN_TIMER, 0,                                     timerModes.COUNTDOWN),
                new Timer(timerTypes.GAME_CLOCK,            0,                                     timerModes.COUNTUP),
                new Timer(timerTypes.DRONE_TIMER,           this.#gameConsts.DRONE_SPAWN_INTERVAL, timerModes.COUNTDOWN, true),
                new Timer(timerTypes.AMMO_TIMER,            this.#gameConsts.AMMO_SPAWN_INTERVAL,  timerModes.COUNTDOWN, true),
            ];
            timers.forEach(timer => this.#gameTimers.addObject(timer));
        }
        catch (err) { console.error("Error in initGame:", err); }
    }

    // Resets all runtime state — called at the start of each new game
    setGame(device)
    {
        this.score = this.#gameConsts.ZERO;
        this.ammo  = this.#gameConsts.ZERO;

        // Clear all active entities
        this.gameSprites.clearObjects();
        this.projectiles.clearObjects();

        // Reset NPC speed multiplier — applied to NPC movement speed each frame
        this.npcSpeedMultiplier = this.#gameConsts.ZERO;

        // Build and configure the player
        this.player = Player.buildPlayer();
        this.player.setPlayerState(playStates.AVOID);
        this.player.setMouseToPlayer(device);

        // Start survival clock
        this.gameTimers.getObjectByName(timerTypes.GAME_CLOCK).start();

        // Start backGround music 
        device.audio.playSoundLooping(soundTypes.SPACE.name);

        //Reset background rotation
        const backGround = this.billBoards.getObjectByName(billBoardTypes.BACKGROUND.name);
        if (backGround) backGround.reset();

        // Reset spawn timers to starting intervals — they loop automatically
        const droneSpawnTimer = this.gameTimers.getObjectByName(timerTypes.DRONE_TIMER);
        const ammoSpawnTimer = this.gameTimers.getObjectByName(timerTypes.AMMO_TIMER);

        droneSpawnTimer.reset(this.#gameConsts.DRONE_SPAWN_INTERVAL);
        droneSpawnTimer.start();

        ammoSpawnTimer.reset(this.#gameConsts.AMMO_SPAWN_INTERVAL);
        ammoSpawnTimer.start();

        // Reset spawn counts to starting values
        this.#droneSpawnCount = this.#gameConsts.DRONE_SPAWN_COUNT;
        this.#ammoSpawnCount  = this.#gameConsts.AMMO_SPAWN_COUNT;
    }
}
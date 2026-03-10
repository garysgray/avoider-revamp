// =======================================================
// GameDefs.js
// Immutable enumerations, texts, billboard & sprite configs.
// =======================================================

const GameDefs = Object.freeze({

    gameStates: {
        INIT:  0,
        PLAY:  1,
        PAUSE: 2,
        WIN:   3,
        LOSE:  4
    },

    playStates: {
        AVOID:  0,
        SHIELD: 1,
        SHOOT:  2,
        ULTRA:  3,
        DEATH:  4
    },

    spriteTypes: {
        PLAYER: { name: "player", w: 36, h: 36, speed: 0,   spawnRatio: 0,    path: "assets/sprites/ships.png"  },
        DRONE:  { name: "drone",  w: 24, h: 24, speed: 220, spawnRatio: 0.9,  path: "assets/sprites/drones.png" },
        AMMO:   { name: "ammo",   w: 20, h: 20, speed: 150, spawnRatio: 0.99, path: "assets/sprites/ammos.png"  },
        BULLET: { name: "bullet", w: 8,  h: 8,  speed: 550, spawnRatio: 0,    path: "assets/sprites/bullet.png" }
    },

    billBoardTypes: {
        BACKGROUND: { name: "background", w: 600, h: 600, path: "assets/sprites/stars.png",        isCenter: false },
        HUD:        { name: "hud",        w: 850, h: 200, path: "assets/sprites/hud.png",          isCenter: false },
        SPLASH:     { name: "splash",     w: 400, h: 100, path: "assets/sprites/avoiderSplash.png", isCenter: true  },
    },

    soundTypes: {
        HIT:   { name: "hit",   path: "assets/sounds/hit.wav"        },
        GET:   { name: "get",   path: "assets/sounds/get.wav"        },
        HURT:  { name: "hurt",  path: "assets/sounds/hurt.wav"       },
        SHOOT: { name: "shoot", path: "assets/sounds/shoot.wav"      },
        SPACE: { name: "space", path: "assets/sounds/spaceSound.wav" }
    },

    keyTypes: {
        PLAY_KEY:    "Space",
        RESET_KEY:   "Space",
        PAUSE_KEY_L: "ControlLeft"
    },

    gameTexts: {
        INIT: {
            INSTRUCTIONS: [
                "Shoot the Orbs!!!",
                "Catch the Fire Balls for Ammo",
                "Use Space-Bar or Mouse-Btn to Fire",
                "Press Space-Bar to Start"
            ]
        },
        HUD: {
            SCORE: "Score: ",
            AMMO:  "Ammo: ",
            LIVES: "Lives: "
        },
        WIN:  { MESSAGE:     "PRESS  ENTER  TO  PLAY  AGAIN"   },
        LOSE: { DIE_MESSAGE: "YOU  DIED,  SPACE-BAR  TO  RETRY" }
    },

    timerModes: {
        COUNTDOWN: "countdown",
        COUNTUP:   "countup",
    },

    timerTypes: {
        SHIELD_TIMER:          "shieldTimer",
        SHOOT_COOL_DOWN_TIMER: "shootCooldownTimer",
        GAME_CLOCK:            "gameClock",
    },

    parallexType: {
        HORIZONTAL: 1,
        VERTICLE:   2
    },

    ammoTypes: {
        FIRE:  0,
        GHOST: 1,
        ULTRA: 2,
    },

    enemyTypes: {
        EYE: 0,
        BUG: 1,
        UFO: 2,
    }
});

// =======================================================
// GameConsts
// Tunable game values exposed via private fields + getters.
// =======================================================
class GameConsts
{
    // Screen
    #SCREEN_WIDTH  = 1000;
    #SCREEN_HEIGHT = 600;

    // Timings
    #SHIELD_TIME                       = 3;
    #SHOOT_COOLDOWN                    = 0.2;
    #NPC_SPEED_SPAWN_INCREASE_INTERVALS = 10;
    #NPC_SPEED_INCREASE_AMOUNT         = 0.1;
    #NPC_SPAWN_INCREASE_AMOUNT         = 0.03;
    #FALLBACK_DELTA                    = 16;
    #Y_ANGLE_SPEED                     = 0.9;
    #X_ANGLE_SPEED                      =0.09;

    // Amounts
    #AMMO_AMOUNT             = 3;
    #SCORE_INCREASE          = 10;
    #GAME_LIVES_START_AMOUNT = 5;
    #SPAWN_ATTEMPTS          = 5;

    // Visuals
    #FONT_SETTINGS          = "bold 21pt Century Gothic";
    #FONT_COLOR             = "#faf7f7e0";
    #DEBUG_TEXT_COLOR       = "yellow";
    #HUD_BUFFER             = 0.12;
    #BILLBOARDS_OFFSET_BUFF = 0;

    // Audio
    #POOLSIZE = 5;
    #VOLUME   = 1.0;

    // ---- Getters ----
    get SCREEN_WIDTH()                        { return this.#SCREEN_WIDTH; }
    get SCREEN_HEIGHT()                       { return this.#SCREEN_HEIGHT; }
    get SHIELD_TIME()                         { return this.#SHIELD_TIME; }
    get SHOOT_COOLDOWN()                      { return this.#SHOOT_COOLDOWN; }
    get NPC_SPEED_SPAWN_INCREASE_INTERVALS()  { return this.#NPC_SPEED_SPAWN_INCREASE_INTERVALS; }
    get NPC_SPEED_INCREASE_AMOUNT()           { return this.#NPC_SPEED_INCREASE_AMOUNT; }
    get NPC_SPAWN_INCREASE_AMOUNT()           { return this.#NPC_SPAWN_INCREASE_AMOUNT; }
    get FALLBACK_DELTA()                      { return this.#FALLBACK_DELTA; }
    get Y_ANGLE_SPEED()                       { return this.#Y_ANGLE_SPEED; }
    get X_ANGLE_SPEED()                       { return this.#X_ANGLE_SPEED; }
    get AMMO_AMOUNT()                         { return this.#AMMO_AMOUNT; }
    get SCORE_INCREASE()                      { return this.#SCORE_INCREASE; }
    get GAME_LIVES_START_AMOUNT()             { return this.#GAME_LIVES_START_AMOUNT; }
    get SPAWN_ATTEMPTS()                      { return this.#SPAWN_ATTEMPTS; }
    get FONT_SETTINGS()                       { return this.#FONT_SETTINGS; }
    get FONT_COLOR()                          { return this.#FONT_COLOR; }
    get DEBUG_TEXT_COLOR()                    { return this.#DEBUG_TEXT_COLOR; }
    get HUD_BUFFER()                          { return this.#HUD_BUFFER; }
    get BILLBOARDS_OFFSET_BUFF()              { return this.#BILLBOARDS_OFFSET_BUFF; }
    get POOLSIZE()                            { return this.#POOLSIZE; }
    get VOLUME()                              { return this.#VOLUME; }
}
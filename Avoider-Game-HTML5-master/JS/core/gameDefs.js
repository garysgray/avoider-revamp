// =======================================================
// GameDefs.js
// -------------------------------------------------------
// Purpose:
// Immutable enumerations, texts, billboard & sprite configs.
// =======================================================

const GameDefs = Object.freeze({
    gameStates: {
        INIT: 0,
        PLAY: 1,
        PAUSE: 2,
        WIN: 3,
        LOSE: 4
    },

    playStates: {
        AVOID: 0,
        SHIELD: 1,
        SHOOT: 2,
        SUPER: 3,
        DEATH: 4
    },

    spriteTypes: {
        PLAYER:   { type: "player",    w: 32, h: 32, path: "assets/sprites/ships.png" },
        ORB:      { type: "orb",       w: 24, h: 24, speed: 200, spawnRatio: 10, path: "assets/sprites/orb.png" },
        FIRE_AMMO:{ type: "fireAmmo",  w: 16, h: 16, speed: 150, spawnRatio: 200, path: "assets/sprites/fire.png" },
        BULLET:   { type: "bullet",    w: 8,  h: 8, speed: 550, spawnGap: 0, path: "assets/sprites/bullet.png" }
    },

    //fix the 445 does not make sense when at 400 there off, it was working
    // i think it has to do with screen width and half width and all the weird ness came with it
    billBoardTypes: {
        BACKGROUND: { type: "background", w: 600, h: 600, path: "assets/sprites/stars.png" },
        SPLASH:     { type: "splash",     w: 400, h: 100, path: "assets/sprites/splash.png" },
        PAUSE:      { type: "pause",      w: 400, h: 100, path: "assets/sprites/pause.png" },
        DIE:        { type: "die",        w: 400, h: 100, path: "assets/sprites/die.png" }
    },

    soundTypes: {
        HIT:   { name: "hit",   path: "assets/sounds/hit.wav" },
        GET:   { name: "get",   path: "assets/sounds/get.wav" },
        HURT:  { name: "hurt",  path: "assets/sounds/hurt.wav" },
        SHOOT: { name: "shoot", path: "assets/sounds/shoot.wav" }
    },

    keyTypes: {
        PLAY_KEY: "Space",
        RESET_KEY: "Space",
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
            AMMO: "Ammo: ",
            LIVES: "Lives: "
        },
        PAUSE: {
            MESSAGE: "PRESS  CTRL  TO  RESUME  GAME"
        },
        WIN: {
            MESSAGE: "PRESS  ENTER  TO  PLAY  AGAIN"
        },
        LOSE: {
            LOSE_MESSAGE: "YOU  LOST,  SPACE-BAR  TO  RETRY",
            DIE_MESSAGE: "YOU  DIED,  SPACE-BAR  TO  REVIVE"
        }
    },

    timerModes: {
        COUNTDOWN: "countdown",
        COUNTUP: "countup",
    },

    timerTypes: {
        SHIELD_TIMER: "shieldTimer",
        SHOOT_COOL_DOWN_TIMER: "shootCooldownTimer",
        GAME_CLOCK: "gameClock",
    }

});


// -----------------------------
// Global Constants
// -----------------------------
class GameConsts 
{
    // ---- Private fields ----
    //sizes
    #SCREEN_WIDTH = 850;
    #SCREEN_HEIGHT = 600;

    //times
    #SHIELD_TIME = 3;
    #SHOOT_COOLDOWN = 0.2; // 200ms
    #NPC_SPEED_INCREASE_INTERVALS = 10;
    #NPC_SPEED_INCREASE_AMOUNT = 0.2;

    //amounts
    #AMMO_AMOUNT = 3; 
    #SCORE_INCREASE = 10;
    #GAME_LIVES_START_AMOUNT = 5;
    #SPAWN_ATTEMPTS = 5;

    //settings
    #FONT_SETTINGS = `bold 17pt Century Gothic`
    #FONT_COLOR = 'white'
    #HUD_BUFFER = .10;
    #BILLBOARDS_OFFSET_BUFF = .0999;

    //sound 
    #POOLSIZE = 5;
    #VOLUME = 1.0;
    
    // ---- Getters (expose constants safely) ----
    get SCREEN_WIDTH(){ return this.#SCREEN_WIDTH; }
    get SCREEN_HEIGHT(){ return this.#SCREEN_HEIGHT; }
    get SHIELD_TIME(){ return this.#SHIELD_TIME; }
    get SHOOT_COOLDOWN(){ return this.#SHOOT_COOLDOWN; }
    get AMMO_AMOUNT(){ return this.#AMMO_AMOUNT; }
    get SCORE_INCREASE(){ return this.#SCORE_INCREASE; }
    get GAME_LIVES_START_AMOUNT(){ return this.#GAME_LIVES_START_AMOUNT; }
    get SPAWN_ATTEMPTS(){ return this.#SPAWN_ATTEMPTS; }
    get FONT_SETTINGS(){ return this.#FONT_SETTINGS; }
    get FONT_COLOR(){ return this.#FONT_COLOR; }
    get HUD_BUFFER(){ return this.#HUD_BUFFER; }
    get POOLSIZE(){ return this.#POOLSIZE; }
    get VOLUME(){ return this.#VOLUME; }
    get NPC_SPEED_INCREASE_INTERVALS(){ return this.#NPC_SPEED_INCREASE_INTERVALS; }
    get NPC_SPEED_INCREASE_AMOUNT(){ return this.#NPC_SPEED_INCREASE_AMOUNT; }
    get BILLBOARDS_OFFSET_BUFF(){ return this.#BILLBOARDS_OFFSET_BUFF; }
    
}
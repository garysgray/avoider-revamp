// =======================================================
// GameConsts
// Tunable game values exposed via private fields + getters.
// =======================================================
class GameConsts
{
    // Screen
    #SCREEN_WIDTH  = 1280;
    #SCREEN_HEIGHT = 720;

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
    #SPAWN_ATTEMPTS          = 5;

    // Visuals
    #FONT_SETTINGS = "bold 26px 'Orbitron', sans-serif"
    #FONT_COLOR             = "#faf7f7e0";
    #DEBUG_TEXT_COLOR       = "yellow";
    #HUD_BUFFER             = 0.06;

    // Audio
    #POOLSIZE = 5;
    #VOLUME   = 1.0;

    // ---- Game Setup -------------------------------------------------------------
    #BG_SPEED         = 175;
    #BG_HOLD_DURATION = 6;
    #BG_ROTATE_SPEED  = 0.5;
    #BG_ROTATE_AMOUNT = 20;
    #START_SCORE      = 0;
    #START_AMMO       = 0;
    #START_MULTIPLIER = 0;
    #CENTER           = 0.5;

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
    get SPAWN_ATTEMPTS()                      { return this.#SPAWN_ATTEMPTS; }
    get FONT_SETTINGS()                       { return this.#FONT_SETTINGS; }
    get FONT_COLOR()                          { return this.#FONT_COLOR; }
    get DEBUG_TEXT_COLOR()                    { return this.#DEBUG_TEXT_COLOR; }
    get HUD_BUFFER()                          { return this.#HUD_BUFFER; }
    get POOLSIZE()                            { return this.#POOLSIZE; }
    get VOLUME()                              { return this.#VOLUME; }

    get BG_SPEED()         { return this.#BG_SPEED; }
    get BG_HOLD_DURATION() { return this.#BG_HOLD_DURATION; }
    get BG_ROTATE_SPEED()  { return this.#BG_ROTATE_SPEED; }
    get BG_ROTATE_AMOUNT() { return this.#BG_ROTATE_AMOUNT; }
    get START_SCORE()      { return this.#START_SCORE; }
    get START_AMMO()       { return this.#START_AMMO; }
    get START_MULTIPLIER() { return this.#START_MULTIPLIER; }
    get CENTER()           { return this.#CENTER; }
}
// =======================================================
// GameConsts.js
// Tunable game values exposed via private fields + getters.
// All difficulty scaling, spawn rates, and timing live here.
// =======================================================
class GameConsts
{
    // ---- Screen -------------------------------------------------------------
    #SCREEN_WIDTH  = 1280;
    #SCREEN_HEIGHT = 720;
    #CENTER        = 0.5;

    // ---- Timings ------------------------------------------------------------
    #SHIELD_TIME    = 3;
    #SHOOT_COOLDOWN = 0.2;
    #FALLBACK_DELTA = 16;

    // ---- Background ---------------------------------------------------------
    #BG_SPEED         = 100;
    #BG_HOLD_DURATION = 6;
    #BG_ROTATE_SPEED  = 0.5;
    #BG_ROTATE_AMOUNT = 20;
    #Y_ANGLE_SPEED    = 0.9;
    #X_ANGLE_SPEED    = 0.09;

    // ---- Scoring / Ammo -----------------------------------------------------
    #AMMO_AMOUNT    = 3;
    #SCORE_INCREASE = 10;

    // ---- Visuals ------------------------------------------------------------
    #FONT_SETTINGS    = "bold 26px 'Orbitron', sans-serif";
    #FONT_COLOR       = "#faf7f7e0";
    #DEBUG_TEXT_COLOR = "yellow";
    #HUD_BUFFER       = 0.06;

    // ---- Audio --------------------------------------------------------------
    #POOLSIZE = 5;
    #VOLUME   = 1.0;

    // ---- Spawning -----------------------------------------------------------
    #SPAWN_ATTEMPTS   = 5;     // max placement retries to avoid overlap on spawn

    // ---- NPC Speed Scaling --------------------------------------------------
    // Every NPC_SPEED_SPAWN_INCREASE_INTERVALS seconds the speed multiplier steps up.
    // The multiplier is applied directly to NPC movement speed.
    // Example with defaults (intervals=10, amount=0.1):
    //   0-9s   → 1.0x speed
    //   10-19s → 1.1x speed
    //   20-29s → 1.2x speed  etc.
    //
    // TO CONTROL NPC SPEED:
    //   NPC_SPEED_SPAWN_INCREASE_INTERVALS — higher = longer between speed steps
    //   NPC_SPEED_INCREASE_AMOUNT          — higher = bigger speed jump each step

    #NPC_SPEED_SPAWN_INCREASE_INTERVALS = 10;
    #NPC_SPEED_INCREASE_AMOUNT         = 0.1;

    // ---- Drone Spawn Tuning -------------------------------------------------
    // Drones spawn on a looping timer. Each difficulty step the interval shrinks
    // and the per-tick count grows — producing exponentially more drones over time.
    //
    // TO CONTROL DRONE VOLUME:
    //   DRONE_SPAWN_INTERVAL    — seconds between spawn ticks at start (lower = busier immediately)
    //   DRONE_INTERVAL_MIN      — fastest interval allowed — hard floor
    //   DRONE_INTERVAL_DECREASE — seconds cut from interval each difficulty step
    //   DRONE_SPAWN_COUNT       — how many drones spawn per tick at start
    //   DRONE_SPAWN_COUNT_MAX   — max drones allowed per tick — hard ceiling
    //   DRONE_COUNT_INCREASE    — extra drones per tick added each difficulty step
    #DRONE_SPAWN_INTERVAL    = 0.1;
    #DRONE_INTERVAL_MIN      = 0.2;
    #DRONE_INTERVAL_DECREASE = 0.05;
    #DRONE_SPAWN_COUNT       = 1;
    #DRONE_SPAWN_COUNT_MAX   = 8;
    #DRONE_COUNT_INCREASE    = 0.5;

    // ---- Ammo Spawn Tuning --------------------------------------------------
    // Same timer-based system as drones but tuned independently.
    // Ammo should stay rarer than drones so players aren't flooded with pickups.
    //
    // TO CONTROL AMMO VOLUME:
    //   AMMO_SPAWN_INTERVAL    — seconds between spawn ticks at start (higher = rarer)
    //   AMMO_INTERVAL_MIN      — fastest ammo interval allowed — hard floor
    //   AMMO_INTERVAL_DECREASE — seconds cut each difficulty step
    //   AMMO_SPAWN_COUNT       — how many ammo orbs spawn per tick at start
    //   AMMO_SPAWN_COUNT_MAX   — max ammo per tick — hard ceiling
    //   AMMO_COUNT_INCREASE    — extra ammo per tick added each difficulty step
    #AMMO_SPAWN_INTERVAL    = 2.5;
    #AMMO_INTERVAL_MIN      = 1.5;
    #AMMO_INTERVAL_DECREASE = 0.1;
    #AMMO_SPAWN_COUNT       = 1;
    #AMMO_SPAWN_COUNT_MAX   = 3;
    #AMMO_COUNT_INCREASE    = 1;

    #ZERO = 0;

    // ---- Getters ------------------------------------------------------------

    get SCREEN_WIDTH()  { return this.#SCREEN_WIDTH; }
    get SCREEN_HEIGHT() { return this.#SCREEN_HEIGHT; }
    get CENTER()        { return this.#CENTER; }

    get SHIELD_TIME()    { return this.#SHIELD_TIME; }
    get SHOOT_COOLDOWN() { return this.#SHOOT_COOLDOWN; }
    get FALLBACK_DELTA() { return this.#FALLBACK_DELTA; }

    get BG_SPEED()         { return this.#BG_SPEED; }
    get BG_HOLD_DURATION() { return this.#BG_HOLD_DURATION; }
    get BG_ROTATE_SPEED()  { return this.#BG_ROTATE_SPEED; }
    get BG_ROTATE_AMOUNT() { return this.#BG_ROTATE_AMOUNT; }
    get Y_ANGLE_SPEED()    { return this.#Y_ANGLE_SPEED; }
    get X_ANGLE_SPEED()    { return this.#X_ANGLE_SPEED; }

    get AMMO_AMOUNT()    { return this.#AMMO_AMOUNT; }
    get SCORE_INCREASE() { return this.#SCORE_INCREASE; }


    get FONT_SETTINGS()    { return this.#FONT_SETTINGS; }
    get FONT_COLOR()       { return this.#FONT_COLOR; }
    get DEBUG_TEXT_COLOR() { return this.#DEBUG_TEXT_COLOR; }
    get HUD_BUFFER()       { return this.#HUD_BUFFER; }

    get POOLSIZE() { return this.#POOLSIZE; }
    get VOLUME()   { return this.#VOLUME; }

    get SPAWN_ATTEMPTS() { return this.#SPAWN_ATTEMPTS; }


    get NPC_SPEED_SPAWN_INCREASE_INTERVALS() { return this.#NPC_SPEED_SPAWN_INCREASE_INTERVALS; }
    get NPC_SPEED_INCREASE_AMOUNT()         { return this.#NPC_SPEED_INCREASE_AMOUNT; }

    get DRONE_SPAWN_INTERVAL()    { return this.#DRONE_SPAWN_INTERVAL; }
    get DRONE_INTERVAL_MIN()      { return this.#DRONE_INTERVAL_MIN; }
    get DRONE_INTERVAL_DECREASE() { return this.#DRONE_INTERVAL_DECREASE; }
    get DRONE_SPAWN_COUNT()       { return this.#DRONE_SPAWN_COUNT; }
    get DRONE_SPAWN_COUNT_MAX()   { return this.#DRONE_SPAWN_COUNT_MAX; }
    get DRONE_COUNT_INCREASE()    { return this.#DRONE_COUNT_INCREASE; }

    get AMMO_SPAWN_INTERVAL()    { return this.#AMMO_SPAWN_INTERVAL; }
    get AMMO_INTERVAL_MIN()      { return this.#AMMO_INTERVAL_MIN; }
    get AMMO_INTERVAL_DECREASE() { return this.#AMMO_INTERVAL_DECREASE; }
    get AMMO_SPAWN_COUNT()       { return this.#AMMO_SPAWN_COUNT; }
    get AMMO_SPAWN_COUNT_MAX()   { return this.#AMMO_SPAWN_COUNT_MAX; }
    get AMMO_COUNT_INCREASE()    { return this.#AMMO_COUNT_INCREASE; }

    get ZERO()    { return this.#ZERO; }
}
// ============================================================================
// AssetTypes.js
// Immutable definitions for sprites, billboards, sounds, and timers.
// All asset paths, dimensions, speeds, and identifiers live here.
// ============================================================================

// ---- Player -----------------------------------------------------------------

const playerSpriteTypes = Object.freeze(
{
    PLAYER: { name: "player", w: 36, h: 36, speed: 0, spawnRatio: 0, path: "assets/sprites/ships.png" },
});


// ---- Sprites ----------------------------------------------------------------

const spriteTypes = Object.freeze(
{
    DRONE:  { name: "drone",  w: 24, h: 24, speed: 220, spawnRatio: 0.9,  path: "assets/sprites/drones.png" },
    AMMO:   { name: "ammo",   w: 20, h: 20, speed: 150, spawnRatio: 0.99, path: "assets/sprites/ammos.png"  },
    BULLET: { name: "bullet", w: 8,  h: 8,  speed: 550, spawnRatio: 0,    path: "assets/sprites/bullet.png" },
});


// ---- Billboards -------------------------------------------------------------

const billBoardTypes = Object.freeze(
{
    BACKGROUND: { name: "background", w: 600, h: 600, path: "assets/sprites/stars.png",         isCenter: false },
    HUD:        { name: "hud",        w: 850, h: 250, path: "assets/sprites/hud.png",           isCenter: false },
    SPLASH:     { name: "splash",     w: 400, h: 100, path: "assets/sprites/avoiderSplash.png",  isCenter: true  },
});


// ---- Sounds -----------------------------------------------------------------

const soundTypes = Object.freeze(
{
    HIT:   { name: "hit",   path: "assets/sounds/hit.wav"        },
    GET:   { name: "get",   path: "assets/sounds/get.wav"        },
    HURT:  { name: "hurt",  path: "assets/sounds/hurt.wav"       },
    SHOOT: { name: "shoot", path: "assets/sounds/shoot.wav"      },
    SPACE: { name: "space", path: "assets/sounds/spaceSound.wav" },
});


// ---- Timer Modes ------------------------------------------------------------

const timerModes = Object.freeze(
{
    COUNTDOWN: "countdown",
    COUNTUP:   "countup",
});


// ---- Timer Types ------------------------------------------------------------

const timerTypes = Object.freeze(
{
    SHIELD_TIMER:          "shieldTimer",
    SHOOT_COOL_DOWN_TIMER: "shootCooldownTimer",
    GAME_CLOCK:            "gameClock",
});
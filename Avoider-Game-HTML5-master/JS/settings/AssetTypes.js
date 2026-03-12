// =======================================================
// GameAssetTypes.js
// -------------------------------------------------------
// Purpose:
// Immutable spites, billboards, and sounds settings
// =======================================================

///FIX name and type bs
const playerSpriteTypes = 
{
        PLAYER: { name: "player", w: 36, h: 36, speed: 0,   spawnRatio: 0,    path: "assets/sprites/ships.png"  },
};

const spriteTypes = 
{
        DRONE:  { name: "drone",  w: 24, h: 24, speed: 220, spawnRatio: 0.9,  path: "assets/sprites/drones.png" },
        AMMO:   { name: "ammo",   w: 20, h: 20, speed: 150, spawnRatio: 0.99, path: "assets/sprites/ammos.png"  },
        BULLET: { name: "bullet", w: 8,  h: 8,  speed: 550, spawnRatio: 0,    path: "assets/sprites/bullet.png" }
};

const billBoardTypes = 
{
        BACKGROUND: { name: "background", w: 600, h: 600, path: "assets/sprites/stars.png",        isCenter: false },
        HUD:        { name: "hud",        w: 850, h: 250, path: "assets/sprites/hud.png",          isCenter: false },
        SPLASH:     { name: "splash",     w: 400, h: 100, path: "assets/sprites/avoiderSplash.png", isCenter: true },
};

const soundTypes = 
{
        HIT:   { name: "hit",   path: "assets/sounds/hit.wav"        },
        GET:   { name: "get",   path: "assets/sounds/get.wav"        },
        HURT:  { name: "hurt",  path: "assets/sounds/hurt.wav"       },
        SHOOT: { name: "shoot", path: "assets/sounds/shoot.wav"      },
        SPACE: { name: "space", path: "assets/sounds/spaceSound.wav" }
        };

const timerModes = 
{
        COUNTDOWN: "countdown",
        COUNTUP:   "countup",
};

const timerTypes = 
{
        SHIELD_TIMER:          "shieldTimer",
        SHOOT_COOL_DOWN_TIMER: "shootCooldownTimer",
        GAME_CLOCK:            "gameClock",
};


Object.freeze(playerSpriteTypes);
Object.freeze(spriteTypes);
Object.freeze(billBoardTypes);
Object.freeze(soundTypes);
Object.freeze(timerModes);
Object.freeze(timerTypes);
// =======================================================
// GameEnums.js
// -------------------------------------------------------
// Purpose:
// Immutable enumerations
// =======================================================
const gameStates = 
{
    INIT:  0,
    PLAY:  1,
    PAUSE: 2,
    WIN:   3,
    LOSE:  4
};

const playStates = 
{
    AVOID:  0,
    SHIELD: 1,
    SHOOT:  2,
    ULTRA:  3,
    DEATH:  4
};

const enemyEnum= 
{
    EYE: 0,
    BUG: 1,
    UFO: 2,
};

const ammoEnum =
{
    FIRE:  0,
    GHOST: 1,
    ULTRA: 2,
};

const parallexEnum = 
{
    HORIZONTAL: 0,
    VERTICLE:   1
};


Object.freeze(gameStates);
Object.freeze(playStates);
Object.freeze(enemyEnum);
Object.freeze(ammoEnum);
Object.freeze(parallexEnum);
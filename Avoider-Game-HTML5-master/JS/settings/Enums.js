// ============================================================================
// Enums.js
// Immutable enumerations for game states, play states, and entity types.
// ============================================================================

// ---- Game States ------------------------------------------------------------
// Top-level game flow — drives the state machine in UpdateGameStates.js

const gameStates = Object.freeze(
{
    INIT  : 0,
    PLAY  : 1,
    PAUSE : 2,
    LOSE  : 3,
});


// ---- Play States ------------------------------------------------------------
// Player mode — controls movement, effects, and collision response

const playStates = Object.freeze(
{
    AVOID  : 0,    // default — dodge enemies
    SHIELD : 1,    // invincible for a short duration
    SHOOT  : 2,    // has ammo — can fire
    ULTRA  : 3,    // destroys enemies on contact
    DEATH  : 4,    // hit — triggers lose state
});


// ---- Enemy Types ------------------------------------------------------------
// Determines NPC movement pattern in NPC.update()

const enemyEnum = Object.freeze(
{
    EYE : 0,    // moves straight down
    BUG : 1,    // moves diagonal left
    UFO : 2,    // moves diagonal right
});


// ---- Ammo Types -------------------------------------------------------------
// Determines pickup effect in handleAmmoPickup()

const ammoEnum = Object.freeze(
{
    FIRE  : 0,    // grants ammo — switches to SHOOT
    GHOST : 1,    // activates SHIELD
    ULTRA : 2,    // activates ULTRA
});


// ---- Parallax Types ---------------------------------------------------------
// Controls scroll direction in ParallaxBillBoard.update()

const parallaxEnum = Object.freeze(
{
    HORIZONTAL : 0,
    VERTICLE   : 1,    // note: typo kept intentional to match existing references
});
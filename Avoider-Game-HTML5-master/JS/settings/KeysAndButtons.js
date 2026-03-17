// ============================================================================
// KeysAndButtons.js
// Immutable keyboard and gamepad input definitions.
// Full set defined here — unused keys are harmless but ready when needed.
// ============================================================================

const keyTypes = Object.freeze(
{
    // ---- Universal ----------------------------------------------------------
    //ENTER       : "Enter",
    PLAY_KEY    : "Space",
    RESET_KEY   : "Space",
    // PAUSE_KEY   : "ControlLeft",

    // // ---- Directional --------------------------------------------------------
    // UP          : "ArrowUp",
    // DOWN        : "ArrowDown",
    // LEFT        : "ArrowLeft",
    // RIGHT       : "ArrowRight",

    // // ---- WASD ---------------------------------------------------------------
    // W           : "KeyW",
    // S           : "KeyS",
    // A           : "KeyA",
    // D           : "KeyD",
    // Q           : "KeyQ",
});


const gamepadButtons = Object.freeze(
{
    START       : 9,
    PAUSE       : 8,
    X           : 1,
});
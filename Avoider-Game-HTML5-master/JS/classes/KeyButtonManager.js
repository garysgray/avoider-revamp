// ============================================================================
// KeyButtonManager.js
// Keyboard and gamepad input tracking.
// Tracks held, pressed, and released states per frame.
// ============================================================================

// ---- KeyButtonManager Constants ---------------------------------------------

const KEY_CONSTS = Object.freeze(
{
    AXIS_THRESHOLD  : 0.5,    // analog stick deadzone for digital press detection
    GAMEPAD_DEADZONE: 0.2,    // analog stick deadzone for movement vector
    GAMEPAD_INDEX   : 0,      // which gamepad slot to read from
    CANVAS_TAB_INDEX: 0,      // makes canvas focusable for key events
});


// ---- KeyButtonManager -------------------------------------------------------
// Tracks keyboard and gamepad input.
// Call clearFrameKeys() at the end of each frame to reset pressed/released state.

class KeyButtonManager
{
    #keysDown;              // currently held keys
    #keysPressed;           // keys pressed this frame
    #keysReleased;          // keys released this frame
    #prevButtons;           // previous frame gamepad button states
    #value        = false;  // persistent toggle flag

    // Gamepad state
    #gamePadConnected;
    #gamePadEnabled;
    #prevGamePadConnected;

    constructor()
    {
        this.#keysDown            = {};
        this.#keysPressed         = {};
        this.#keysReleased        = {};
        this.#prevButtons         = [];
        this.#gamePadConnected    = false;
        this.#gamePadEnabled      = false;
        this.#prevGamePadConnected = false;

        this.wasPausePressed = false;

        // Per-axis press tracking for analog stick digital events
        this.axisPressed = {};

        // Returns raw axis value from the primary gamepad
        this.getGamepadAxis = function(axisIndex)
        {
            const gp = navigator.getGamepads?.()[KEY_CONSTS.GAMEPAD_INDEX];
            return gp ? (gp.axes[axisIndex] || 0) : 0;
        };

        // Returns true only on the frame an axis crosses the threshold
        this.wasAxisJustPressed = function(axisIndex, direction)
        {
            const key          = `${axisIndex}_${direction}`;
            const currentValue = this.getGamepadAxis(axisIndex);
            const isPressed    = direction < 0
                ? currentValue < -KEY_CONSTS.AXIS_THRESHOLD
                : currentValue >  KEY_CONSTS.AXIS_THRESHOLD;

            if (isPressed && !this.axisPressed[key])
            {
                this.axisPressed[key] = true;
                return true;
            }

            if (!isPressed) this.axisPressed[key] = false;

            return false;
        };

        this.initKeys();
    }

    // ---- Getters / Setters --------------------------------------------------

    get value()               { return this.#value; }
    set value(v)              { this.#value = v; }

    get gamePadConnected()    { return this.#gamePadConnected; }
    set gamePadConnected(v)   { this.#gamePadConnected = v; }

    get gamePadEnabled()      { return this.#gamePadEnabled; }
    set gamePadEnabled(v)     { this.#gamePadEnabled = v; }

    get prevGamePadConnected()  { return this.#prevGamePadConnected; }
    set prevGamePadConnected(v) { this.#prevGamePadConnected = v; }

    // ---- Keyboard Init ------------------------------------------------------

    // Registers keydown/keyup listeners — called once on construction
    initKeys()
    {
        try
        {
            window.addEventListener("keydown", e =>
            {
                if (!this.#keysDown[e.code]) this.#keysPressed[e.code] = true;
                this.#keysDown[e.code] = true;
            });
            window.addEventListener("keyup", e =>
            {
                delete this.#keysDown[e.code];
                this.#keysReleased[e.code] = true;
            });
        }
        catch (err) { console.warn("KeyManager init failed:", err.message); }
    }

    // ---- Keyboard Queries ---------------------------------------------------

    isKeyDown(key)      { return !!this.#keysDown[key]; }
    isKeyPressed(key)   { return !!this.#keysPressed[key]; }
    isKeyReleased(key)  { return !!this.#keysReleased[key]; }

    // ---- Gamepad Queries ----------------------------------------------------

    // Returns true only on the frame a gamepad button transitions to pressed
    isGamepadButtonPressed(buttonIndex)
    {
        const gp = navigator.getGamepads?.()[KEY_CONSTS.GAMEPAD_INDEX];
        if (!gp) return false;

        const pressed = gp.buttons[buttonIndex]?.pressed || false;
        const prev    = this.#prevButtons[buttonIndex]   || false;

        return pressed && !prev;
    }

    // ---- Frame Cleanup ------------------------------------------------------

    // Resets pressed/released state — call AFTER all input checks each frame
    clearFrameKeys()
    {
        this.#keysPressed  = {};
        this.#keysReleased = {};
        this.#clearGamepadFrameKeys();
    }

    // Snapshots current gamepad button states for next frame comparison
    #clearGamepadFrameKeys()
    {
        const gp = navigator.getGamepads?.()[KEY_CONSTS.GAMEPAD_INDEX];
        if (!gp) return;
        gp.buttons.forEach((btn, i) => { this.#prevButtons[i] = btn.pressed; });
    }

    // ---- Utilities ----------------------------------------------------------

    // Toggle-once helper — prevents input from firing repeatedly while held
    toggleOnce(isPressed, state)
    {
        if (isPressed && !state.value)
        {
            state.value = true;
            return true;
        }
        if (!isPressed) state.value = false;
        return false;
    }

    // Toggles between originState and pauseState — works for keyboard and gamepad
    checkForPause(game, key, button, originState, pauseState)
    {
        try
        {
            const keyDown = this.isKeyPressed(key);
            const padDown = this.isGamepadButtonPressed(button);

            if ((keyDown || padDown) && !this.wasPausePressed)
            {
                this.wasPausePressed = true;
                game.setGameState(
                    game.gameState === originState ? pauseState : originState
                );
            }

            if (!keyDown && !padDown) this.wasPausePressed = false;
        }
        catch (e) { console.error("checkForPause error:", e); }
    }

    // Blocks default scroll behaviour for game keys and focuses the canvas
    addEventListeners(keyTypes)
    {
        window.addEventListener("gamepadconnected",    () => this.gamePadConnected = true);
        window.addEventListener("gamepaddisconnected", () => this.gamePadConnected = false);

        const canvas      = document.getElementById("canvas");
        canvas.tabIndex   = KEY_CONSTS.CANVAS_TAB_INDEX;
        canvas.focus();

        canvas.addEventListener("keydown", e =>
        {
            const blockedKeys = [
                keyTypes.UP,
                keyTypes.DOWN,
                keyTypes.LEFT,
                keyTypes.RIGHT,
                keyTypes.PLAY_KEY,
            ];
            if (blockedKeys.includes(e.code)) e.preventDefault();
        });
    }

    // Re-initializes keyboard and gamepad state — call on game reset if needed
    addKeysAndGamePads()
    {
        this.initKeys();
        this.wasPausePressed = false;
    }

    // Polls current gamepad connection status
    updateGamepadState()
    {
        const gp              = navigator.getGamepads?.()[KEY_CONSTS.GAMEPAD_INDEX];
        this.#gamePadConnected = !!gp;
    }

    // Returns a normalized movement vector from keyboard and gamepad input
    getMovementVector()
    {
        let dx = 0;
        let dy = 0;

        // Keyboard — WASD and arrow keys
        if (this.isKeyDown(keyTypes.DOWN)  || this.isKeyDown(keyTypes.S)) dy += 1;
        if (this.isKeyDown(keyTypes.UP)    || this.isKeyDown(keyTypes.W)) dy -= 1;
        if (this.isKeyDown(keyTypes.RIGHT) || this.isKeyDown(keyTypes.D)) dx += 1;
        if (this.isKeyDown(keyTypes.LEFT)  || this.isKeyDown(keyTypes.A)) dx -= 1;

        // Gamepad left analog stick
        const gp = navigator.getGamepads?.()[KEY_CONSTS.GAMEPAD_INDEX];
        if (gp)
        {
            const ax = Math.abs(gp.axes[0]) > KEY_CONSTS.GAMEPAD_DEADZONE ? gp.axes[0] : 0;
            const ay = Math.abs(gp.axes[1]) > KEY_CONSTS.GAMEPAD_DEADZONE ? gp.axes[1] : 0;
            dx += ax;
            dy += ay;
        }

        return { dx, dy };
    }
}
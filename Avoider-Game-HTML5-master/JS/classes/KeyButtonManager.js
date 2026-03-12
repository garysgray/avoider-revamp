// ============================================================================
// KEY & BUTTON MANAGER
// ============================================================================

class KeyButtonManager 
{
    #keysDown;       // currently held keys
    #keysPressed;    // keys pressed this frame
    #keysReleased;   // keys released this frame
    #prevButtons;    // previous frame gamepad button states
    #value = false;  // persistent toggle flag (e.g., pause)
    
    // Gamepad state
    #gamePadConnected;
    #gamePadEnabled;
    #prevGamePadConnected;

    constructor() 
    {
        this.#keysDown = {};
        this.#keysPressed = {};
        this.#keysReleased = {};
        this.#prevButtons = [];
        
        // Gamepad state
        this.#gamePadConnected = false;
        this.#gamePadEnabled = false;
        this.#prevGamePadConnected = false;


        this.initKeys();
        this.wasPausePressed = false;

        // Axis tracking for analog sticks
        this.axisThreshold = 0.5;
        this.axisPressed = {}; // Track which axes are currently pressed

        this.getGamepadAxis = function(axisIndex) 
        {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const gp = gamepads[0];
            return gp ? (gp.axes[axisIndex] || 0) : 0;
        };

        this.wasAxisJustPressed = function(axisIndex, direction) 
        {
            const key = `${axisIndex}_${direction}`;
            const currentValue = this.getGamepadAxis(axisIndex);
            
            const isPressed = direction < 0 
                ? currentValue < -this.axisThreshold 
                : currentValue > this.axisThreshold;
            
            // Check if it JUST became pressed (wasn't pressed before)
            if (isPressed && !this.axisPressed[key]) {
                this.axisPressed[key] = true;
                return true;
            }
            
            // Clear when released
            if (!isPressed) {
                this.axisPressed[key] = false;
            }
            
            return false;
        };
    }

    get value() { return this.#value; }
    set value(v) { this.#value = v; }
    
    get gamePadConnected() { return this.#gamePadConnected; }
    set gamePadConnected(v) { this.#gamePadConnected = v; }
    
    get gamePadEnabled() { return this.#gamePadEnabled; }
    set gamePadEnabled(v) { this.#gamePadEnabled = v; }

    get prevGamePadConnected() { return this.#prevGamePadConnected; }
    set prevGamePadConnected(v) { this.#prevGamePadConnected = v; }



    // ------------------------------------------------------------------------
    // Initialize keyboard events
    // ------------------------------------------------------------------------
    initKeys() 
    {
        try 
        {
            window.addEventListener("keydown", e => {
                if (!this.#keysDown[e.code]) this.#keysPressed[e.code] = true;
                this.#keysDown[e.code] = true;
            });
            window.addEventListener("keyup", e => {
                delete this.#keysDown[e.code];
                this.#keysReleased[e.code] = true;
            });
        } 
        catch (err) 
        {
            console.warn("KeyManager init failed:", err.message);
        }
    }

    // ------------------------------------------------------------------------
    // Query methods - Keyboard
    // ------------------------------------------------------------------------
    isKeyDown(key) { return !!this.#keysDown[key]; }
    isKeyPressed(key) { return !!this.#keysPressed[key]; }
    isKeyReleased(key) { return !!this.#keysReleased[key]; }

    // ------------------------------------------------------------------------
    // Query methods - Gamepad
    // ------------------------------------------------------------------------
    isGamepadButtonPressed(buttonIndex)
    {
        const gamepads = navigator.getGamepads?.();
        if (!gamepads) return false;

        const gp = gamepads[0];
        if (!gp) return false;

        const pressed = gp.buttons[buttonIndex]?.pressed || false;
        const prev = this.#prevButtons[buttonIndex] || false;

        return pressed && !prev;
    }

    // ------------------------------------------------------------------------
    // Clear per-frame input state
    // IMPORTANT: This should be called AFTER all input checks are done
    // ------------------------------------------------------------------------
    clearFrameKeys() 
    { 
        this.#keysPressed = {}; 
        this.#keysReleased = {};
        this.#clearGamepadFrameKeys();
    }

    #clearGamepadFrameKeys()
    {
        const gamepads = navigator.getGamepads?.();
        if (!gamepads) return;

        const gp = gamepads[0];
        if (!gp) return;

        // Update previous button states for next frame
        gp.buttons.forEach((btn, i) =>
        {
            this.#prevButtons[i] = btn.pressed;
        });
    }

    // ------------------------------------------------------------------------
    // Toggle-once utility for frame-safe input
    // ------------------------------------------------------------------------
    toggleOnce(isPressed, state) 
    {
        if (isPressed && !state.value) 
        {
            state.value = true;
            return true;
        }

        if (!isPressed) 
        {
            state.value = false;
        }

        return false;
    }

    // ------------------------------------------------------------------------
    // Pause handling (works for keyboard + gamepad)
    // ------------------------------------------------------------------------
    checkForPause(game, key, button, originState, pauseState) 
    {
        try 
        {
            const keyDown = this.isKeyPressed(key);
            const padDown = this.isGamepadButtonPressed(button);

            // Only toggle when the button/key was not down last frame
            if ((keyDown || padDown) && !this.wasPausePressed)
            {
                this.wasPausePressed = true;

                game.setGameState(
                    game.gameState === originState
                        ? pauseState
                        : originState
                );
            }

            // Reset the per-frame flag when neither is pressed
            if (!keyDown && !padDown) 
            {
                this.wasPausePressed = false;
            }
        }
        catch (e) 
        {
            console.error("checkForPause error:", e);
        }
    }

    // ------------------------------------------------------------------------
    // Setup canvas key prevention and focus
    // ------------------------------------------------------------------------
    addEventListeners(keyTypes)
    {
        // Gamepad connection events
        window.addEventListener("gamepadconnected", () => this.gamePadConnected = true);
        window.addEventListener("gamepaddisconnected", () => this.gamePadConnected = false);

        const canvas = document.getElementById("canvas");
        canvas.tabIndex = 0; // make focusable
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

    // ------------------------------------------------------------------------
    // Initializes keyboard + gamepad functionality after construction
    // ------------------------------------------------------------------------
    addKeysAndGamePads()
    {
        this.initKeys();
        this.wasPausePressed = false;
    }

    updateGamepadState()
    {
        const gp = navigator.getGamepads?.()[0];
        this.#gamePadConnected = !!gp;
    }

    getMovementVector()
    {
        let dx = 0;
        let dy = 0;

        // Keyboard
        if (this.isKeyDown(keyTypes.DOWN)  || this.isKeyDown(keyTypes.S)) dy += 1;
        if (this.isKeyDown(keyTypes.UP)    || this.isKeyDown(keyTypes.W)) dy -= 1;
        if (this.isKeyDown(keyTypes.RIGHT) || this.isKeyDown(keyTypes.D)) dx += 1;
        if (this.isKeyDown(keyTypes.LEFT)  || this.isKeyDown(keyTypes.A)) dx -= 1;

        // Gamepad
        const gp = navigator.getGamepads?.()[0];
        if (gp)
        {
            const deadzone = 0.2;
            const ax = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
            const ay = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

            dx += ax;
            dy += ay;
        }

        return { dx, dy };
    }

}
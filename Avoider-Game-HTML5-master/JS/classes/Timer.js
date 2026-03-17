// ============================================================================
// Timer.js
// General purpose timer — supports COUNTDOWN and COUNTUP modes with optional looping.
// Used for shoot cooldowns, shield duration, survival clock, and timed events.
// ============================================================================

class Timer
{
    #name;
    #duration;
    #timeLeft;
    #elapsedTime = 0;
    #active      = false;
    #mode;
    #loop;

    constructor(name, durationSeconds = 0, mode = timerModes.COUNTDOWN, loop = false)
    {
        this.#name     = name;
        this.#duration = durationSeconds;
        this.#timeLeft = durationSeconds;
        this.#mode     = mode;
        this.#loop     = loop;
    }

    // ---- Getters ------------------------------------------------------------

    get name()        { return this.#name; }
    get active()      { return this.#active; }

    // Returns remaining time — floored at 0
    get timeLeft()    { return Math.max(0, this.#timeLeft); }

    get elapsedTime() { return this.#elapsedTime; }

    // Returns 0–1 progress — COUNTDOWN counts up to 1 as time runs out,
    // COUNTUP counts up to 1 as elapsed approaches duration
    get progress()
    {
        return this.#mode === timerModes.COUNTDOWN
            ? 1 - (this.#timeLeft / (this.#duration || 1))
            : (this.#duration ? Math.min(1, this.#elapsedTime / this.#duration) : 0);
    }

    // Returns elapsed time formatted as M:SS — useful for survival clock display
    get formatted()
    {
        const total = Math.floor(this.#elapsedTime);
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
    }

    // ---- Controls -----------------------------------------------------------

    // Starts the timer from the beginning
    start()
    {
        if (this.#mode === timerModes.COUNTDOWN) this.#timeLeft    = this.#duration;
        else                                     this.#elapsedTime = 0;
        this.#active = true;
    }

    // Pauses the timer without resetting it
    stop()  { this.#active = false; }

    // Optionally updates duration/mode/loop before restarting
    reset(duration = this.#duration, mode = this.#mode, loop = this.#loop)
    {
        this.#duration = duration;
        this.#mode     = mode;
        this.#loop     = loop;
        this.start();
    }

    // ---- Update -------------------------------------------------------------

    // Advances the timer by delta seconds.
    // Returns true when the timer fires (hits zero for COUNTDOWN, hits duration for looping COUNTUP).
    update(delta)
    {
        if (!this.#active) return false;

        if (this.#mode === timerModes.COUNTDOWN)
        {
            this.#timeLeft -= delta;
            if (this.#timeLeft <= 0)
            {
                // Loop restarts from remainder — non-loop stops and signals completion
                if (this.#loop) this.#timeLeft += this.#duration;
                else            this.#active    = false;
                return true;
            }
        }
        else
        {
            this.#elapsedTime += delta;
            if (this.#loop && this.#duration > 0 && this.#elapsedTime >= this.#duration)
            {
                this.#elapsedTime -= this.#duration;
                return true;
            }
        }

        return false;
    }
}
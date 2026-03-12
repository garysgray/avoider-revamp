// ============================================================================
// TIMER CLASS (Cleaned)
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

    constructor(name, durationSeconds = 0, mode = timerModes .COUNTDOWN, loop = false)
    {
        this.#name     = name;
        this.#duration = durationSeconds;
        this.#timeLeft = durationSeconds;
        this.#mode     = mode;
        this.#loop     = loop;
    }

    get name()        { return this.#name; }
    get active()      { return this.#active; }
    get timeLeft()    { return Math.max(0, this.#timeLeft); }
    get elapsedTime() { return this.#elapsedTime; }
    get progress()
    {
        return this.#mode === timerModes .COUNTDOWN
            ? 1 - (this.#timeLeft / (this.#duration || 1))
            : (this.#duration ? Math.min(1, this.#elapsedTime / this.#duration) : 0);
    }
    get formatted()
    {
        const total = Math.floor(this.#elapsedTime);
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
    }

    start()
    {
        if (this.#mode === timerModes .COUNTDOWN) this.#timeLeft    = this.#duration;
        else                                               this.#elapsedTime = 0;
        this.#active = true;
    }

    stop()  { this.#active = false; }

    reset(duration = this.#duration, mode = this.#mode, loop = this.#loop)
    {
        this.#duration = duration;
        this.#mode     = mode;
        this.#loop     = loop;
        this.start();
    }

    update(delta)
    {
        if (!this.#active) return false;

        if (this.#mode === timerModes .COUNTDOWN)
        {
            this.#timeLeft -= delta;
            if (this.#timeLeft <= 0)
            {
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

// ============================================================================
// AUDIO PLAYER & SOUND CLASS
// ============================================================================

class Sound
{
    #name;
    #src;
    #volume;
    #pool;
    #index    = 0;
    #poolSize;

    constructor(name, src, poolSize, volume)
    {
        this.#name     = name;
        this.#src      = src;
        this.#volume   = volume;
        this.#poolSize = Math.max(1, poolSize);
        this.#pool     = [];

        // Pre-load a pool of Audio nodes so rapid playback never drops a sound
        try
        {
            for (let i = 0; i < this.#poolSize; i++)
            {
                const a   = new Audio(this.#src);
                a.preload = "auto";
                a.volume  = this.#volume;
                this.#pool.push(a);
            }
        }
        catch (err) { console.warn("Sound pool creation failed:", name, err.message); }
    }

    get name() { return this.#name; }

    // Cycles through the pool on each call — no cloning, no stacking
    play()
    {
        try
        {
            const a       = this.#pool[this.#index];
            a.volume      = this.#volume;
            a.currentTime = 0;
            a.play().catch(() => {}); // swallow browser abort errors
            this.#index = (this.#index + 1) % this.#poolSize;
        }
        catch {}
    }

    // Plays once and loops — ignores call if already playing
    playLooping()
    {
        try
        {
            const a = this.#pool[0];
            if (!a.paused) return;
            a.loop        = true;
            a.volume      = this.#volume;
            a.currentTime = 0;
            a.play().catch(() => {});
        }
        catch {}
    }

    // Stops and rewinds all nodes in the pool
    stopAll()
    {
        this.#pool.forEach(a => { try { a.pause(); a.currentTime = 0; } catch {} });
    }
}

// ---- AudioPlayer ------------------------------------------------------------
// Manages all game sounds via ObjHolder.
// Use playSound() for fire-and-forget.
// Use requestSound() when priority matters (e.g. HURT shouldn't be stomped by GET).

class AudioPlayer
{
    #sounds          = new ObjHolder();
    #MIN_GAP_MS      = 120;  // minimum ms between priority-gated sounds
    #lastPlayTime    = 0;
    #currentPriority = -1;

    // Register a sound — call once during game init
    addSound(name, src, poolSize = 1, volume = 1)
    {
        if (name && src) this.#sounds.addObject(new Sound(name, src, poolSize, volume));
    }

    getSound(name)  { return this.#sounds.getObjectByName(name); }
    hasSound(name)  { return !!this.getSound(name); }

    // Play with priority — lower priority sounds won't interrupt higher ones within MIN_GAP_MS
    requestSound(name, priority = 0)
    {
        const now = performance.now();
        if (priority < this.#currentPriority && now - this.#lastPlayTime < this.#MIN_GAP_MS) return;

        const s = this.getSound(name);
        if (!s) return;

        s.play();
        this.#currentPriority = priority;
        this.#lastPlayTime    = now;
    }

    // Standard fire-and-forget play
    playSound(name)
    {
        const s = this.getSound(name);
        if (s) try { s.play(); } catch (e) { console.error(`Failed to play "${name}":`, e); }
    }

    // Start a looping sound (e.g. background music)
    playSoundLooping(name)
    {
        const s = this.getSound(name);
        if (s) try { s.playLooping(); } catch (e) { console.error(`Failed to loop "${name}":`, e); }
    }

    // Stop a specific sound
    stopSound(name)
    {
        const s = this.getSound(name);
        if (s) try { s.stopAll(); } catch (e) { console.error(`Failed to stop "${name}":`, e); }
    }

    // Stop everything — used on game over / reset
    stopAll()
    {
        this.#sounds.forEach(s => { try { s.stopAll(); } catch {} });
    }

    // Bulk load all sounds from a soundTypes definition object
    static loadSounds(device, poolSize, soundTypes)
    {
        Object.values(soundTypes).forEach(def =>
        {
            if (def.path) device.audio.addSound(def.name, def.path, poolSize, def.volume ?? 1);
        });
    }
}
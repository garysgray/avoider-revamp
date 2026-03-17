// ============================================================================
// AUDIO PLAYER & SOUND CLASS (Modern Robust Version)
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
        this.#pool     = [];
        this.#poolSize = Math.max(1, poolSize);

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

    play()
    {
        try
        {
            const a       = this.#pool[this.#index];
            a.volume      = this.#volume;
            a.currentTime = 0;
            a.play();
            this.#index = (this.#index + 1) % this.#poolSize;
        }
        catch {}
    }

    playLooping()
    {
        try
        {
            const a = this.#pool[0];
            if (!a.paused) return;
            a.loop        = true;
            a.volume      = this.#volume;
            a.currentTime = 0;
            a.play();
        }
        catch {}
    }

    stopAll()
    {
        this.#pool.forEach(a => { try { a.pause(); a.currentTime = 0; } catch {} });
    }
}


// ---- AudioPlayer ------------------------------------------------------------

class AudioPlayer
{
    #sounds = new ObjHolder();

    addSound(name, src, poolSize = 1, volume = 1)
    {
        if (name && src) this.#sounds.addObject(new Sound(name, src, poolSize, volume));
    }

    getSound(name)         { return this.#sounds.getObjectByName(name); }
    hasSound(name)         { return !!this.getSound(name); }

    playSound(name)
    {
        const s = this.getSound(name);
        if (s) try { s.play(); } catch (e) { console.error(`Failed to play "${name}":`, e); }
    }

    playSoundLooping(name)
    {
        const s = this.getSound(name);
        if (s) try { s.playLooping(); } catch (e) { console.error(`Failed to loop "${name}":`, e); }
    }

    stopSound(name)
    {
        const s = this.getSound(name);
        if (s) try { s.stopAll(); } catch (e) { console.error(`Failed to stop "${name}":`, e); }
    }

    stopAll()
    {
        this.#sounds.forEach(s => { try { s.stopAll(); } catch {} });
    }
}
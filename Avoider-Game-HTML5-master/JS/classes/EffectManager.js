class EffectManager 
{
    #particles = [];

    constructor() {}

    get particles() { return this.#particles; }

    // Spawn an explosion at coordinates
    spawnExplosion(x, y, color = "orange") 
    {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 60 + Math.random() * 60;
            this.#particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 1.5 + Math.random(), // Randomize decay for variety
                color: color
            });
        }
    }

    // Update all particles - call this every frame in the main loop
    update(delta) 
    {
        // Fallback for delta to prevent NaN errors
        const dt = delta || 0.016; 
        
        for (let i = this.#particles.length - 1; i >= 0; i--) {
            const p = this.#particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;

            if (p.life <= 0) {
                this.#particles.splice(i, 1);
            }
        }
    }

    // Clear all effects (useful on game reset)
    clear() 
    {
        this.#particles = [];
    }
}
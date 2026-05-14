// ============================================================================
// ATTRACT MODE DEMO CLASS
// ============================================================================
// This class manages the "Attract Mode" seen on the main menu / init screen.
// It creates a "dummy" environment where a player object automatically 
// demonstrates game mechanics like movement, orb collection, and combat.
// It cycles through different power-up states to teach the player the game.
// ============================================================================

const ATTRACT_CONSTS = Object.freeze(
{
    // --- Ship Vertical Positioning ---
    SHIP_Y_FRACTION  : 0.32,   // Vertical position as a percentage of screen height
    SHIP_SPEED       : 100,    // Pixels per second horizontal movement
    
    // --- Enemy Behavior ---
    DEMO_NPC_SPEED   : 100,    // Falling speed of the drone enemies
    DEMO_NPC_INTERVAL: 1.0,    // Spawn a new enemy every 2 seconds
    
    // --- Collision and Interaction ---
    DEMO_KILL_DIST   : 50,     // Distance threshold for enemy-to-player impact
    DEATH_PAUSE      : 1.5,    // How long the death state is shown before the demo resets
    
    // --- Timing and Spawning ---
    STATE_DURATION   : 6.0,    // Total seconds to showcase one power-up type
    SHOOT_INTERVAL   : 0.4,    // Delay between auto-fired bullets in SHOOT state

    ORB_Y_FRACTION   : 0.05,   // Initial spawn height of the power-up orb
    ORB_FLOAT_SPEED  : 80,     // Speed at which the orb descends to ship level
    ORB_SPAWN_INTERVAL: 3.0,   // How long after orb collection before the next one spawns

    ORB_LOOKAHEAD    : 0.25,
    
    ENEMY_Y_START    : 0.05,   // Initial spawn height of enemies (top of screen)
    SHIELD_DURATION  : 3.5,    // How long SHIELD and ULTRA states last before expiring

    // --- Boundary Logic (Percentages of Screen Width) ---
    SHIP_BOUNDS_LEFT : 0.40,   // Leftmost point the ship travels
    SHIP_BOUNDS_RIGHT: 0.60,   // Rightmost point the ship travels
    ORB_SPAWN_LEFT   : 0.45,   // Horizontal range for orb spawning
    ORB_SPAWN_RIGHT  : 0.55,
    NPC_SPAWN_LEFT   : 0.5,    // Enemies spawn around the center line
    NPC_SPAW_RIGHT   : 0.5,
    NPC_SPAWN_BOTTOM : 0.35,   // Point where enemies are removed from logic

    NPC_RANDOM_TYPES : 3,
    NPC_AHEAD_OFFSET : 120,

    HITBOX_SCALE     : 1.0,
    HITBOX_OFFSET    : 0,
    
    AMMO_MULTIPLIER  : 3,
});

class AttractMode
{
    // ---- Private Member Variables -------------------------------------------

    #gameConsts;               // Global game constants (Width/Height/Ammo)
    #started       = false;    // Flag to ensure init() only runs once per session
    #stateIndex    = 0;        // Points to the current entry in #ammoSequence
    #orb           = null;     // Reference to the active on-screen power-up orb
    #enemies       = [];       // Array containing all active enemy NPC objects
    #bullets       = [];       // Array containing all active bullet Projectiles
    #direction     = 1;        // Ship movement direction: 1 = Right, -1 = Left
    #ammoRemaining = 0;        // Remaining ammo for the SHOOT demonstration
    #player        = null;     // The autonomous demo player object

    // ---- Timers -------------------------------------------------------------

    #stateTimer;               // Drives the 6-second cycle between power-up demos
    #shootTimer;               // Controls the rate of auto-fire in SHOOT state
    #spawnTimer;               // Controls how often enemy drones spawn
    #orbSpawnTimer;            // Controls the delay between orb spawns (looping)
    #shieldTimer;              // Controls how long SHIELD and ULTRA states last

    // ---- Demo Sequences -----------------------------------------------------

    // Order controls which power-up the player sees demonstrated first
    #ammoSequence     = [ammoEnum.GHOST, ammoEnum.ULTRA, ammoEnum.FIRE];
    
    // Maps each collectible orb type to the player state it activates
    #playStateForAmmo =
    {
        [ammoEnum.GHOST]: playStates.SHIELD,
        [ammoEnum.ULTRA]: playStates.ULTRA,
        [ammoEnum.FIRE]:  playStates.SHOOT,
    };

    constructor(gameConsts)
    {
        this.#gameConsts = gameConsts;

        this.#stateTimer    = new Timer("State",    ATTRACT_CONSTS.STATE_DURATION,    timerModes.COUNTDOWN, false);
        this.#shootTimer    = new Timer("Shoot",    ATTRACT_CONSTS.SHOOT_INTERVAL,    timerModes.COUNTDOWN, true);
        this.#spawnTimer    = new Timer("Spawn",    ATTRACT_CONSTS.DEMO_NPC_INTERVAL, timerModes.COUNTDOWN, true);
        this.#orbSpawnTimer = new Timer("OrbSpawn", ATTRACT_CONSTS.ORB_SPAWN_INTERVAL,timerModes.COUNTDOWN, true);
        this.#shieldTimer   = new Timer("Shield",   ATTRACT_CONSTS.SHIELD_DURATION,   timerModes.COUNTDOWN, false);
    }

    // ---- Getters — used by render layer to draw demo entities ---------------

    get player()  { return this.#player; }
    get orb()     { return this.#orb; }
    get enemies() { return this.#enemies; }
    get bullets() { return this.#bullets; }

    // ---- Scene Management ---------------------------------------------------

    // Wipes all active entities and returns the ship to neutral AVOID state
    // Called on state cycle, death reset, and full reset
    clearScene()
    {
        this.#orb     = null;
        this.#enemies = [];
        this.#bullets = [];
        if (this.#player) this.#player.playerState = playStates.AVOID;
    }

    // Full stop — called when leaving the INIT screen entirely
    // Stops all timers so nothing runs in the background
    reset()
    {
        this.#started = false;

        this.clearScene();
        
        this.#stateTimer.stop();
        this.#shootTimer.stop();
        this.#spawnTimer.stop();
        this.#orbSpawnTimer.stop();
        this.#shieldTimer.stop();
        
    }

    // First-time setup — builds the demo player and starts all core timers
    // Also called after a death to restart the demo from scratch
    init(screenHeight, constants)
    {

        this.#started       = true;
        this.#stateIndex    = 0;
        this.#direction     = 1;
        this.#ammoRemaining = 0;

        this.#stateTimer.stop();
        this.#spawnTimer.stop();
        this.#orbSpawnTimer.stop();
        this.#shieldTimer.stop();
        this.#shootTimer.stop();

        this.#player = Player.buildPlayer();
        this.#player.movePos(this.#player.halfWidth, screenHeight * constants.SHIP_Y_FRACTION);

        this.clearScene();

        this.#stateTimer.start();
        this.#spawnTimer.start();
        this.#orbSpawnTimer.start();
    }

    // ---- Run — called every frame from GameController -----------------------

    run(currentEffects, delta)
    {
        const screenWidth  = this.#gameConsts.SCREEN_WIDTH;
        const screenHeight = this.#gameConsts.SCREEN_HEIGHT;
        const constants    = ATTRACT_CONSTS;

        if (!this.#started) this.init(screenHeight, constants);

        this.updateStateCycle(delta);
        this.updateShipMovement(delta, screenWidth, constants);
        this.updateOrb(delta, screenWidth, screenHeight, constants);
        this.updateEnemies(delta, screenWidth, screenHeight, constants, currentEffects);
        this.updateShooting(delta);
        this.updateBullets(delta, constants, currentEffects);
        this.updateShieldDuration(delta);
    }

    // ---- State Cycle --------------------------------------------------------

    updateStateCycle(delta)
    {
        if (!this.#stateTimer.update(delta)) return;

        if (this.#player && this.#player.playerState === playStates.DEATH)
        {
            this.init(this.#gameConsts.SCREEN_HEIGHT, ATTRACT_CONSTS);
            return;
        }
    }

    // ---- Shield / Ultra Duration --------------------------------------------

    updateShieldDuration(delta)
    {
        const state = this.#player?.playerState;
        if (state !== playStates.SHIELD && state !== playStates.ULTRA) return;

        if (this.#shieldTimer.update(delta))
        {
            this.#player.playerState = playStates.AVOID;
            this.#shieldTimer.stop();
        }
    }

    // ---- Ship Movement ------------------------------------------------------

    updateShipMovement(delta, screenWidth, constants)
    {
        const player = this.#player;
        player.posX += constants.SHIP_SPEED * this.#direction * delta;

        if (player.posX > screenWidth * constants.SHIP_BOUNDS_RIGHT)
        {
            player.posX     = screenWidth * constants.SHIP_BOUNDS_RIGHT;
            this.#direction = -1;
        }
        else if (player.posX < screenWidth * constants.SHIP_BOUNDS_LEFT)
        {
            player.posX     = screenWidth * constants.SHIP_BOUNDS_LEFT;
            this.#direction = 1;
        }
    }

    // ---- Orb Spawning, Floating, Collection ---------------------------------

    updateOrb(delta, screenWidth, screenHeight, constants)
    {
        const player        = this.#player;
        const orbTimerFired = this.#orbSpawnTimer.update(delta);

        if ((!this.#orb || !this.#orb.alive) && orbTimerFired)
        {
            const currentAmmoType = this.#ammoSequence[this.#stateIndex];
            const definition      = spriteTypes.AMMO;
            this.#orb             = new NPC(definition.name, definition.w, definition.h, 0, 0, 0, currentAmmoType);

            this.#orb.typeToGrant = currentAmmoType;

            const aheadX = player.posX + (this.#direction * screenWidth * constants.ORB_LOOKAHEAD);
            const orbX   = Math.max(screenWidth * constants.ORB_SPAWN_LEFT, Math.min(aheadX, screenWidth * constants.ORB_SPAWN_RIGHT));

            this.#orb.movePos(orbX, screenHeight * constants.ORB_Y_FRACTION);
            this.#orb.targetY = screenHeight * constants.SHIP_Y_FRACTION;
        }

        if (!this.#orb || !this.#orb.alive) return;

        if (this.#orb.posY < this.#orb.targetY)
        {
            this.#orb.posY += constants.ORB_FLOAT_SPEED * delta;
            if (this.#orb.posY > this.#orb.targetY) this.#orb.posY = this.#orb.targetY;
        }

        if (rectsCollide(player.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET), this.#orb.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET)))
        {
            const ammoType     = this.#orb.typeToGrant;
            player.playerState = this.#playStateForAmmo[ammoType];
            this.#orb.kill();

            this.#stateIndex = (this.#stateIndex + 1) % this.#ammoSequence.length;

            if (ammoType === ammoEnum.FIRE)
            {
                this.#ammoRemaining = this.#gameConsts.AMMO_AMOUNT * constants.AMMO_MULTIPLIER;
                this.#shootTimer.start();
            }
            else
            {
                this.#shieldTimer.start();
            }
        }
    }

    // ---- Enemy Spawning and Collision ---------------------------------------

    updateEnemies(delta, screenWidth, screenHeight, constants, currentEffects)
    {
        const player = this.#player;

        if (this.#spawnTimer.update(delta))
        {
            const definition = spriteTypes.DRONE;
            const npc        = new NPC(definition.name, definition.w, definition.h, 0, 0, constants.DEMO_NPC_SPEED, Math.floor(Math.random() * constants.NPC_RANDOM_TYPES));

            const aheadX = player.posX + (this.#direction * constants.NPC_AHEAD_OFFSET);
            const npcX   = Math.max(screenWidth * constants.NPC_SPAWN_LEFT, Math.min(aheadX, screenWidth * constants.NPC_SPAW_RIGHT));

            npc.movePos(npcX, screenHeight * constants.ENEMY_Y_START);
            this.#enemies.push(npc);
        }

        for (let i = this.#enemies.length - 1; i >= 0; i--)
        {
            const npc = this.#enemies[i];
            if (!npc.alive) { this.#enemies.splice(i, 1); continue; }

            npc.posY += constants.DEMO_NPC_SPEED * delta;

            const isVulnerable = player.playerState === playStates.SHOOT || player.playerState === playStates.AVOID;
            const isProtected  = player.playerState === playStates.ULTRA || player.playerState === playStates.SHIELD;

            if (rectsCollide(player.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET), npc.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET)))
            {
                if (isVulnerable)
                {
                    player.playerState = playStates.DEATH;
                    npc.kill();
                    currentEffects.spawnExplosion(npc.posX, npc.posY);
                    break;
                }

                if (isProtected)
                {
                    if(player.playerState === playStates.ULTRA)
                    {
                        npc.kill();
                        currentEffects.spawnExplosion(npc.posX, npc.posY);
                    }
                }
            }

            if (npc.posY > screenHeight * constants.NPC_SPAWN_BOTTOM) this.#enemies.splice(i, 1);
        }
    }

    // ---- Auto-Fire (SHOOT state) --------------------------------------------

    updateShooting(delta)
    {
        if (this.#player.playerState !== playStates.SHOOT || this.#ammoRemaining <= 0) return;

        if (this.#shootTimer.update(delta))
        {
            const definition = spriteTypes.BULLET;
            const bullet     = new Projectile(
                definition.name, definition.w, definition.h,
                this.#player.posX,
                this.#player.posY - this.#player.halfHeight,
                definition.speed, 0
            );
            this.#bullets.push(bullet);
            this.#ammoRemaining--;

            if (this.#ammoRemaining <= 0) this.#shootTimer.stop();
        }
    }

    // ---- Bullet Update ------------------------------------------------------

    updateBullets(delta, constants, currentEffects)
    {
        for (let i = this.#bullets.length - 1; i >= 0; i--)
        {
            const bullet = this.#bullets[i];
            bullet.posY -= spriteTypes.BULLET.speed * delta;

            if (this.#orb && this.#orb.alive &&
                rectsCollide(bullet.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET), this.#orb.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET)))
            {
                bullet.alive = false;
                this.#orb.kill();
                currentEffects.spawnExplosion(this.#orb.posX, this.#orb.posY);
            }

            if (bullet.alive)
            {
                for (let j = this.#enemies.length - 1; j >= 0; j--)
                {
                    const npc = this.#enemies[j];
                    if (!npc.alive) continue;
                    if (rectsCollide(bullet.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET), npc.getHitbox(constants.HITBOX_SCALE, constants.HITBOX_OFFSET)))
                    {
                        bullet.alive = false;
                        npc.kill();
                        break;
                    }
                }
            }

            if (!bullet.alive || bullet.posY < 0) this.#bullets.splice(i, 1);
        }
    }
}
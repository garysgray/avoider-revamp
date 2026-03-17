// ============================================================================
// PlayerEffects.js
// Per-state glow effects drawn beneath the player sprite.
// Lazily initialized on first call — keyed by playState value.
// ============================================================================

// ---- Effect Constants -------------------------------------------------------

const EFFECT_CONSTS = Object.freeze(
{
    ENGINE_OFFSET_Y : 10,     // glow offset toward engine exhaust

    SHIELD : { radius: 35, innerRadius: 10, offsetY: 0  },
    ULTRA  : { radius: 38, innerRadius: 5,  offsetY: 0  },
    FIRE   : { radius: 22, innerRadius: 1,  offsetY: 10 },  // ENGINE_OFFSET_Y
    AVOID  : { radius: 17, innerRadius: 1,  offsetY: 10 },  // ENGINE_OFFSET_Y

    // ULTRA electric ring pulse ring dimensions
    PULSE_INNER     : 25,
    PULSE_OUTER     : 28,
    PULSE_SPEED     : 0.008,  // Date.now() multiplier for pulse animation

    // Gradient stop positions
    STOP_0          : 0,
    STOP_1          : 0.4,
    STOP_2          : 0.5,
    STOP_3          : 0.6,
    STOP_4          : 0.7,
    STOP_5          : 1,

    // Composite operation for shield glow
    BLEND_LIGHTER   : "lighter",
});

// ---- Colors -----------------------------------------------------------------

const EFFECT_COLORS = Object.freeze(
{
    SHIELD_0 : "rgba(186, 209, 231, 0.30)",
    SHIELD_1 : "rgba(186, 209, 231, 0.15)",
    SHIELD_2 : "rgba(186, 209, 231, 0)",

    ULTRA_0  : "rgba(212, 32,  203, 0.50)",
    ULTRA_1  : "rgba(212, 32,  203, 0.25)",
    ULTRA_2  : "rgba(212, 32,  203, 0)",

    SHOOT_0  : "rgba(255, 140, 0,   0.90)",
    SHOOT_1  : "rgba(255, 60,  0,   0.60)",
    SHOOT_2  : "rgba(255, 20,  0,   0)",

    AVOID_0  : "rgba(100, 180, 255, 0.90)",
    AVOID_1  : "rgba(60,  120, 220, 0.50)",
    AVOID_2  : "rgba(30,  80,  200, 0)",
});


// ---- PlayerEffects ----------------------------------------------------------

let PlayerEffects = null;

function getPlayerEffects()
{
    if (PlayerEffects) return PlayerEffects;

    // Draws a radial gradient glow centered on the object
    function drawGlow(ctx, obj, cfg, stops)
    {
        const cx   = obj.posX;
        const cy   = obj.posY + cfg.offsetY;
        const glow = ctx.createRadialGradient(cx, cy, cfg.innerRadius, cx, cy, cfg.radius);
        stops.forEach(([pos, color]) => glow.addColorStop(pos, color));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, cfg.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    PlayerEffects =
    {
        // Soft blue-white aura — uses "lighter" blend for additive glow
        [playStates.SHIELD]: (ctx, obj) =>
        {
            ctx.globalCompositeOperation = EFFECT_CONSTS.BLEND_LIGHTER;
            drawGlow(ctx, obj, EFFECT_CONSTS.SHIELD,
            [
                [EFFECT_CONSTS.STOP_0, EFFECT_COLORS.SHIELD_0],
                [EFFECT_CONSTS.STOP_3, EFFECT_COLORS.SHIELD_1],
                [EFFECT_CONSTS.STOP_5, EFFECT_COLORS.SHIELD_2],
            ]);
        },

        // Purple core burst + animated electric outer ring
        [playStates.ULTRA]: (ctx, obj) =>
        {
            drawGlow(ctx, obj, EFFECT_CONSTS.ULTRA,
            [
                [EFFECT_CONSTS.STOP_0, EFFECT_COLORS.ULTRA_0],
                [EFFECT_CONSTS.STOP_2, EFFECT_COLORS.ULTRA_1],
                [EFFECT_CONSTS.STOP_5, EFFECT_COLORS.ULTRA_2],
            ]);

            // Pulsing electric ring — animates via sine wave on Date.now()
            const pulse = Math.abs(Math.sin(Date.now() * EFFECT_CONSTS.PULSE_SPEED));
            drawGlow(ctx, obj,
                { radius: EFFECT_CONSTS.PULSE_OUTER, innerRadius: EFFECT_CONSTS.PULSE_INNER, offsetY: 0 },
            [
                [EFFECT_CONSTS.STOP_0, `rgba(255, 80,  255, 0)`                          ],
                [EFFECT_CONSTS.STOP_1, `rgba(255, 80,  255, ${0.6 + pulse * 0.4})`       ],
                [EFFECT_CONSTS.STOP_4, `rgba(180, 0,   255, ${0.4 + pulse * 0.3})`       ],
                [EFFECT_CONSTS.STOP_5, `rgba(180, 0,   255, 0)`                          ],
            ]);
        },

        // Orange/red engine fire glow — offset toward exhaust
        [playStates.SHOOT]: (ctx, obj) =>
        {
            drawGlow(ctx, obj, EFFECT_CONSTS.FIRE,
            [
                [EFFECT_CONSTS.STOP_0, EFFECT_COLORS.SHOOT_0],
                [EFFECT_CONSTS.STOP_1, EFFECT_COLORS.SHOOT_1],
                [EFFECT_CONSTS.STOP_5, EFFECT_COLORS.SHOOT_2],
            ]);
        },

        // Blue engine exhaust glow — default movement state
        [playStates.AVOID]: (ctx, obj) =>
        {
            drawGlow(ctx, obj, EFFECT_CONSTS.AVOID,
            [
                [EFFECT_CONSTS.STOP_0, EFFECT_COLORS.AVOID_0],
                [EFFECT_CONSTS.STOP_2, EFFECT_COLORS.AVOID_1],
                [EFFECT_CONSTS.STOP_5, EFFECT_COLORS.AVOID_2],
            ]);
        },

        // Dispatches the correct effect based on current player state
        draw(ctx, obj)
        {
            const effect = this[obj.playerState];
            if (effect) effect(ctx, obj);
        }
    };

    return PlayerEffects;
}

let PlayerEffects = null;

function getPlayerEffects()
{
    if (PlayerEffects) return PlayerEffects;

    // ---- Effect constants ----
    const ENGINE_OFFSET_Y = 10;

    const SHIELD = { radius: 35, innerRadius: 10, offsetY: 0  };
    const ULTRA  = { radius: 38, innerRadius: 5,  offsetY: 0  };
    const FIRE   = { radius: 22, innerRadius: 1,  offsetY: ENGINE_OFFSET_Y };
    const AVOID  = { radius: 17, innerRadius: 1,  offsetY: ENGINE_OFFSET_Y };

    // ---- Helper ----
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
        [playStates.SHIELD]: (ctx, obj) =>
        {
            ctx.globalCompositeOperation = "lighter";
            drawGlow(ctx, obj, SHIELD,
            [
                [0,   "rgba(186, 209, 231, 0.3)" ],
                [0.6, "rgba(186, 209, 231, 0.15)"],
                [1,   "rgba(186, 209, 231, 0)"   ],
            ]);
        },

        [playStates.ULTRA]: (ctx, obj) =>
        {
            // Inner core burst
            drawGlow(ctx, obj, ULTRA,
            [
                [0,   "rgba(212, 32, 203, 0.5)" ],
                [0.5, "rgba(212, 32, 203, 0.25)"],
                [1,   "rgba(212, 32, 203, 0)"   ],
            ]);

            // Outer electric ring
            const pulse = Math.abs(Math.sin(Date.now() * 0.008));
            drawGlow(ctx, obj, { radius: 28, innerRadius: 25, offsetY: 0 },
            [
                [0,   `rgba(255, 80, 255, 0)`                 ],
                [0.4, `rgba(255, 80, 255, ${0.6 + pulse * 0.4})`],
                [0.7, `rgba(180, 0,  255, ${0.4 + pulse * 0.3})`],
                [1,   `rgba(180, 0,  255, 0)`                 ],
            ]);
        },

        [playStates.SHOOT]: (ctx, obj) =>
        {
            drawGlow(ctx, obj, FIRE,
            [
                [0,   "rgba(255, 140, 0, 0.9)"],
                [0.4, "rgba(255, 60,  0, 0.6)"],
                [1,   "rgba(255, 20,  0, 0)"  ],
            ]);
        },

        [playStates.AVOID]: (ctx, obj) =>
        {
            drawGlow(ctx, obj, AVOID,
            [
                [0,   "rgba(100, 180, 255, 0.9)"],
                [0.5, "rgba(60,  120, 220, 0.5)"],
                [1,   "rgba(30,  80,  200, 0)"  ],
            ]);
        },

        draw(ctx, obj)
        {
            const effect = this[obj.playerState];
            if (effect) effect(ctx, obj);
        }
    };

    return PlayerEffects;
}
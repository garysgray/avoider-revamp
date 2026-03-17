// ============================================================================
// BillBoard.js
// Background display objects — static, parallax, and rotating starfield.
// ============================================================================


// ---- BillBoard Constants ----------------------------------------------------

const BILLBOARD_CONSTS = Object.freeze(
{
    // CircularParallaxBillBoard defaults
    HOLD_DURATION  : 5,
    ROTATE_SPEED   : 0.3,
    ROTATE_AMOUNT  : 20,
    SCALE          : 1.5,

    // Nebula bloom color stops
    NEBULA_INNER   : "rgba(90,120,255,0.10)",   // blue core
    NEBULA_MID     : "rgba(180,60,255,0.08)",   // purple mid
    NEBULA_OUTER   : "rgba(255,80,120,0.06)",   // red outer
    NEBULA_FADE    : "rgba(0,0,0,0)",

    // Nebula gradient radii (multipliers of cx)
    NEBULA_R_INNER : 0.2,
    NEBULA_R_OUTER : 1.2,
    NEBULA_STOP_0  : 0,
    NEBULA_STOP_1  : 0.4,
    NEBULA_STOP_2  : 0.7,
    NEBULA_STOP_3  : 1,

    // Vignette color stops
    VIG_CLEAR      : "rgba(0,0,0,0)",
    VIG_MID        : "rgba(20,0,60,0.25)",
    VIG_OUTER      : "rgba(80,0,120,0.35)",
    VIG_EDGE       : "rgba(0,0,0,0.85)",

    // Vignette gradient radii (multipliers of cx)
    VIG_R_INNER    : 0.4,
    VIG_R_OUTER    : 1.6,
    VIG_STOP_0     : 0,
    VIG_STOP_1     : 0.75,
    VIG_STOP_2     : 0.9,
    VIG_STOP_3     : 1,

    // Base space fill color
    SPACE_COLOR    : "#02010a",

    // Screen center multiplier
    CENTER         : 0.5,
});


// ---- BillBoard --------------------------------------------------------------
// Base class for static background objects.
// Can be centered in the world via centerObjectInWorld().

class BillBoard extends GameObject
{
    #isCenter;

    constructor(name, width, height, x, y, speed, isCenter = true)
    {
        super(name, width, height, x, y, speed);
        this.#isCenter = isCenter;
    }

    get isCenter() { return this.#isCenter; }

    // Centers the billboard on screen — skipped if isCenter is false
    centerObjectInWorld(screenW, screenH)
    {
        if (!this.#isCenter) return;
        this.posX = (screenW - this.width)  * BILLBOARD_CONSTS.CENTER;
        this.posY = (screenH - this.height) * BILLBOARD_CONSTS.CENTER;
    }

    update(device, delta) {}

    render(device, image, yBuff)
    {
        device.renderImage(image, this.posX, this.posY - yBuff);
    }
}


// ---- ParallaxBillBoard ------------------------------------------------------
// Scrolling background — renders two copies side by side or stacked
// so the seam is never visible. Supports HORIZONTAL and VERTICAL scroll.

class ParallaxBillBoard extends BillBoard
{
    #parallaxEnum;
    #posX2 = 0;
    #posY2 = 0;

    constructor(name, width, height, x, y, speed, isCenter, parallaxEnum)
    {
        super(name, width, height, x, y, speed, isCenter);
        this.#parallaxEnum = parallaxEnum;
        this.#posX2 = this.posX + this.width;
        this.#posY2 = this.posY;
    }

    get parallaxEnum() { return this.#parallaxEnum; }
    get posX2()        { return this.#posX2; }
    get posY2()        { return this.#posY2; }
    set posX2(v)       { this.#posX2 = v; }
    set posY2(v)       { this.#posY2 = v; }

    // Scrolls the two copies and wraps when the first copy leaves the screen
    update(delta, game)
    {
        const screenW = game.gameConsts.SCREEN_WIDTH;

        if (this.#parallaxEnum === parallaxEnum.HORIZONTAL)
        {
            this.posX -= this.speed * delta;
            if (this.posX <= -screenW) this.posX += screenW;
            this.posX2 = this.posX + screenW;
            this.posY2 = this.posY;
        }
        else
        {
            this.posY -= this.speed * delta;
            if (this.posY <= -this.height) this.posY += this.height;
            this.posY2 = this.posY + this.height;
            this.posX2 = this.posX;
        }
    }

    // Draws both copies to cover the full screen with no gap
    render(device, game, image)
    {
        const w = game.gameConsts.SCREEN_WIDTH;
        const h = game.gameConsts.SCREEN_HEIGHT;
        device.renderImage(image, this.posX,  this.posY,  w, h);
        device.renderImage(image, this.posX2, this.posY2, w, h);
    }
}


// ---- CircularParallaxBillBoard ----------------------------------------------
// Extends ParallaxBillBoard with slow random rotation and cosmic visual effects.
// Used for the space background — slowly drifts between random angles,
// layered with a nebula bloom and vignette for depth.

class CircularParallaxBillBoard extends ParallaxBillBoard
{
    #currentAngle = 0;
    #targetAngle  = 0;
    #holdTimer    = 0;
    #holdDuration;
    #rotateSpeed;
    #rotateAmount;

    // options: { holdDuration, rotateSpeed, rotateAmount }
    constructor(name, width, height, x, y, speed, isCenter, parallaxType, options = {})
    {
        super(name, width, height, x, y, speed, isCenter, parallaxType);
        this.#holdDuration = options.holdDuration ?? BILLBOARD_CONSTS.HOLD_DURATION;
        this.#rotateSpeed  = options.rotateSpeed  ?? BILLBOARD_CONSTS.ROTATE_SPEED;
        this.#rotateAmount = options.rotateAmount ?? BILLBOARD_CONSTS.ROTATE_AMOUNT;
    }

    get angle() { return this.#currentAngle; }

    // Scrolls via parent, then lerps toward a new random target angle on each hold expiry
    update(delta, game)
    {
        super.update(delta, game);

        this.#holdTimer += delta;

        // Pick a new target angle once the hold duration elapses
        if (this.#holdTimer >= this.#holdDuration)
        {
            const direction    = Math.random() > 0.5 ? 1 : -1;
            this.#targetAngle  = this.#currentAngle + direction * (this.#rotateAmount * Math.PI / 180);
            this.#holdTimer    = 0;
        }

        // Smooth lerp toward target
        const diff         = this.#targetAngle - this.#currentAngle;
        this.#currentAngle += diff * this.#rotateSpeed * delta;
    }

    // Renders: dark base → rotating scaled starfield → nebula bloom → vignette
    render(device, game, image)
    {
        const ctx = device.ctx;
        const w   = game.gameConsts.SCREEN_WIDTH;
        const h   = game.gameConsts.SCREEN_HEIGHT;
        const cx  = w * BILLBOARD_CONSTS.CENTER;
        const cy  = h * BILLBOARD_CONSTS.CENTER;
        const { SCALE, SPACE_COLOR, NEBULA_INNER, NEBULA_MID, NEBULA_OUTER, NEBULA_FADE,
                NEBULA_R_INNER, NEBULA_R_OUTER, NEBULA_STOP_0, NEBULA_STOP_1, NEBULA_STOP_2, NEBULA_STOP_3,
                VIG_CLEAR, VIG_MID, VIG_OUTER, VIG_EDGE,
                VIG_R_INNER, VIG_R_OUTER, VIG_STOP_0, VIG_STOP_1, VIG_STOP_2, VIG_STOP_3 } = BILLBOARD_CONSTS;

        // Base space fill
        ctx.fillStyle = SPACE_COLOR;
        ctx.fillRect(0, 0, w, h);

        // Rotating starfield — scaled up so edges never show during rotation
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.#currentAngle);
        ctx.scale(SCALE, SCALE);
        ctx.translate(-cx, -cy);

        super.render(device, game, image);

        ctx.restore();

        // Nebula bloom — subtle color overlay using screen compositing
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const nebula = ctx.createRadialGradient(cx, cy, cx * NEBULA_R_INNER, cx, cy, cx * NEBULA_R_OUTER);
        nebula.addColorStop(NEBULA_STOP_0, NEBULA_INNER);
        nebula.addColorStop(NEBULA_STOP_1, NEBULA_MID);
        nebula.addColorStop(NEBULA_STOP_2, NEBULA_OUTER);
        nebula.addColorStop(NEBULA_STOP_3, NEBULA_FADE);

        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();

        // Vignette — darkens edges for depth and focus
        const vignette = ctx.createRadialGradient(cx, cy, cx * VIG_R_INNER, cx, cy, cx * VIG_R_OUTER);

        vignette.addColorStop(VIG_STOP_0, VIG_CLEAR);
        vignette.addColorStop(VIG_STOP_1, VIG_MID);
        vignette.addColorStop(VIG_STOP_2, VIG_OUTER);
        vignette.addColorStop(VIG_STOP_3, VIG_EDGE);

        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }

    // Resets rotation state — call on game reset
    reset()
    {
        this.#currentAngle = 0;
        this.#targetAngle  = 0;
        this.#holdTimer    = 0;
    }
}
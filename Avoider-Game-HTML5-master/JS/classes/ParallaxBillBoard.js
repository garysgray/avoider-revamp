// ---- ParallaxBillBoard ------------------------------------------------------

class ParallaxBillBoard extends BillBoard
{
    #parallexEnum;
    #posX2 = 0;
    #posY2 = 0;

    constructor(name, width, height, x, y, speed, isCenter, parallexEnum)
    {
        super(name, width, height, x, y, speed, isCenter);
        this.#parallexEnum = parallexEnum;
        this.#posX2 = this.posX + this.width;
        this.#posY2 = this.posY;
    }

    get parallexEnum() { return this.#parallexEnum; }
    get posX2()        { return this.#posX2; }
    get posY2()        { return this.#posY2; }
    set posX2(v)       { this.#posX2 = v; }
    set posY2(v)       { this.#posY2 = v; }

    update(delta, game)
    {
        const screenW = game.gameConsts.SCREEN_WIDTH;

        if (this.#parallexEnum === parallexEnum.HORIZONTAL)
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

    render(device, game, image)
    {
        const w = game.gameConsts.SCREEN_WIDTH;
        const h = game.gameConsts.SCREEN_HEIGHT;
        device.renderImage(image, this.posX,  this.posY,  w, h);
        device.renderImage(image, this.posX2, this.posY2, w, h);
    }
}

class CircularParallaxBillBoard extends ParallaxBillBoard
{
    #currentAngle = 0;
    #targetAngle  = 0;
    #holdTimer    = 0;
    #holdDuration;
    #rotateSpeed;
    #rotateAmount;

    constructor(name, width, height, x, y, speed, isCenter, parallaxType, options = {})
    {
        super(name, width, height, x, y, speed, isCenter, parallaxType);
        this.#holdDuration = options.holdDuration ?? 5;
        this.#rotateSpeed  = options.rotateSpeed  ?? 0.3;
        this.#rotateAmount = options.rotateAmount ?? 20;
    }

    get angle() { return this.#currentAngle; }
    
    update(delta, game)
    {
        super.update(delta, game);

        this.#holdTimer += delta;

        if (this.#holdTimer >= this.#holdDuration)
        {
            const direction    = Math.random() > 0.5 ? 1 : -1;
            this.#targetAngle  = this.#currentAngle + direction * (this.#rotateAmount * Math.PI / 180);
            this.#holdTimer    = 0;
        }

        const diff         = this.#targetAngle - this.#currentAngle;
        this.#currentAngle += diff * this.#rotateSpeed * delta;
    }

    render(device, game, image)
    {
        const ctx   = device.ctx;
        const w     = game.gameConsts.SCREEN_WIDTH;
        const h     = game.gameConsts.SCREEN_HEIGHT;
        const cx    = w * 0.5;
        const cy    = h * 0.5;
        const scale = 1.5;

        // --- Base space ---
        ctx.fillStyle = "#02010a";
        ctx.fillRect(0, 0, w, h);

        // --- Rotating starfield ---
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.#currentAngle);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        super.render(device, game, image);

        ctx.restore();

        // --- Subtle cosmic color bloom ---
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const nebula = ctx.createRadialGradient(cx, cy, cx * 0.2, cx, cy, cx * 1.2);
        nebula.addColorStop(0,   "rgba(90,120,255,0.10)");  // blue glow
        nebula.addColorStop(0.4, "rgba(180,60,255,0.08)");  // purple
        nebula.addColorStop(0.7, "rgba(255,80,120,0.06)");  // red nebula
        nebula.addColorStop(1,   "rgba(0,0,0,0)");

        ctx.fillStyle = nebula;
        ctx.fillRect(0,0,w,h);

        ctx.restore();

        // --- Cosmic vignette ---
        const vignette = ctx.createRadialGradient(cx, cy, cx * 0.4, cx, cy, cx * 1.6);

        vignette.addColorStop(0,   "rgba(0,0,0,0)");
        vignette.addColorStop(0.75,"rgba(20,0,60,0.25)");
        vignette.addColorStop(0.9, "rgba(80,0,120,0.35)");
        vignette.addColorStop(1,   "rgba(0,0,0,0.85)");

        ctx.fillStyle = vignette;
        ctx.fillRect(0,0,w,h);
    }


    reset()
    {
        this.#currentAngle = 0;
        this.#targetAngle  = 0;
        this.#holdTimer    = 0;
    }
}
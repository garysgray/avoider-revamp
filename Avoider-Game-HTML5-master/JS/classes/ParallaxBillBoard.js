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
            this.#targetAngle += direction * (this.#rotateAmount * Math.PI / 180);
            this.#holdTimer    = 0;
        }

        const diff         = this.#targetAngle - this.#currentAngle;
        this.#currentAngle += diff * this.#rotateSpeed * delta;
    }

    render(device, game, image)
    {
        const ctx   = device.ctx;
        const cx    = game.gameConsts.SCREEN_WIDTH  * 0.5;
        const cy    = game.gameConsts.SCREEN_HEIGHT * 0.5;
        const scale = 1.5;

        // Fill void black first
        ctx.fillStyle = "#000005";
        ctx.fillRect(0, 0, game.gameConsts.SCREEN_WIDTH, game.gameConsts.SCREEN_HEIGHT);

        // Rotate and draw starfield
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.#currentAngle);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        super.render(device, game, image);
        ctx.restore();

        // Deep cosmic vignette
        const vignette = ctx.createRadialGradient(cx, cy, cx * 0.3, cx, cy, cx * 1.6);
        vignette.addColorStop(0,    "rgba(0, 0, 0, 0)");
        vignette.addColorStop(0.5,  "rgba(5, 0, 20, 0.3)");
        vignette.addColorStop(0.75, "rgba(40, 0, 60, 0.6)");
        vignette.addColorStop(0.85, "rgba(120, 30, 20, 0.65)");
        vignette.addColorStop(0.9,  "rgba(200, 80, 0, 0.7)");
        vignette.addColorStop(1,    "rgba(0, 0, 0, 0.95)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, game.gameConsts.SCREEN_WIDTH, game.gameConsts.SCREEN_HEIGHT);

        // Cosmic pulse
        const pulse = Math.abs(Math.sin(Date.now() * 0.0005));
        const cosmicEdge = ctx.createRadialGradient(cx, cy, cx * 0.8, cx, cy, cx * 1.5);
        cosmicEdge.addColorStop(0,   "rgba(0, 0, 0, 0)");
        cosmicEdge.addColorStop(0.7, `rgba(80, 0, 120, ${pulse * 0.15})`);
        cosmicEdge.addColorStop(0.85,`rgba(150, 40, 20, ${pulse * 0.2})`);
        cosmicEdge.addColorStop(1,   `rgba(200, 80, 0,  ${pulse * 0.25})`);
        ctx.fillStyle = cosmicEdge;
        ctx.fillRect(0, 0, game.gameConsts.SCREEN_WIDTH, game.gameConsts.SCREEN_HEIGHT);
    }

    reset()
    {
        this.#currentAngle = 0;
        this.#targetAngle  = 0;
        this.#holdTimer    = 0;
    }
}
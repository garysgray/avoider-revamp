// ============================================================================
// gameObjects.js
// Base GameObject and all child classes: Projectile, NPC, BillBoard, ParallaxBillBoard
// ============================================================================


// ---- GameObject (Base) ------------------------------------------------------

class GameObject
{
    #name;
    #width;
    #height;
    #posX;
    #posY;
    #speed;
    #alive    = true;
    #halfWidth;
    #halfHeight;
    #holdPosX = 0;
    #holdPosY = 0;

    constructor(name, width, height, posX, posY, speed)
    {
        this.#name       = name;
        this.#width      = width;
        this.#height     = height;
        this.#posX       = posX;
        this.#posY       = posY;
        this.#speed      = speed;
        this.#halfWidth  = width  * 0.5;
        this.#halfHeight = height * 0.5;
    }

    // ---- Getters ----
    get name()      { return this.#name; }
    get width()     { return this.#width; }
    get height()    { return this.#height; }
    get posX()      { return this.#posX; }
    get posY()      { return this.#posY; }
    get speed()     { return this.#speed; }
    get alive()     { return this.#alive; }
    get halfWidth() { return this.#halfWidth; }
    get halfHeight(){ return this.#halfHeight; }
    get holdPosX()  { return this.#holdPosX; }
    get holdPosY()  { return this.#holdPosY; }

    // ---- Setters ----
    set name(v)     { this.#name  = v; }
    set width(v)    { this.#width = v; }
    set height(v)   { this.#height = v; }
    set posX(v)     { this.#posX  = v; }
    set posY(v)     { this.#posY  = v; }
    set speed(v)    { this.#speed = v; }
    set alive(v)    { this.#alive = Boolean(v); }
    set holdPosX(v) { this.#holdPosX = v; }
    set holdPosY(v) { this.#holdPosY = v; }

    kill() { this.#alive = false; }

    // ---- Methods ----
    update(device, delta) {}

    movePos(x, y)
    {
        this.#posX = x;
        this.#posY = y;
    }

    savePos(x, y)
    {
        this.#holdPosX = x;
        this.#holdPosY = y;
    }

    restoreSavedPos()
    {
        this.#posX = this.#holdPosX;
        this.#posY = this.#holdPosY;
    }

    // Returns an AABB hitbox. scale shrinks proportionally; buffer shrinks by pixels.
    getHitbox(scale = 1.0, buffer = 0)
    {
        const hw = Math.max(0, this.#halfWidth  * scale - buffer);
        const hh = Math.max(0, this.#halfHeight * scale - buffer);
        return {
            left:   this.#posX - hw,
            right:  this.#posX + hw,
            top:    this.#posY - hh,
            bottom: this.#posY + hh
        };
    }

    getRoughRadius()
    {
        return Math.max(this.#halfWidth, this.#halfHeight);
    }
}


// ---- Projectile -------------------------------------------------------------

class Projectile extends GameObject
{
    constructor(name, width, height, posX, posY, speed)
    {
        super(name, width, height, posX, posY, speed);
    }

    update(device, game, delta)
    {
        this.posY -= this.speed * delta;
        if (this.posY + this.halfHeight < 0) this.kill();
    }
}


// ---- NPC --------------------------------------------------------------------

class NPC extends GameObject
{
    #type;

    constructor(name, width, height, x, y, speed, type)
    {
        super(name, width, height, x, y, speed);
        this.#type = type;
    }

    get type()  { return this.#type; }
    set type(v) { this.#type = v; }

    update(device, game, delta, moveStrategy = this.moveDown)
    {
        const hudBuff = game.gameConsts.HUD_BUFFER * game.gameConsts.SCREEN_HEIGHT;
        moveStrategy.call(this, game, delta);
        if (this.posY > game.gameConsts.SCREEN_HEIGHT + hudBuff) this.kill();
    }

    // Shared multiplier helper
    #multiplier(game) { return game.npcSpeedMuliplyer > 0 ? game.npcSpeedMuliplyer : 1; }

    moveDown(game, delta)
    {
        this.posY += this.speed * this.#multiplier(game) * delta;
    }

    moveDiagonalDownLeft(game, delta)
    {
        const s = this.speed * this.#multiplier(game) * delta;
        this.posY += s * game.gameConsts.Y_ANGLE_SPEED;
        this.posX -= s * game.gameConsts.X_ANGLE_SPEED;
    }

    moveDiagonalDownRight(game, delta)
    {
        const s = this.speed * this.#multiplier(game) * delta;
        this.posY += s * game.gameConsts.Y_ANGLE_SPEED;
        this.posX += s * game.gameConsts.X_ANGLE_SPEED;
    }
}


// ---- BillBoard --------------------------------------------------------------

class BillBoard extends GameObject
{
    #isCenter;

    constructor(name, width, height, x, y, speed, isCenter = true)
    {
        super(name, width, height, x, y, speed);
        this.#isCenter = isCenter;
    }

    get isCenter() { return this.#isCenter; }

    centerObjectInWorld(screenW, screenH)
    {
        if (!this.#isCenter) return;
        this.posX = (screenW - this.width)  * 0.5;
        this.posY = (screenH - this.height) * 0.5;
    }

    update(device, delta) {}

    render(device, image, yBuff)
    {
        device.renderImage(image, this.posX, this.posY - yBuff);
    }
}


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
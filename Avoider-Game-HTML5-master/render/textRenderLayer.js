
// Wrap your existing renderText function
function renderTextLayer(dev, game, delta) {
    // Copy your updated renderText logic
    const layout = {
        initTextY: [0.7, 0.75, 0.8, 0.85],
        hudY: 0.95,
        hudAmmoX: 0.05,
        hudLivesX: 0.85,
        pauseY: 0.65,
        winLoseY: 0.65
    };

    const cw = dev.canvas.width;
    const ch = dev.canvas.height;
    const fontSize = 16;

    dev.setFont(`bold ${fontSize}pt Calibri`);
    dev.colorText("white");

    switch(game.state)
    {
        case gameStates.INIT:
            layout.initTextY.forEach((pct, idx) => {
                const msg = [
                    "SHOOT THE ORBS!!!",
                    "CATCH FIRE BALLS TO GET AMMO",
                    "USE SPACE-BAR TO FIRE",
                    "PRESS THE SPACE-BAR TO START"
                ][idx];
                dev.centerTextOnY(msg, ch * pct);
            });
            break;

        case gameStates.PLAY:
            dev.colorText("red");
            dev.centerTextOnY("Score: " + game.score, ch * layout.hudY);
            dev.putText("Ammo: " + game.ammo, cw * layout.hudAmmoX, ch * layout.hudY);
            dev.putText("Lives: " + game.lives, cw * layout.hudLivesX, ch * layout.hudY);
            break;

        case gameStates.PAUSE:
            dev.colorText("white");
            dev.centerTextOnY("PRESS P TO RESUME GAME", ch * layout.pauseY);
            break;

        //No current way to win game
        case gameStates.WIN:
            dev.centerTextOnY("PRESS R TO PLAY AGAIN", ch * layout.winLoseY);
            break;

        case gameStates.LOSE:
            if(game.lives <= 0) {
                dev.centerTextOnY("SORRY YOU LOST, PRESS R TO RETRY", ch * layout.winLoseY);
            } else {
                dev.centerTextOnY("SORRY YOU DIED, PRESS R TO REVIVE", ch * layout.winLoseY);
            }
            break;
    }
}

// Wrap it in a Layer
const textRenderLayer = new Layer("HUD/Text", renderTextLayer);

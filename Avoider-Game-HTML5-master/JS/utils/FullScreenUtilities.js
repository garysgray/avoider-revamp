// =======================================================
// FULLSCREEN MANAGEMENT
// =======================================================
const FullScreenUtil = 
{
     toggleFullScreen(canvas) 
    {
        if (!document.fullscreenElement) 
        {
            if (canvas.requestFullscreen) 
                canvas.requestFullscreen({ navigationUI: "hide" });
            else if (canvas.webkitRequestFullscreen) 
                canvas.webkitRequestFullscreen();
            else if (canvas.msRequestFullscreen) 
                canvas.msRequestFullscreen();
        } 
        else 
        {
            if (document.exitFullscreen) 
                document.exitFullscreen();
            else if (document.webkitExitFullscreen) 
                document.webkitExitFullscreen();
            else if (document.msExitFullscreen) 
                document.msExitFullscreen();
        }
    },

    resizeCanvasToFullscreen(canvas, game) 
    {
        if (!canvas) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const internalWidth = game.gameConsts.SCREEN_WIDTH;
        const internalHeight = game.gameConsts.SCREEN_HEIGHT;
        const scale = Math.min(windowWidth / internalWidth, windowHeight / internalHeight);

        const scaledWidth = internalWidth * scale;
        const scaledHeight = internalHeight * scale;

        canvas.style.width = scaledWidth + "px";
        canvas.style.height = scaledHeight + "px";
        canvas.style.display = "block";
        canvas.style.margin = `${(windowHeight - scaledHeight) / 2}px auto`;
    }
}


// =======================================================
// EVENT LISTENERS
// =======================================================
window.addEventListener("keydown", e => 
{
    if (e.code === "KeyF") 
    {
        const canvas = document.getElementById("canvas");
        FullScreenUtil.toggleFullScreen(canvas);
    }
});

document.addEventListener("fullscreenchange", () => 
{
    const canvas = document.getElementById("canvas");
    if (!myController || !myController.game) return;
    
    const game = myController.game;
    
    if (document.fullscreenElement) 
    {
        FullScreenUtil.resizeCanvasToFullscreen(canvas, game);
        game.isGameFullscreen = true;
    } 
    else 
    {
        canvas.style.width = game.gameConsts.SCREEN_WIDTH + "px";
        canvas.style.height = game.gameConsts.SCREEN_HEIGHT + "px";
        canvas.style.margin = "0 auto";
        game.isGameFullscreen = false;
    }
});
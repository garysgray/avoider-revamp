// ============================================================================
// fullscreen.js
// ============================================================================
const FullScreenUtil =
{
    toggleFullScreen(canvas)
    {
        if (!document.fullscreenElement)
        {
            (canvas.requestFullscreen       && canvas.requestFullscreen({ navigationUI: "hide" })) ||
            (canvas.webkitRequestFullscreen && canvas.webkitRequestFullscreen())                   ||
            (canvas.msRequestFullscreen     && canvas.msRequestFullscreen());
        }
        else
        {
            (document.exitFullscreen       && document.exitFullscreen())       ||
            (document.webkitExitFullscreen && document.webkitExitFullscreen()) ||
            (document.msExitFullscreen     && document.msExitFullscreen());
        }
    },

    resizeCanvasToFullscreen(canvas, game)
    {
        if (!canvas) return;
        canvas.classList.add("fullscreen");
    },

    restoreCanvas(canvas, game)
    {
        canvas.style.width  = `${game.gameConsts.SCREEN_WIDTH}px`;
        canvas.style.height = `${game.gameConsts.SCREEN_HEIGHT}px`;
        canvas.style.margin = "0 auto";
        canvas.classList.remove("fullscreen");
    }
};

// ---- Event Listeners --------------------------------------------------------
window.addEventListener("keydown", e =>
{
    if (e.code === "KeyF")
        FullScreenUtil.toggleFullScreen(document.getElementById("canvas"));
});

document.addEventListener("fullscreenchange", () =>
{
    const canvas = document.getElementById("canvas");
    if (!myController?.game) return;
    const game = myController.game;
    if (document.fullscreenElement)
    {
        FullScreenUtil.resizeCanvasToFullscreen(canvas, game);
        game.isGameFullscreen = true;
    }
    else
    {
        FullScreenUtil.restoreCanvas(canvas, game);
        game.isGameFullscreen = false;
    }
});
// ============================================================================
// FullScreenUtilities.js
// Handles fullscreen toggling and canvas resize/restore.
// ============================================================================

// ---- Fullscreen Constants ---------------------------------------------------

const FULLSCREEN_CONSTS = Object.freeze(
{
    FULLSCREEN_KEY  : "KeyF",
    NAV_UI          : "hide",
    MARGIN          : "0 auto",
    CSS_CLASS       : "fullscreen",
});


// ---- FullScreenUtil ---------------------------------------------------------

const FullScreenUtil =
{
    // Enters or exits fullscreen — tries vendor-prefixed APIs as fallback
    toggleFullScreen(canvas)
    {
        if (!document.fullscreenElement)
        {
            (canvas.requestFullscreen       && canvas.requestFullscreen({ navigationUI: FULLSCREEN_CONSTS.NAV_UI })) ||
            (canvas.webkitRequestFullscreen && canvas.webkitRequestFullscreen())                                     ||
            (canvas.msRequestFullscreen     && canvas.msRequestFullscreen());
        }
        else
        {
            (document.exitFullscreen       && document.exitFullscreen())       ||
            (document.webkitExitFullscreen && document.webkitExitFullscreen()) ||
            (document.msExitFullscreen     && document.msExitFullscreen());
        }
    },

    // Applies fullscreen CSS class — actual scaling handled via stylesheet
    resizeCanvasToFullscreen(canvas)
    {
        if (!canvas) return;
        canvas.classList.add(FULLSCREEN_CONSTS.CSS_CLASS);
    },

    // Restores canvas to fixed game resolution and removes fullscreen class
    restoreCanvas(canvas, game)
    {
        canvas.style.width  = `${game.gameConsts.SCREEN_WIDTH}px`;
        canvas.style.height = `${game.gameConsts.SCREEN_HEIGHT}px`;
        canvas.style.margin = FULLSCREEN_CONSTS.MARGIN;
        canvas.classList.remove(FULLSCREEN_CONSTS.CSS_CLASS);
    }
};


// ---- Event Listeners --------------------------------------------------------

// Toggle fullscreen on F key
window.addEventListener("keydown", e =>
{
    if (e.code === FULLSCREEN_CONSTS.FULLSCREEN_KEY)
        FullScreenUtil.toggleFullScreen(document.getElementById("canvas"));
});

// Resize or restore canvas when fullscreen state changes
document.addEventListener("fullscreenchange", () =>
{
    const canvas = document.getElementById("canvas");
    if (!myController?.game) return;

    const game = myController.game;

    if (document.fullscreenElement)
    {
        FullScreenUtil.resizeCanvasToFullscreen(canvas);
        game.isGameFullscreen = true;
    }
    else
    {
        FullScreenUtil.restoreCanvas(canvas, game);
        game.isGameFullscreen = false;
    }
});
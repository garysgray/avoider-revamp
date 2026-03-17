// ============================================================================
// DebugUtilities.js
// Debug overlay — toggleable hitboxes, debug text panel, and dev-mode input.
// All debug features are gated behind DEV_MODE.
// ============================================================================

// ---- Debug Constants --------------------------------------------------------

const DEBUG_CONSTS = Object.freeze(
{
    PANEL_ID        : "debug-panel",
    TEXT_ID         : "debug-text",
    CANVAS_ID       : "canvas",
    TOGGLE_KEY      : "Backquote",    // ` key — toggles debug text panel
    HITBOX_KEY      : "KeyH",         // H key — toggles hitbox rendering
    PANEL_GAP       : 10,             // px gap between panel and canvas edge
    PANEL_DIVIDER   : "----------------",
    TITLE           : "PUCKMAN DEBUG",
});


// ---- DebugUtil --------------------------------------------------------------

const DebugUtil =
{
    DEV_MODE            : false,
    DRAW_DEBUG_TEXT     : false,
    DRAW_DEBUG_HITBOXES : false,
    debugLines          : [],

    // ---- Debug Lines --------------------------------------------------------

    addDebugLine(line)  { this.debugLines.push(line); },
    clearDebugLines()   { this.debugLines.length = 0; },

    // Writes all debug lines to the debug text element
    writeDebugText()
    {
        const el = document.getElementById(DEBUG_CONSTS.TEXT_ID);
        if (el) el.textContent = this.debugLines.join("\n");
    },

    // ---- Panel Update -------------------------------------------------------

    // Rebuilds and writes debug info each frame — skipped if debug text is off
    updateDebugPanel()
    {
        this.clearDebugLines();
        if (!this.DRAW_DEBUG_TEXT) return;

        this.addDebugLine(DEBUG_CONSTS.TITLE);
        this.addDebugLine(DEBUG_CONSTS.PANEL_DIVIDER);
        this.addDebugLine(`player posX: ${myController.game.player.posX}`);
        this.addDebugLine(`player posY: ${myController.game.player.posY}`);

        this.writeDebugText();
    },

    // Shows or hides the debug panel based on DRAW_DEBUG_TEXT flag
    updateDebugPanelVisibility()
    {
        document.getElementById(DEBUG_CONSTS.PANEL_ID)
            ?.classList.toggle("hidden", !this.DRAW_DEBUG_TEXT);
    },

    // Positions the debug panel to the left of the canvas, vertically centered
    updateDebugPanelPosition()
    {
        const panel  = document.getElementById(DEBUG_CONSTS.PANEL_ID);
        const canvas = document.getElementById(DEBUG_CONSTS.CANVAS_ID);
        if (!panel || !canvas) return;

        const r          = canvas.getBoundingClientRect();
        panel.style.left = (r.left - panel.offsetWidth - DEBUG_CONSTS.PANEL_GAP) + "px";
        panel.style.top  = (r.top  + r.height / 2 - panel.offsetHeight / 2)     + "px";
    }
};


// ---- Debug Input ------------------------------------------------------------

// Toggles debug features via keyboard — only active in DEV_MODE
window.addEventListener("keydown", e =>
{
    if (!DebugUtil.DEV_MODE) return;

    switch (e.code)
    {
        // Toggle debug text panel
        case DEBUG_CONSTS.TOGGLE_KEY:
            DebugUtil.DRAW_DEBUG_TEXT = !DebugUtil.DRAW_DEBUG_TEXT;
            DebugUtil.updateDebugPanelVisibility();
            break;

        // Toggle hitbox rendering
        case DEBUG_CONSTS.HITBOX_KEY:
            DebugUtil.DRAW_DEBUG_HITBOXES = !DebugUtil.DRAW_DEBUG_HITBOXES;
            console.log("Hitboxes:", DebugUtil.DRAW_DEBUG_HITBOXES ? "ON" : "OFF");
            break;
    }
});


// ---- Init -------------------------------------------------------------------

// Set initial panel visibility and position on load and resize
document.getElementById(DEBUG_CONSTS.PANEL_ID)?.classList.toggle("hidden", !DebugUtil.DRAW_DEBUG_TEXT);
window.addEventListener("load",   () => DebugUtil.updateDebugPanelPosition());
window.addEventListener("resize", () => DebugUtil.updateDebugPanelPosition());
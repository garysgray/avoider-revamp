// ============================================================================
// debugUtils.js
// ============================================================================

const DebugUtil =
{
    DEV_MODE:          true,
    DRAW_DEBUG_TEXT:   false,
    DRAW_DEBUG_HITBOXES: false,

    debugLines: [],

    addDebugLine(line)  { this.debugLines.push(line); },
    clearDebugLines()   { this.debugLines.length = 0; },

    writeDebugText()
    {
        const el = document.getElementById("debug-text");
        if (el) el.textContent = this.debugLines.join("\n");
    },

    updateDebugPanel()
    {
        this.clearDebugLines();
        if (!this.DRAW_DEBUG_TEXT) return;

        this.addDebugLine("PUCKMAN DEBUG");
        this.addDebugLine("----------------");
        this.addDebugLine(`player posX: ${myController.game.player.posX}`);
        this.addDebugLine(`player posY: ${myController.game.player.posY}`);
        this.writeDebugText();
    },

    updateDebugPanelVisibility()
    {
        document.getElementById("debug-panel")
            ?.classList.toggle("hidden", !this.DRAW_DEBUG_TEXT);
    },

    updateDebugPanelPosition()
    {
        const panel  = document.getElementById("debug-panel");
        const canvas = document.getElementById("canvas");
        if (!panel || !canvas) return;

        const r      = canvas.getBoundingClientRect();
        panel.style.left = (r.left - panel.offsetWidth - 10) + "px";
        panel.style.top  = (r.top  + r.height / 2 - panel.offsetHeight / 2) + "px";
    }
};

// ---- Debug Input (dev mode only) ----
window.addEventListener("keydown", e =>
{
    if (!DebugUtil.DEV_MODE) return;

    switch (e.code)
    {
        case "Backquote":
            DebugUtil.DRAW_DEBUG_TEXT = !DebugUtil.DRAW_DEBUG_TEXT;
            DebugUtil.updateDebugPanelVisibility();
            break;
        case "KeyH":
            DebugUtil.DRAW_DEBUG_HITBOXES = !DebugUtil.DRAW_DEBUG_HITBOXES;
            console.log("Hitboxes:", DebugUtil.DRAW_DEBUG_HITBOXES ? "ON" : "OFF");
            break;
    }
});

// ---- Init ----
document.getElementById("debug-panel")?.classList.toggle("hidden", !DebugUtil.DRAW_DEBUG_TEXT);
window.addEventListener("load",   () => DebugUtil.updateDebugPanelPosition());
window.addEventListener("resize", () => DebugUtil.updateDebugPanelPosition());
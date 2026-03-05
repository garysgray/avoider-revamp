// =======================================================
// DEBUG UTILITIES
// =======================================================
const DebugUtil = 
{
    // Flags
    DEV_MODE: false, // false when shipping, true when dev

    DRAW_DEBUG_TEXT: null,
    DRAW_DEBUG_HITBOXES: null,
    
    // Internal
    debugLines: [],
    
    // Text system
    addDebugLine(line) 
    {
        this.debugLines.push(line);
    },
    
    clearDebugLines() 
    {
        this.debugLines.length = 0;
    },
    
    writeDebugText() 
    {
        const el = document.getElementById("debug-text");
        if (!el) return;
        el.textContent = this.debugLines.join("\n");
    },
    
    // Panel
    updateDebugPanel() 
    {
        this.clearDebugLines();
        if (!this.DRAW_DEBUG_TEXT) return;
        
        try 
        {
            this.addDebugLine("PUCKMAN DEBUG");
            this.addDebugLine("----------------");
            this.addDebugLine(`player posX: ${myController.game.player.posX}`);
            this.addDebugLine(`player posY: ${myController.game.player.posY}`);
            
            this.writeDebugText();
        }
        catch (e) 
        {
            console.error("Debug panel error:", e);
        }
    },
    
    updateDebugPanelVisibility() 
    {
        const panel = document.getElementById("debug-panel");
        if (!panel) return;
        
        if (this.DRAW_DEBUG_TEXT)
            panel.classList.remove("hidden");
        else
            panel.classList.add("hidden");
    },
    
    updateDebugPanelPosition() 
    {
        const panel = document.getElementById("debug-panel");
        const canvas = document.getElementById("canvas");
        if (!panel || !canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        panel.style.left = (canvasRect.left - panel.offsetWidth - 10) + "px";
        panel.style.top = (canvasRect.top + canvasRect.height / 2 - panel.offsetHeight / 2) + "px";
    }
};

// Initialize debug flags based on DEV_MODE
DebugUtil.DRAW_DEBUG_TEXT = DebugUtil.DEV_MODE;
DebugUtil.DRAW_DEBUG_HITBOXES = DebugUtil.DEV_MODE;

// =======================================================
// DEBUG INPUT (DEV MODE ONLY)
// =======================================================
window.addEventListener("keydown", e => 
{
    if (!DebugUtil.DEV_MODE) return;
    
    switch (e.code) 
    {
        case "Backquote": // `
            DebugUtil.DRAW_DEBUG_TEXT = !DebugUtil.DRAW_DEBUG_TEXT;
            DebugUtil.updateDebugPanelVisibility();
            break;
            
        case "KeyH": // H
            DebugUtil.DRAW_DEBUG_HITBOXES = !DebugUtil.DRAW_DEBUG_HITBOXES;
            console.log("Hitboxes:", DebugUtil.DRAW_DEBUG_HITBOXES ? "ON" : "OFF");
            break;
    }
});

// =======================================================
// INITIALIZATION
// =======================================================
document.getElementById("debug-panel")?.classList.toggle("hidden", !DebugUtil.DRAW_DEBUG_TEXT);
window.addEventListener("load", () => DebugUtil.updateDebugPanelPosition());
window.addEventListener("resize", () => DebugUtil.updateDebugPanelPosition());
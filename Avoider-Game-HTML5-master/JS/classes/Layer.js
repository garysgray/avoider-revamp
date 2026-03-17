// ============================================================================
// Layer.js
// Wraps a render function with a name and safe error handling.
// Layers are registered in order and called each frame by the controller.
// ============================================================================

class Layer
{
    // name     — string identifier for debugging and logging
    // renderFn — function(device, game) called each frame to draw this layer
    constructor(name, renderFn)
    {
        this.name     = name;
        this.renderFn = renderFn;
    }

    // Calls the render function — errors are caught and logged per layer
    // so a single broken layer never takes down the whole render pass
    render(device, game)
    {
        try   { this.renderFn(device, game); }
        catch (e) { console.error(`Layer '${this.name}' render error:`, e); }
    }

    // ---- Static Helpers -----------------------------------------------------

    // Adds a single layer to the holder array
    static addRenderLayer(layer, holder)
    {
        try
        {
            if (!layer) throw new Error("Layer is undefined or null.");
            holder.push(layer);
        }
        catch (e) { console.error("Error adding layer:", e.message); }
    }

    // Adds multiple layers to the holder array in one call
    static addRenderLayers(layers, holder)
    {
        try
        {
            if (!Array.isArray(layers)) throw new Error("Layers must be an array.");
            layers.forEach(layer =>
            {
                if (!layer) throw new Error("Layer is undefined or null.");
                holder.push(layer);
            });
        }
        catch (e) { console.error("Error adding layers:", e.message); }
    }
}
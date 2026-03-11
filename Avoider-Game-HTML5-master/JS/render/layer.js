// ============================================================================
// Layer Class
// ----------------------------------------------------------------------------
// A layer is used to organize rendering in the game.  
// Each layer has a name (for identification) and a render function that draws content.  
// The main game loop can call each layer in order, giving structure to rendering.
// ============================================================================

class Layer
{
    // Constructor sets the name of the layer and the rendering function to call
    constructor(name, renderFn) 
    {
        this.name = name;       // String identifier for this layer
        this.renderFn = renderFn; // Function used to render the layer’s content
    }

    // Render method calls the assigned render function for this layer
    // Passes in the device (canvas/audio/inputs), game state, and delta time
    render(dev, game, screenWidth, screenHeight, hudBuff = 0, normFont = null, midFont = null, bigFont = null, highlightColor = null, fontColor = null)
{
    try 
    {
        this.renderFn(dev, game, screenWidth, screenHeight, hudBuff, normFont, midFont, bigFont, highlightColor, fontColor);
    } 
    catch (e) 
    {
        console.error(`Layer '${this.name}': Error during render -`, e);
    }
}

    // ------------------------------------------------------------------------
    // Add a render layer
    // ------------------------------------------------------------------------
    static addRenderLayer(layer, holder) 
    {
        try
        {
            if (!layer) throw new Error("Layer is undefined or null.");
            holder.push(layer);
        } 
        catch (error)
        {
            console.error("Error adding layer:", error.message);
            alert("An error occurred while adding a render layer.");
        }
    }
    // ------------------------------------------------------------------------
    // Add multiple render layers at once
    // ------------------------------------------------------------------------
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
        catch (error)
        {
            console.error("Error adding layers:", error.message);
            alert("An error occurred while adding render layers.");
        }
    }

}

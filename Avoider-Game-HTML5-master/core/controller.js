//I like having a controller it helps when developing and then later relocate to a better place
//for example one could have 2 game objects running and controller is where one could delegate the updates to run both


class Layer {
    constructor(name, renderFn) {
        this.name = name;
        this.renderFn = renderFn;
    }
    render(dev, game, delta) {
        this.renderFn(dev, game, delta);
    }
}

class Controller
{
    #dev;
    #game;
    #layers;    // array of Layer instances

    constructor()
    {
        //our controller has a device object to control the HTML5 Canvas
        this.#game = new Game();
        this.#dev = new Device( this.#game.canvasWidth,  this.#game.canvasHeight);
        this.#layers = [];
    }

    //----get Functions---- 
    get dev() { return this.#dev; }
    get game() { return this.#game; }
    
    //get game using device object
    initGame()
	{
        this.#game.initGame(this.#dev);
	}

    // Add a render layer
    addLayer(layer) {
        this.#layers.push(layer);
    }

    //update game logic and then render game objects and game text
    updateGame(delta)
    {
        update(this.#dev, this.#game, delta)
        renderGameObjects(this.#dev, this.#game, delta)
        renderText(this.#dev, this.#game, delta)

        // Render each layer in order
        for (const layer of this.#layers) 
        {
            layer.render(this.#dev, this.#game, delta);
        }
        
        //clears out key arrays to prevent errors
        this.#dev.keys.clearFrameKeys();
    }
}

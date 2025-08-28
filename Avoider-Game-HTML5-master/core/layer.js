class Layer {
    constructor(name, renderFn) {
        this.name = name;
        this.renderFn = renderFn;
    }
    render(dev, game, delta) {
        this.renderFn(dev, game, delta);
    }
}
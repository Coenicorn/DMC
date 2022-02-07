import { ImageLoader } from "./image.js";
class Renderer extends ImageLoader {
    imageLoader;
    width;
    height;
    canvas;
    context;
    /**
     * Initializes the renderer, takes an optional canvas id as argument
     */
    constructor(canvasID = null) {
        super();
        // check if canvas is given, if not, create it
        if (canvasID) {
            this.canvas = document.getElementById(canvasID);
        }
        else {
            this.canvas = document.createElement("canvas");
            document.body.appendChild(this.canvas);
        }
        this.context = this.canvas.getContext("2d");
        this.imageLoader = new ImageLoader();
        this.resize();
    }
    resize() {
        this.width = innerWidth;
        this.height = innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
}
export { Renderer };
//# sourceMappingURL=renderer.js.map
import { ImageLoader } from "./image.js";
export class Camera {
    x;
    y;
    zoom;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.zoom = 1;
    }
    follow(pos) {
        // do something
    }
}
export class Renderer extends ImageLoader {
    width;
    height;
    center;
    tileSize;
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
        // magic number, indicates the width and height of the sprites in pixels
        this.tileSize = 64;
        this.resize();
    }
    resize() {
        this.width = innerWidth;
        this.height = innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.center = { x: this.width / 2, y: this.height / 2 };
    }
}

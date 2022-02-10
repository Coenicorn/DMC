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
    }
}
export class Renderer extends ImageLoader {
    width;
    height;
    center;
    tileSize;
    canvas;
    context;
    constructor(canvasID = null) {
        super();
        if (canvasID) {
            this.canvas = document.getElementById(canvasID);
        }
        else {
            this.canvas = document.createElement("canvas");
            document.body.appendChild(this.canvas);
        }
        this.context = this.canvas.getContext("2d");
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

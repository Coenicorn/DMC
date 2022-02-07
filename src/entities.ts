import { GameObject } from "./gameObject.js";
import { Vec2 } from "./vec2.js";

class Player extends GameObject {
    constructor(pos: Vec2) {
        super(pos);
    }

    update() {
        this.pos.x += 1;
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = "red";
        context.fillRect(this.pos.x, this.pos.y, 50, 50);
    }
}

export { Player }
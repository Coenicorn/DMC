import { Vec2 } from "./vec2.js";

export abstract class GameObject {
    pos: Vec2;
    vel: Vec2;

    constructor(pos: Vec2) {
        this.pos = pos;
        this.vel = new Vec2(0, 0);
    }

    abstract update();

    abstract render(context: CanvasRenderingContext2D);
}
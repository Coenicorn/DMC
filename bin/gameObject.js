import { Vec2 } from "./vec2.js";
export class GameObject {
    pos;
    vel;
    constructor(pos) {
        this.pos = pos;
        this.vel = new Vec2(0, 0);
    }
}
//# sourceMappingURL=gameObject.js.map
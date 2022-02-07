import { GameObject } from "./gameObject.js";
class Player extends GameObject {
    constructor(pos) {
        super(pos);
    }
    update() {
        this.pos.x += 1;
    }
    render(context) {
        context.fillStyle = "red";
        context.fillRect(this.pos.x, this.pos.y, 50, 50);
    }
}
export { Player };
//# sourceMappingURL=entities.js.map
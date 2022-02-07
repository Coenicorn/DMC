export class Vec2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(par) {
        this.x += par.x;
        this.y += par.y;
    }
    sub(par) {
        this.x -= par.x;
        this.y -= par.y;
    }
    mult(par) {
        this.x *= par.x;
        this.y *= par.y;
    }
    div(par) {
        this.x /= par.x;
        this.y /= par.y;
    }
}
//# sourceMappingURL=vec2.js.map
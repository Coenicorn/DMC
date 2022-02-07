export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(par: Vec2) {
        this.x += par.x;
        this.y += par.y;
    }

    sub(par: Vec2) {
        this.x -= par.x;
        this.y -= par.y;
    }

    mult(par: Vec2) {
        this.x *= par.x;
        this.y *= par.y;
    }

    div(par: Vec2) {
        this.x /= par.x;
        this.y /= par.y;
    }
}
export class Player {
    position;
    direction;
    sprite;
    constructor(position) {
        this.position = position;
        this.direction = 0;
        this.sprite = "player_idle";
    }
    getSprite() {
        let dir = this.direction ? "left" : "right";
        return `player_idle_${dir}`;
    }
}

export class Player {
    position: Position;
    direction: number;
    sprite: string;

    constructor(position: Position) {
        this.position = position;
        this.direction = 0;
        this.sprite = "player_idle";
    }

    getSprite(): string {
        let dir = this.direction ? "left" : "right";
        return `player_idle_${dir}`;
    }
}
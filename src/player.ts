interface Position {
    x: number;
    y: number;
}

class Player {
    position: Position;
    direction: number;
    sprite: string;

    constructor(position: Position) {
        this.position = position;
        this.direction = 0;
        this.sprite = "player_idle";
    }
}

export { Player }
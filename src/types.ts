declare interface Position {
    x: number;
    y: number;
}

declare class Player {
    position: Position;
    direction: number;
    sprite: string;
}

declare class Camera {
    x: number;
    y: number;
    zoom: number;
    follow(pos: Position): void;
}

declare interface Tile {
    x: number;
    y: number;
    state: string;
    sprite: string;
    parent?: Tile;
    walkable?: boolean;
}

declare class Level {
    width: number;
    height: number;
    layout: Array<Array<Tile>>;
    theme: string;

    generateLayout(): Array<Array<Tile>>;
}
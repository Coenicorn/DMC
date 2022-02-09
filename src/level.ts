import { Game } from "./game.js";

export const tiles = {
    goodTiles: [
        "walk",
        "start",
        "end",
        "checkpoint"
    ],
    badTiles: [
        "nowalk",
        "spikes",
        "cracked"
    ]
}

export class Level {
    width: number;
    height: number;

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    layout: Array<Array<Tile>>;

    game: Game;

    // currently not used
    theme: string;

    constructor(width: number, height: number, game: Game, theme: string = "water") {
        this.theme = theme;
        this.game = game;

        this.width = width;
        this.height = height;

        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");

        // magic number go brrrrrrrrrrrr
        this.canvas.width = this.width * 64;
        this.canvas.height = this.height * 64;

        this.layout = this.generateLayout();
    }

    generateLayout(): Array<Array<Tile>> {
        let grid = [];

        // fill grid with random tiles
        for (let x = 0; x < this.width; x++) {
            let t: Array<Tile> = [];

            for (let y = 0; y < this.height; y++) {
                // get random bad tile
                let state: string = tiles.badTiles[Math.floor(Math.random()*tiles.badTiles.length)];

                t.push({x: x, y: y, state: state, sprite: state});
            }

            grid.push(t);
        }



        // random level generation *sigh*




        // cache level image
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                let tile = grid[x][y];

                // check if the tile exists, if it does, draw the current theme's backplate and the image
                if (tile.state != "nowalk") this.context.drawImage(this.game.Pic(this.game.theme), tile.x * 64, tile.y * 64);
                
                this.context.drawImage(this.game.Pic(tile.sprite), tile.x * 64, tile.y * 64);
            }
        }

        return grid;
    }
}
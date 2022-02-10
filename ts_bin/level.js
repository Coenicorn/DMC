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
};
export class Level {
    width;
    height;
    canvas;
    context;
    layout;
    game;
    theme;
    constructor(width, height, game, theme = "water") {
        this.theme = theme;
        this.game = game;
        this.width = width;
        this.height = height;
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = this.width * 64;
        this.canvas.height = this.height * 64;
        this.layout = this.generateLayout();
    }
    generateLayout() {
        let grid = [];
        for (let x = 0; x < this.width; x++) {
            let t = [];
            for (let y = 0; y < this.height; y++) {
                let state = tiles.badTiles[Math.floor(Math.random() * tiles.badTiles.length)];
                t.push({ x: x, y: y, state: state, sprite: state });
            }
            grid.push(t);
        }
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                let tile = grid[x][y];
                if (tile.state != "nowalk")
                    this.context.drawImage(this.game.Pic(this.game.theme), tile.x * 64, tile.y * 64);
                this.context.drawImage(this.game.Pic(tile.sprite), tile.x * 64, tile.y * 64);
            }
        }
        return grid;
    }
}

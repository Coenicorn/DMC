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
    // currently not used
    theme;
    constructor(width, height, game, theme = "water") {
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
    generateLayout() {
        let grid = [];
        // fill grid with random tiles
        for (let x = 0; x < this.width; x++) {
            let t = [];
            for (let y = 0; y < this.height; y++) {
                // get random bad tile
                let state = tiles.badTiles[Math.floor(Math.random() * tiles.badTiles.length)];
                t.push({ x: x, y: y, state: state, sprite: state });
            }
            grid.push(t);
        }
        // random level generation *sigh*
        // cache level image
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                let tile = grid[x][y];
                // check if the tile exists, if it does, draw the current theme's backplate and the image
                if (tile.state != "nowalk")
                    this.context.drawImage(this.game.Pic(this.game.theme), tile.x * 64, tile.y * 64);
                this.context.drawImage(this.game.Pic(tile.sprite), tile.x * 64, tile.y * 64);
            }
        }
        return grid;
    }
}

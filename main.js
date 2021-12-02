// ------------------------------------------------------------------------------
// RENDERING AND IMAGE LOADING
// ------------------------------------------------------------------------------

const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

const levelCache = document.getElementById("LevelCanvas");
const levelContext = levelCache.getContext("2d");

const width = canvas.width = screen.width;
const height = canvas.height = screen.height;


context.color = function (r, g, b, a = 1) {
    // if the input is rgba handle it accordingly
    if (g != undefined)
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    // and if it aint, assume it's a string color input like "blue"
    else
        context.fillStyle = r;
}

context.background = function (r, g = r, b = r, a = 1) {
    context.color(r, g, b, a);
    context.fillRect(0, 0, width, height);
}

context.clear = function () {
    context.clearRect(0, 0, width, height);
}

// image loading function I got from stackoverflow lol, preeeetty smart stuff

const imagePaths = [
    "assets/character/player_neutral.png", "assets/character/player_water.png",
    "assets/tiles/start.png", "assets/tiles/end.png", "assets/tiles/non_walkable_tile.png", "assets/tiles/walkable_tile1.png", "assets/tiles/walkable_tile2.png", "assets/tiles/walkable_tile3.png", "assets/tiles/spikes_retracted.png", "assets/tiles/spikes_extended.png"
];
const assets = [];

function loadImages(callback) {
    let imagesLoading = imagePaths.length;

    function onImageLoad() {
        imagesLoading--;

        if (!imagesLoading) {
            try {
                callback();
            } catch (e) { return }
        }
    }

    function main() {
        for (let i = 0; i < imagePaths.length; i++) {
            let t = new Image();
            t.src = imagePaths[i];

            assets.push(t);

            t.onload = onImageLoad;
        }
    }

    main();
}

function renderPlayer() {
    let x = playerX * tileSize;
    let y = playerY * tileSize - tileSize / 4;

    context.drawImage(assets[playerSpriteIndex], camera.x + x, camera.y + y, tileSize, tileSize);
}

function render() {
    context.imageSmoothingEnabled = false;

    context.clear();

    // render the level on the current canvas, duh
    context.drawImage(levelCache, camera.x, camera.y);

    renderPlayer();
}

// ------------------------------------------------------------------------------
// VARIABLE DECLARATIONS
// ------------------------------------------------------------------------------

let levelGrid;

let tileSize = 128;

let running = false;

let playerX, playerY, playerSpriteIndex = 0;
let startX, startY;

const instructions = [];

const mouse = {
    x: 0,
    y: 0,
    update: function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }
}

// everything other than the camera uses generalized coordinates
const camera = {
    x: 0,
    y: 0
}

// Tile values: 0 = start, 1 = end, 2 = non-walkable, 3 = walkable, 4 = spikes
const tileValues = {
    start: 1,
    end: 2,
    noWalk: 3,
    walk: 4,
    spike: 5
}

function Tile(x, y, state) {
    this.x = x;
    this.y = y;

    this.state = state;

    // this is pretty much unavoidable being hardcoded by what I know
    this.asset;
    switch (this.state) {
        case tileValues.start:
            this.asset = assets[2];
            break;
        case tileValues.end:
            this.asset = assets[3];
            break;
        case tileValues.noWalk:
            this.asset = assets[4];
            break;
        case tileValues.walk:
            let index = Math.floor(Math.random() * 3);
            this.asset = assets[5 + index];
            break;
        case tileValues.spike:
            this.asset = assets[8];
            break;
    }

    this.steppedOn = function () {
        switch (this.state) {
            case 0:

                break;
            case 1:

                break;
            case 2:

                break;
            case 3:

                break;
            case 4:

                break;
        }

        emitEvent({ type: "step" });
    }
}

// ------------------------------------------------------------------------------
// MAIN FUNCTIONS
// ------------------------------------------------------------------------------

function randomLevel(w, h) {
    let grid = [];
    for (let y = 0; y < h; y++) {
        let tempGrid = [];
        for (let x = 0; x < w; x++) {
            tempGrid.push({ x, y, state: tileValues.noWalk });
        }

        grid.push(tempGrid);
    }

    let startX = 1, startY = 1;

    function hasNeighbours(tile) {
        let x = tile.x;
        let y = tile.y;

        let n1 = (grid[y + 2] || [])[x] != undefined ? (grid[y + 2] || [])[x] : { state: tileValues.walk };
        let n2 = (grid[y] || [])[x + 2] != undefined ? (grid[y] || [])[x + 2] : { state: tileValues.walk };
        let n3 = (grid[y - 2] || [])[x] != undefined ? (grid[y - 2] || [])[x] : { state: tileValues.walk };
        let n4 = (grid[y] || [])[x - 2] != undefined ? (grid[y] || [])[x - 2] : { state: tileValues.walk };

        let neighbours = [];

        if (n1.state == tileValues.noWalk)
            neighbours.push(n1);
        if (n2.state == tileValues.noWalk)
            neighbours.push(n2);
        if (n3.state == tileValues.noWalk)
            neighbours.push(n3);
        if (n4.state == tileValues.noWalk)
            neighbours.push(n4);

        if (neighbours.length)
            return neighbours;
    }

    function generate(tile) {
        tile.state = tileValues.walk;

        let neighbours = hasNeighbours(tile);

        if (neighbours) {
            let next = neighbours[Math.floor(Math.random() * neighbours.length)];

            next.parent = tile;

            let betweenX = (tile.x + next.x) / 2;
            let betweenY = (tile.y + next.y) / 2;
            grid[betweenY][betweenX].state = tileValues.walk;

            generate(next);
        } else if (tile.parent) {
            generate(tile.parent);
        } else {
            gridToLayout();

            return;
        }
    }

    function gridToLayout() {
        let layout = [];

        for (let y = 0; y < grid.length; y++) {
            let tempLayout = [];

            for (let x = 0; x < grid[y].length; x++) {
                let state = grid[y][x].state;

                tempLayout.push(state);
            }

            layout.push(tempLayout);
        }

        layout[startX][startY] = tileValues.start;

        grid = layout;
    }

    generate(grid[startX][startY]);

    return grid;
}

function loadLevel(layout) {
    // set the width and height of the canvas
    levelCache.width = layout[0].length * tileSize;
    levelCache.height = layout.length * tileSize;

    levelContext.imageSmoothingEnabled = false;

    // loop through grid and check for start tile
    let grid = [];
    for (let y = 0, l1 = layout.length; y < l1; y++) {
        let tempGrid = [];

        for (let x = 0, l2 = layout[y].length; x < l2; x++) {
            let tileState = layout[y][x];

            if (tileState == tileValues.start) {
                startX = x;
                startY = y;
            }

            let tile = new Tile(x, y, tileState);

            tempGrid.push(tile);

            levelContext.drawImage(tile.asset, tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
        }

        grid.push(tempGrid);
    }

    if (startX == undefined || startY == undefined) {
        throw new Error("Level initialization error, no start tile defined");
    }

    resetPlayer();

    return grid;
}

// adds a html image element to the gui if one of the buttons is pressed
function addInstruction(state) {
    if (!running) {
        let element = document.createElement("img");
        element.src = `assets/ui/${state}.png`;
        element.id = "input";

        document.getElementById("gui").appendChild(element);

        instructions.push({ state: state, element: element });

        element.onclick = function () {
            document.getElementById("gui").removeChild(element);

            instructions.splice(instructions.indexOf({ state: state, element: element }));
        }
    }
}

function resetPlayer() {
    playerX = startX;
    playerY = startY;
}

function resetLevel() {

}

function runLevel() {
    resetPlayer();
    resetLevel();
}

// if I every want animations I'll have to implement a main loop, but not rn, too much work

function load() {
    levelGrid = loadLevel(randomLevel(100, 100));

    emitEvent({ type: "load" });
}

// ------------------------------------------------------------------------------
// EVENT SYSTEM
// ------------------------------------------------------------------------------

function emitEvent(event /*expects an event object with a type and potential arguments*/) {
    switch (event.type) {
        case "keyup":
            switch (event.key) {
                case "Enter":
                    run();
                    break;
                case "ArrowUp":
                    addInstruction(0);
                    break;
                case "ArrowRight":
                    addInstruction(1);
                    break;
                case "ArrowDown":
                    addInstruction(2);
                    break;
                case "ArrowLeft":
                    addInstruction(3);
                    break;
            }
            break;
        case "step":
            // if I ever want to do anything with this in the future
            break;
        case "begin":
            document.getElementById("loadingScreen").style.visibility = "hidden";
    }

    render();
}

addEventListener("keyup", emitEvent);
addEventListener("mousemove", mouse.update);

onload = loadImages(load);
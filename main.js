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
    "assets/tiles/start.png", "assets/tiles/end.png", "assets/tiles/walk1.png", "assets/tiles/walk2.png", "assets/tiles/walk3.png",
    "assets/tiles/spikes.png", "assets/tiles/spikes_extended.png", "assets/tiles/cracked.png", "assets/tiles/broken.png",
    "assets/tiles/water_tile.png", "assets/tiles/badshit_tile.png", "assets/tiles/checkpoint.png"
];

const assets = [];

function loadImages(callback) {
    let imagesLoading = imagePaths.length - 1;

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

function assetFromState(state) {
    let t;

    switch (state) {
        case "walk":
            t = `assets/tiles/${state + Math.ceil(Math.random() * 2)}.png`;
            break;

        case "on_tile":
            t = `assets/tiles/${currentTheme}_tile.png`;
            break;

        default:
            t = `assets/tiles/${state}.png`;
            break;
    }

    return assets[imagePaths.indexOf(t)];
}

function renderPlayer() {
    let x = playerX * tileSize;
    let y = playerY * tileSize - tileSize / 4;

    context.drawImage(assets[playerSpriteIndex], camera.x + x, camera.y + y, tileSize, tileSize);
}

function updateTileSprite(tile) {
    let x = tile.x * tileSize;
    let y = tile.y * tileSize;

    levelContext.clearRect(x, y, tileSize, tileSize);

    levelContext.drawImage(tile.asset, x, y, tileSize, tileSize);
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
// width and height of the level grid, no real units
let levelWidth = 50, levelHeight = 50;

let tileSize = 112;
let levelSize = 10;

let running = null;
// timers in milliseconds
const updateInterval = 250;
const deathTimer = 2000;

// let currentTheme = "badshit";
let currentTheme = "water";

let playerX, playerY, playerSpriteIndex = 0;
let startX, startY;

let currentInstruction = null;

const checkpointInterval = 15;

let focussed = true;

// everything other than the camera uses generalized coordinates
const camera = {
    x: 0,
    y: 0,
    speed: 0.05,
    toPlayer: function () {
        let x = (width / 2 - playerX * tileSize - tileSize / 2 - camera.x) * camera.speed;
        let y = (height / 2 - playerY * tileSize - tileSize / 2 - camera.y) * camera.speed;

        camera.x += x;
        camera.y += y;
    }
}

function Tile(x, y, state) {
    this.x = x;
    this.y = y;

    this.state = state;

    this.asset = assetFromState(this.state);
}

const tiles = ["cracked", "spikes", "nowalk", "checkpoint", "end", "walk"];
const badTiles = tiles.slice(0, 3);
const goodTiles = tiles.slice(3, 6);

// ------------------------------------------------------------------------------
// MAIN FUNCTIONS
// ------------------------------------------------------------------------------

function randomLevel(w, h) {
    let grid = [];

    for (let y = 0; y < h + 1; y++) {
        let tempGrid = [];
        for (let x = 0; x < w + 1; x++) {
            let tile = badTiles[Math.floor(Math.random() * badTiles.length)];

            tempGrid.push({ x, y, state: tile });
        }

        grid.push(tempGrid);
    }

    let startX = 1, startY = 1;
    let hasEnd = 0, steps = 0;

    function hasNeighbours(tile) {
        let x = tile.x;
        let y = tile.y;

        let n1 = (grid[y + 2] || [])[x] != undefined ? (grid[y + 2] || [])[x] : { state: "walk" };
        let n2 = (grid[y] || [])[x + 2] != undefined ? (grid[y] || [])[x + 2] : { state: "walk" };
        let n3 = (grid[y - 2] || [])[x] != undefined ? (grid[y - 2] || [])[x] : { state: "walk" };
        let n4 = (grid[y] || [])[x - 2] != undefined ? (grid[y] || [])[x - 2] : { state: "walk" };

        let neighbours = [];

        if (badTiles.indexOf(n1.state) > -1)
            neighbours.push(n1);
        if (badTiles.indexOf(n2.state) > -1)
            neighbours.push(n2);
        if (badTiles.indexOf(n3.state) > -1)
            neighbours.push(n3);
        if (badTiles.indexOf(n4.state) > -1)
            neighbours.push(n4);

        if (neighbours.length)
            return neighbours;
    }

    function generate(tile) {
        if (badTiles.indexOf(tile.state) != -1)
            tile.state = "walk";

        let neighbours = hasNeighbours(tile);

        if (neighbours) {
            let next = neighbours[Math.floor(Math.random() * neighbours.length)];

            next.parent = tile;

            let betweenX = (tile.x + next.x) / 2;
            let betweenY = (tile.y + next.y) / 2;
            grid[betweenY][betweenX].state = "walk";

            generate(next);
        } else if (tile.parent) {

            generate(tile.parent);

            return;
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

        layout[startX][startY] = "start";

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

            if (tileState == "start") {
                startX = x;
                startY = y;
            }

            let tile = new Tile(x, y, tileState);

            tempGrid.push(tile);

            if (tile.state == "nowalk") continue;

            levelContext.drawImage(assetFromState("on_tile"), tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
            levelContext.drawImage(tile.asset, tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
        }

        grid.push(tempGrid);
    }

    if (startX == undefined || startY == undefined) {
        throw new Error("Level initialization error, no start tile defined");
    }

    resetPlayer();
    camera.toPlayer();

    return grid;
}

function handleTile(tile) {
    try {
        let ded = false;

        switch (tile.state) {
            case "nowalk":
                ded = true;
                playerSpriteIndex = 1;

                break;
            case "cracked":
                ded = true;
                playerSpriteIndex = 1;

                tile.asset = assetFromState("broken");
                updateTileSprite(tile);

                break;
            case "spikes":
                ded = true;
                playerSpriteIndex = 1;

                tile.asset = assetFromState("spikes_extended");
                updateTileSprite(tile);
        }

        if (ded) {
            stopDaWalk();
            setTimeout(resetPlayer, deathTimer);
        }
    } catch (e) {
        stopDaWalk();
        playerSpriteIndex = 1;

        setTimeout(resetPlayer, deathTimer);
    }
}

function move(dir) {
    // I want to implement move animations at some point but not rn honestly

    switch (dir) {
        case 0:
            playerY--;
            break;
        case 1:
            playerX++;
            break;
        case 2:
            playerY++;
            break;
        case 3:
            playerX--;
            break;
    }
}

function stopDaWalk() {
    clearInterval(running);
    running = null;
}

function resetPlayer() {
    playerSpriteIndex = 0;

    playerX = startX;
    playerY = startY;
}

function nextLevel() {
    currentInstruction = null;

    levelSize += 1;
    levelGrid = loadLevel(randomLevel(levelSize, levelSize));

    killPlayer();
}

function setSpawn() {
    startX = playerX;
    startY = playerY;
}

function runLevel() {
    if (running == null) {
        stopDaWalk();
        resetPlayer();
        running = setInterval(main, updateInterval);
    }

    function main() {

        move(currentInstruction);

        handleTile((levelGrid[playerY] || [])[playerX]);
    }
}

let desired = 60, fps = 1000 / desired, dt = 0, last = Date.now();
function mainLoop() {
    // delta time game loop, remember for other projects lol

    let now = Date.now();
    if (focussed)
        dt = (now - last) / fps;
    last = now;

    camera.speed = dt * 0.05;
    camera.toPlayer();

    render();

    requestAnimationFrame(mainLoop);
}

function load() {
    levelGrid = loadLevel(randomLevel(levelSize, levelSize));

    mainLoop();
}

// ------------------------------------------------------------------------------
// EVENT HANDLING
// ------------------------------------------------------------------------------

function emitEvent(event /*expects an event object with a type and potential arguments*/) {
    switch (event.type) {
        case "keyup":
            switch (event.key) {
                case "ArrowUp":
                    currentInstruction = 0;
                    runLevel();
                    break;
                case "ArrowRight":
                    currentInstruction = 1;
                    runLevel();
                    break;
                case "ArrowDown":
                    currentInstruction = 2;
                    runLevel();
                    break;
                case "ArrowLeft":
                    currentInstruction = 3;
                    runLevel();
                    break;
            }
            break;
        case "steppedOn":
            // if I ever want to do anything with this in the future
            break;
        case "move":
            // if I ever want to do anything with this in the future
            break;
        case "begin":
            document.getElementById("loadingScreen").style.visibility = "hidden";
    }
}

addEventListener("blur", () => focussed = false);
addEventListener("focus", () => focussed = true);
addEventListener("keyup", emitEvent);

onload = loadImages(load);
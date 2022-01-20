/* 
    Code copyrighted by... nobody, you're free to use this sh*t whenever you'd like
    I couldn't care less what you do with this, it's shit anyway lol
    Please just credit me, or not even me, the awesome people who made the art
    for this game, it's seriously cool of them to have done so and it would
    just be disrespectful to not do so, thanks!

    Anyway, prepare for a shitty ride if you're just trying to look
    through this code, it's pretty bad, I didn't spend that much time
    on writing comments, sorry...
*/




// ------------------------------------------------------------------------------
// RENDERING AND IMAGE LOADING
// ------------------------------------------------------------------------------

// reference to DOM canvas
const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

const levelCache = document.createElement("canvas");
const levelContext = levelCache.getContext("2d");

let width = canvas.width = innerWidth;
let height = canvas.height = innerHeight;

context.clear = function () {
    context.clearRect(0, 0, width, height);
}

// image loading function I got from stackoverflow lol, preeeetty smart stuff

const imagePaths = [
    "player_idle_left", "player_idle_right", "player_water",
    "start", "end", "walk1", "walk2", "walk3", "nowalk",
    "spikes", "spikes_extended", "cracked", "broken", "piranha",
    "water", "badshit_tile", "checkpoint"
];

const assets = [];

function loadImages() {
    let imagesLoading = imagePaths.length - 1;

    function onImageLoad() {
        imagesLoading--;

        if (!imagesLoading) {
            try {
                // callback, not needed right now
            } catch (e) { throw e }
        }
    }

    function main() {
        for (let i = 0; i < imagePaths.length; i++) {
            let t = new Image(), src = imagePaths[i];
            t.src = "assets/" + src + ".png";

            // this makes the array behave like an object, super useful
            assets[src] = t;

            t.onload = onImageLoad;
        }
    }

    main();
}

// get a sprite from the assets array, doesn't raelly add anything atm
function Pic(what) {
    if (what === "walk") return assets[what + Math.round(Math.random() * 2 + 1)];

    return assets[what];
}

function renderPlayer() {
    // calculate player coordinates, offset the player by a little bit to make it look like he's standing on the stones
    let x = (player.x * tileSize) * camera.zoom;
    let y = (player.y * tileSize - tileSize / 4) * camera.zoom;

    // account for player direction
    let dir = "";
    if (player.sprite == "player_idle") dir = player.direction == 0 ? "_left" : "_right";

    context.drawImage(Pic(player.sprite + dir), camera.x + x, camera.y + y, tileSize * camera.zoom, tileSize * camera.zoom); 
}

function updateTileSprite(tile, sprite) {
    let x = tile.x * tileSize;
    let y = tile.y * tileSize;

    levelContext.clearRect(x, y, tileSize, tileSize);

    if (sprite) levelContext.drawImage(Pic(sprite), x, y, tileSize, tileSize);
    else levelContext.drawImage(Pic(tile.state), x, y, tileSize, tileSize);
}

function render() {
    context.imageSmoothingEnabled = false;

    context.clear();

    // render the level on the current canvas, duh
    context.drawImage(levelCache, camera.x, camera.y, levelCache.width * camera.zoom, levelCache.height * camera.zoom);

    renderPlayer();
}

// ------------------------------------------------------------------------------
// VARIABLE DECLARATIONS
// ------------------------------------------------------------------------------

let levelGrid;

// tileSize shouldn't change... like, ever, references the image size in pixels
let tileSize = 64;
let levelSize = 10;

let running = false;
// timers in milliseconds
const updateInterval = 250;
const deathTimer = 2000;

let currentTheme = "water";

let deathTile = null;
let currentInstruction = 0;
let focussed = true;

let startX, startY;
let player;


// everything other than the camera uses generalized coordinates
const camera = {
    x: 0,
    y: 0,
    speed: 0.05,
    zoom: 1.5,
    busy: false,
    toPlayer: function () {
        // get vectors to the player from the camera
        let px = (player.x * tileSize * camera.zoom) + tileSize * camera.zoom / 2;
        let py = (player.y * tileSize * camera.zoom) + tileSize * camera.zoom / 2;

        // subtract from center to... center the movement
        let x = (width/2 - px - camera.x) * camera.speed;
        let y = (height / 2 - py - camera.y) * camera.speed;

        camera.x += x;
        camera.y += y;
    }
}

function Player() {
    this.x = 0;
    this.y = 0;
    this.direction = 0;
    this.sprite = "player_idle";

    this.move = function(dir) {
        switch (dir) {
            case 0:
                player.y--;
    
                break;
            case 1:
                player.x++;
                player.direction = 1;
    
                break;
            case 2:
                player.y++;
    
                break;
            case 3:
                player.x--;
                player.direction = 0;
    
                break;
        }
    }

    this.kill = function(cause) {
        // get a reference to the player
        let self = this;

        // set the running variable to neither true or false, stopping everything
        running = 2;

        // set player sprite
        switch (cause) {
            case "cracked":
                this.sprite = "player_" + currentTheme;
                break;
            case "spikes":
                // player.sprite = "player_spikes"
                this.sprite = "player_" + currentTheme;
                break;
            case "nowalk":
                this.sprite = "player_" + currentTheme
        }

        // if there's no cause, it's a new level
        if (cause) setTimeout(resetPlayer, deathTimer);
        else resetPlayer();

        function resetPlayer() {
            self.x = startX;
            self.y = startY;

            self.sprite = "player_idle";

            // update the deathTile sprite;
            if (deathTile) updateTileSprite(deathTile);

            running = false;
        }
    }
}

function Tile(x, y, state) {
    this.x = x;
    this.y = y;

    this.state = state;
}

const tiles = ["cracked", "spikes", "nowalk", "checkpoint", "end", "walk"];
const badTiles = tiles.slice(0, 3);
const goodTiles = tiles.slice(3, 6);

// ------------------------------------------------------------------------------
// MAIN FUNCTIONS
// ------------------------------------------------------------------------------

/*
    Maze generation logic:
    step 1: Get the neighbouring tiles that aren't walkable
    step 2: If the list is empty, backtrack
    step 3: Else, pick a random tile from this list to repeat this process on
    step 4: If the 
*/

// random level generation code
function randomLevel(w, h) {
    let grid = [];

    // set starting point\
    startX = 1;
    startY = 1;

    // loop through grid and random non-walkable tiles
    for (let y = 0; y < h + 1; y++) {
        let tempGrid = [];
        for (let x = 0; x < w + 1; x++) {
            // random tile from bad tiles array
            let tile = badTiles[Math.floor(Math.random() * badTiles.length)];

            tempGrid.push({ x, y, state: tile });
        }

        grid.push(tempGrid);
    }

    function hasNeighbours(tile) {
        let x = tile.x;
        let y = tile.y;

        let n1 = (grid[y + 2] || [])[x] != undefined ? (grid[y + 2] || [])[x] : { state: "walk" };
        let n2 = (grid[y] || [])[x + 2] != undefined ? (grid[y] || [])[x + 2] : { state: "walk" };
        let n3 = (grid[y - 2] || [])[x] != undefined ? (grid[y - 2] || [])[x] : { state: "walk" };
        let n4 = (grid[y] || [])[x - 2] != undefined ? (grid[y] || [])[x - 2] : { state: "walk" };

        let neighbours = [];

        if (badTiles.includes(n1.state))
            neighbours.push(n1);
        if (badTiles.includes(n2.state))
            neighbours.push(n2);
        if (badTiles.includes(n3.state))
            neighbours.push(n3);
        if (badTiles.includes(n4.state))
            neighbours.push(n4);

        if (neighbours.length)
            return neighbours;
    }

    function generateLayout(tile) {
        // set current tile to walkable
        tile.state = "walk";

        // get neighbours
        let neighbours = hasNeighbours(tile);

        // declare next
        let next;

        if (neighbours) {
            // pick a random neighbour
            next = neighbours[Math.floor(Math.random() * neighbours.length)];

            next.parent = tile;

            // make the tile in between current and neighbour walkable
            let betweenX = (tile.x + next.x) / 2;
            let betweenY = (tile.y + next.y) / 2;
            grid[betweenY][betweenX].state = "walk";
        }
        
        // if there are no valid neighbours, backtrack
        if (tile.parent && !next) next = tile.parent;

        // check for neighbour
        if (next) {
            generateLayout(next);
        } else {
            generateSpecial();
        }
    }

    // generates start, end and checkpoints
    function generateSpecial() {
        // traverse current grid and look for farthest point from the player
        let dstHigh, highTile;

        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                let current = grid[x][y];

                if (current.state != "walk") continue;

                let dst = Math.abs(current.x - startX) + Math.abs(current.y - startY);

                if (!dstHigh || dstHigh < dst) {
                    dstHigh = dst;
                    highTile = current;
                }
            }
        }

        // set the tile farthest away to the end
        highTile.state = "end";
        
        // set start
        grid[startX][startY].state = "start";

        loadLevel();
    }

    // convert the grid to valid tiles
    function loadLevel() {
        // set the width and height of the canvas
        levelCache.width = grid[0].length * tileSize;
        levelCache.height = grid.length * tileSize;
    
        levelContext.imageSmoothingEnabled = false;

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                let tile = new Tile(x, y, grid[y][x].state);
                grid[y][x] = tile;

                if (tile.state === "start") {
                    startX = tile.x;
                    startY = tile.y;
                }

                if (tile.state === "nowalk") continue;

                levelContext.drawImage(Pic(currentTheme), tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
                levelContext.drawImage(Pic(tile.state), tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
            }
        }

        if (startX == undefined || startY == undefined) {
            throw new Error("Level initialization error, no start tile defined");
        }

        player.kill();
        camera.toPlayer();
    }

    generateLayout(grid[startX][startY]);

    return grid;
}

// for when the player 
function handleTile(tile) {
    // for the right death sprite
    let cause;

    try {
        switch (tile.state) {
            // not on a tile
            case "nowalk":
                cause = "nowalk";

                break;
            
            case "cracked":
                cause = "cracked"

                updateTileSprite(tile, "broken");

                break;
            case "broken":
                player.kill("nowalk");

                break;
            case "spikes":
                cause = "spikes";

                updateTileSprite(tile, "spikes_extended");

                break;
            case "end":
                nextLevel();

        }

        if (!cause) return;

        deathTile = tile;

        player.kill(cause);

    } catch (e) {
        // in case the player goes out of bounds there'd be no tile and an error would occur, hence this
        player.kill();
    }
}

function nextLevel() {
    currentInstruction = 0;

    levelSize += 1;
    levelGrid = randomLevel(levelSize, levelSize);

    player.kill();
}

function runLevel() {
    if (!running) {
        player.kill();
        running = true;
        
        main();
    }

    function main() {
        player.move(currentInstruction);

        handleTile((levelGrid[player.y] || [])[player.x]);

        if (running == true) setTimeout(main, updateInterval);
    }
}

let desired = 60, fps = 1000 / desired, dt = 0, last = Date.now();
function mainLoop() {
    // delta time game loop, remember for other projects lol

    let now = Date.now();
    if (focussed) dt = (now - last) / fps;
    last = now;

    update();
    render();

    requestAnimationFrame(mainLoop);
}

function update() {
    camera.speed = dt * 0.05;
    camera.toPlayer();
}

function load() {
    player = new Player();

    levelGrid = randomLevel(levelSize, levelSize);

    mainLoop();
}

function keyInput(event) {
    let isArrow = false;

    switch (event.key) {
        case "ArrowUp":
            currentInstruction = 0;
            isArrow = true;

            break;
        case "ArrowRight":
            currentInstruction = 1;
            isArrow = true;

            break;
        case "ArrowDown":
            currentInstruction = 2;
            isArrow = true;

            break;
        case "ArrowLeft":
            currentInstruction = 3;
            isArrow = true;

            break;
    }

    if (isArrow) runLevel();
}

function onResize() {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;
}

addEventListener("blur", () => focussed = false);
addEventListener("focus", () => focussed = true);
addEventListener("keydown", keyInput);
addEventListener("resize", onResize);

onload = loadImages;
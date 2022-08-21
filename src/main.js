/* 
    Code copyrighted by... nobody, you're free to use this sh*t whenever you'd like
    I couldn't care less what you do with this, it's shit anyway lol
    Please just credit me, or not even me, the awesome people who made the art
    for this game, it's seriously cool of them to have done so and it would
    just be disrespectful to not credit them, thanks!

    Anyway, prepare for a shitty ride if you're just trying to look
    through this code, it's pretty bad lol.
*/




// ------------------------------------------------------------------------------
// RENDERING AND IMAGE LOADING
// ------------------------------------------------------------------------------

// reference to DOM canvas
const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

let levelCache;
let levelContext;

let width = canvas.width = innerWidth;
let height = canvas.height = innerHeight;

context.clear = function () {
    context.clearRect(0, 0, width, height);
}

// image loading function I got from stackoverflow lol, preeeetty smart stuff

const imagePaths = [
    "player_idle_left", "player_idle_right", "player_water", "player_won",
    "start", "end", "walk1", "walk2", "walk3", "nowalk",
    "spikes", "spikes_death", "cracked", "broken_death", "piranha",
    "water", "water_death", "checkpoint", "bridge_horizontal", "bridge_vertical"
];

const assets = [];
let assetsLoaded = false;

function loadImages() {
    let imagesLoading = imagePaths.length - 1;

    function onImageLoad() {
        imagesLoading--;

        if (!imagesLoading) {
            try {
                assetsLoaded = true;
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

// get a sprite from the assets array, randomizes the normal stone tile
function Pic(what) {
    if (what === "walk") return assets[what + Math.round(Math.random() * 2 + 1)];

    if (assets[what]) return assets[what];
}

function renderPlayer() {
    // calculate player coordinates, offset the player by a little bit to make it look like he's standing on the stones
    let x = (player.spriteX * tileSize) * camera.zoom;
    let y = (player.spriteY * tileSize - tileSize / 4) * camera.zoom;

    // account for player direction
    let dir = "";
    if (player.sprite == "player_idle") dir = player.direction == 0 ? "_left" : "_right";

    context.drawImage(Pic(player.sprite + dir), camera.x + x, camera.y + y, tileSize * camera.zoom, tileSize * camera.zoom);
}

// changes the tile sprite on the level cache
function updateTileSprite(tile, sprite) {
    let x = tile.x * tileSize;
    let y = tile.y * tileSize;

    levelContext.clearRect(x, y, tileSize, tileSize);

    if (sprite && sprite !== currentTheme + "_death") levelContext.drawImage(Pic(currentTheme), x, y, tileSize, tileSize);

    // if there's another sprite given, draw that, otherwise just draw the tile's sprite
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

function lerp(x1, y1, x2, y2, t) {
    if (t < 0 || t > 1) throw new Error("t must be between 0 and 1 in lerp");

    return [
        x1 + (x2 - x1) * t,
        y1 + (y2 - y1) * t
    ];
}

// ------------------------------------------------------------------------------
// VARIABLE DECLARATIONS
// ------------------------------------------------------------------------------

let levelGrid;

// tileSize shouldn't change... like, ever, references the image size in pixels
let tileSize = 64;
let levelSize = 10;

let running = false;
let ready = false;

// timers in milliseconds
let updateInterval = 200;
const lowestUpdateInterval = 200;
const deathTimer = 2000;

let updateIncrease = 30;
let speedIncrease = 0.005;

let currentTheme = "water";

let deathTile = null;
let currentInstruction = 0;
let focussed = true;

// keeps track of start tile and last checkpoint
let startX, startY, checkX, checkY;

// amount of steps in between checkpoints
let checkPointInterval = 20;
let player;

let mouse = {
    x: 0,
    y: 0
}

// everything other than the camera uses generalized coordinates
const camera = {
    x: 0,
    y: 0,
    zoom: 2,
    toPlayer: function () {
        // translate to screen coordinates
        // let x = player.spriteX * tileSize * camera.zoom;
        // let y = player.spriteY * tileSize * camera.zoom;

        // let changeX = (width / 2 - camera.x - x) / tileSize * camera.zoom;
        // let changeY = (height / 2 - camera.y - y) / tileSize * camera.zoom;

        // camera.x += changeX * deltaTime;
        // camera.y += changeY * deltaTime;

        camera.x = (width / 2) - player.spriteX * tileSize * camera.zoom;
        camera.y = (height / 2) - player.spriteY * tileSize * camera.zoom;
    },

    calculateSpeed: function () {
        camera.speed = tileSize * camera.zoom / (updateInterval / fps);
    }
}

function Player() {
    this.x = 0;
    this.y = 0;

    this.spriteX = 0;
    this.spriteY = 0;

    this.direction = 0;
    this.sprite = "player_idle";

    this.speed = 0.04;

    this.move = async function (dir) {
        return new Promise((resolve, reject) => {
            let lastX = this.x;
            let lastY = this.y;

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

            let t = 0;

            function moveSprite() {
                let [lerpX, lerpY] = lerp(lastX, lastY, this.x, this.y, t);
                this.spriteX = lerpX;
                this.spriteY = lerpY;

                t += this.speed;

                if (t >= 1) {
                    resolve();

                    this.spriteX = this.x;
                    this.spriteY = this.y;

                    return;
                }

                requestAnimationFrame(moveSprite.bind(this));
            }

            requestAnimationFrame(moveSprite.bind(this));
        });
    }

    this.kill = function (cause) {
        // get a reference to the player
        let self = this;

        // set the running variable to neither true or false, stopping everything
        running = 2;

        // change player sprite
        switch (cause) {
            case "cracked":
                this.sprite = "nowalk";
                break;
            case "spikes":
                // player.sprite = "player_spikes"
                this.sprite = "nowalk";
                break;
            case "nowalk":
                this.sprite = "nowalk";
                break;
            case "won":
                this.sprite = "player_won";
                break;
        }

        // if there's no cause, it's a new level
        if (cause) setTimeout(() => {
            resetPlayer(cause);
        }, deathTimer);
        else resetPlayer();

        function resetPlayer(cause) {
            // checks for next level
            self.x = startX;
            self.y = startY;

            self.spriteX = self.x;
            self.spriteY = self.y;

            self.sprite = "player_idle";

            // update the deathTile sprite, check for new level (no cause)
            if (deathTile && cause) updateTileSprite(deathTile);

            running = false;

            if (cause == "won") nextLevel();
        }
    }
}

function Tile(x, y, state) {
    this.x = x;
    this.y = y;

    this.state = state;
}

// if you want to add a new tile, you need to update these three lines of code
const tiles = ["cracked", "spikes", "nowalk", "checkpoint", "end", "walk", "start"];
const badTiles = tiles.slice(0, 3);
const goodTiles = tiles.slice(3, 7);

// ------------------------------------------------------------------------------
// MAIN FUNCTIONS
// ------------------------------------------------------------------------------

/*
    Maze generation logic: (not that advanced):

        step 1: Get the neighbouring tiles that aren't walkable
        step 2: If the list is empty, backtrack
        step 3: Else, pick a random tile from this list to repeat this process on
        step 4: If there's no tiles left, load level
*/

// random level generation code
function randomLevel(w, h) {
    let grid = [];

    // set starting point
    startX = 1;
    startY = 1;

    // loop through grid and random non-walkable tiles
    for (let y = 0; y < h + 1; y++) {
        let tempGrid = [];
        for (let x = 0; x < w + 1; x++) {
            // random tile from bad tiles array
            let state = badTiles[Math.floor(Math.random() * badTiles.length)];

            tempGrid.push({ x, y, state });
        }

        grid.push(tempGrid);
    }

    function getNeighbours(tile) {
        let x = tile.x;
        let y = tile.y;

        let n1 = (grid[y + 2] || [])[x];
        let n2 = (grid[y] || [])[x + 2];
        let n3 = (grid[y - 2] || [])[x];
        let n4 = (grid[y] || [])[x - 2];

        return [n1, n2, n3, n4];
    }

    function generateLayout(tile) {
        // set current tile to walkable
        tile.state = "walk";

        // get neighbours
        let neighbours = getNeighbours(tile);

        // declare next
        let next;

        // pick a random neighbour
        while (true) {
            next = neighbours[Math.floor(Math.random() * neighbours.length)];

            if (next != undefined && badTiles.includes(next.state) || neighbours.length == 0) break;

            neighbours.splice(neighbours.indexOf(next), 1);
        }

        if (next) {
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
        // loop through current grid and look for farthest point from the player
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

        // generate checkpoints by traversing the current grid and placing a checkpoint every set amount of steps 
        // let steps = 0, lastCheck;

        // function move(tile) {

        // }

        // set start
        grid[startX][startY].state = "start";

        loadLevel();
    }

    // convert the grid to valid tiles
    function loadLevel() {
        levelCache = document.createElement("canvas");
        levelContext = levelCache.getContext("2d");

        // set the width and height of the canvas
        levelCache.width = grid[0].length * tileSize;
        levelCache.height = grid.length * tileSize;

        levelContext.imageSmoothingEnabled = false;

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                let tile = new Tile(x, y, grid[y][x].state);

                // set start tile
                if (tile.state === "start") {
                    startX = tile.x;
                    startY = tile.y;
                    checkX = startX;
                    checkY = startY;
                }

                grid[y][x] = tile;

                // if there's no tile here, continue
                if (tile.state === "nowalk") continue;

                // draw tile sprite on top of the current theme (in the water case, ripples around the rock)
                levelContext.drawImage(Pic(currentTheme), tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
                levelContext.drawImage(Pic(tile.state), tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);

                // draw connections between walkable tiles

                // left
                if (goodTiles.includes(tile.state)) {

                    if ((grid[y] || [])[x - 1] && goodTiles.includes((grid[y] || [])[x - 1].state)) levelContext.drawImage(Pic("bridge_horizontal"), tile.x * tileSize - tileSize / 2, tile.y * tileSize, tileSize, tileSize);
                    if ((grid[y - 1] || [])[x] && goodTiles.includes((grid[y - 1] || [])[x].state)) levelContext.drawImage(Pic("bridge_vertical"), tile.x * tileSize, tile.y * tileSize - tileSize / 2, tileSize, tileSize);

                }
            }
        }

        if (startX == undefined || startY == undefined) {
            throw new Error("Level initialization error, no start tile defined");
        }

        player.kill();
    }

    generateLayout(grid[startX][startY]);

    return grid;
}

// for when the player 
function handleTile(tile) {
    // for the right death sprite later
    let cause;
    let sprite;

    try {
        switch (tile.state) {
            // not on a tile
            case "nowalk":
                cause = "nowalk";

                sprite = currentTheme + "_death";

                break;

            case "cracked":
                cause = "cracked";

                sprite = "broken_death";

                break;

            case "spikes":
                cause = "spikes";

                sprite = "spikes_death";

                break;

            case "end":
                cause = "won";

                break;
        }

        if (sprite) updateTileSprite(tile, sprite);

        if (!cause) return;

        deathTile = tile;

        player.kill(cause);
    } catch (e) {
        // in case the player goes out of bounds there'd be no tile and an error would occur, hence this
        player.kill(currentTheme + "_death");
    }
}

function nextLevel() {
    currentInstruction = 0;

    levelSize += 2;
    updateInterval -= updateIncrease;
    if (updateInterval < lowestUpdateInterval) updateInterval = lowestUpdateInterval;
    player.speed += speedIncrease;

    levelGrid = randomLevel(levelSize, levelSize);

    camera.calculateSpeed();
}

async function runLevel() {
    if (!running) {
        player.kill();
        running = true;

        main();
    }

    async function main() {
        await player.move(currentInstruction);

        // cheeky little check if there is a tile there
        handleTile((levelGrid[player.y] || [])[player.x]);

        if (running == true) setTimeout(main, updateInterval);
    }
}

let desired = 60, fps = 1000 / desired, deltaTime = 0, last = Date.now();
function mainLoop() {
    // delta time game loop, remember for other projects lol

    let now = Date.now();
    if (focussed) deltaTime = (now - last) / fps;
    last = now;

    // update();
    camera.toPlayer();
    render();

    requestAnimationFrame(mainLoop);
}

function update() {

    // might add other stuff here later, idk
}

function load() {
    player = new Player();

    levelGrid = randomLevel(levelSize, levelSize);

    camera.calculateSpeed();

    document.getElementById("loadingScreen").className = "animation";

    mainLoop();
}

// input handler
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

    // run level on arrow down
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
addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
})

onload = loadImages;
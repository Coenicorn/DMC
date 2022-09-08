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

let width, height, centerX, centerY;

context.clear = function () {
    context.clearRect(0, 0, width, height);
}

// image loading function I got from stackoverflow lol, preeeetty smart stuff

const imagePaths = [
    "player_idle_left", "player_idle_right", "player_water", "player_won",
    "start", "end", "walk1", "walk2", "walk3", "nowalk",
    "spikes", "spikes_death", "cracked", "broken_death", "piranha",
    "water1", "water2", "water_death", "checkpoint", "bridge_horizontal", "bridge_vertical"
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
    if (what === "water") return assets[what + Math.round(Math.random() + 1)];

    if (assets[what]) return assets[what];
}

function renderPlayer() {
    // calculate player coordinates, offset the player by a little bit to make it look like he's standing on the stones
    let [x, y] = getScreenCoordinates(player.spriteX, player.spriteY - .3);

    // account for player direction
    let dir = "";
    if (player.sprite == "player_idle") dir = dirsX[player.direction] < 0 ? "_left" : "_right";

    context.drawImage(Pic(player.sprite + dir), x, y, tileSize * camera.zoom, tileSize * camera.zoom);
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

    let [x, y] = getScreenCoordinates(0, 0);

    // render the level on the current canvas
    context.drawImage(levelCache, x, y, levelCache.width * camera.zoom, levelCache.height * camera.zoom);

    renderPlayer();
}

function lerp(x1, y1, x2, y2, t) {
    if (t < 0 || t > 1) throw new Error("t must be between 0 and 1 in lerp");

    return [
        x1 + (x2 - x1) * t,
        y1 + (y2 - y1) * t
    ];
}

function getScreenCoordinates(gX, gY) {
    // multiply with tilesize because all coordinates correspond to tiles on the map

    let x = gX - camera.x-1;
    let y = gY - camera.y-1;

    return [
        centerX + x * camera.zoom * tileSize,
        centerY + y * camera.zoom * tileSize
    ];
}

// ------------------------------------------------------------------------------
// VARIABLE DECLARATIONS
// ------------------------------------------------------------------------------

const dirsX = [0, 1, 0, -1];
const dirsY = [-1, 0, 1, 0];

let levelGrid;

// tileSize shouldn't change... like, ever, references the image size in pixels
let tileSize = 64;
let levelSize = 10;

// timers in milliseconds
let updateInterval = 200;
const lowestUpdateInterval = 200;
const deathTimer = 2000;

let updateIncrease = 30;
let speedIncrease = 0.005;

let currentTheme = "water";

let deathTile = null;
let currentInstruction = -1;
let focussed = true;

let running = false;

let playerScore = 0;

// timer for sprite animations
let animationTick = 0;
const maxAnimationTick = 64;

// keeps track of start tile
let startX, startY

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
    zoom: 10,
    dZoom: 2,
    toPlayer: function () {
        // translate to screen coordinates
        // let x = player.spriteX * tileSize * camera.zoom;
        // let y = player.spriteY * tileSize * camera.zoom;

        // let changeX = (width / 2 - camera.x - x) / tileSize * camera.zoom;
        // let changeY = (height / 2 - camera.y - y) / tileSize * camera.zoom;

        // camera.x += changeX * deltaTime;
        // camera.y += changeY * deltaTime;

        camera.x = player.spriteX - .5;
        camera.y = player.spriteY - .5;
    },
    // function to reset zoom based on some speed
    updateZoom: function() {
        let d = camera.dZoom - camera.zoom;

        if (d === 0) return;

        camera.zoom += d / 6;
    }
}

class Player {
    x;
    y;
    lX;
    lY;
    spriteX;
    spriteY;
    direction;
    sprite;
    movementTick;
    speed;

    constructor() {
        this.x = this.y = 0;

        this.lX = this.lY = 0;
    
        this.spriteX = this.spriteY = 0;
    
        this.direction = 0;
        this.sprite = "player_idle";
    
        this.movementTick = 0;
    
        this.speed = 0.04;
    }

    move(direction) {
        this.direction = direction;

        this.lX = this.x;
        this.lY = this.y;

        this.x += dirsX[direction];
        this.y += dirsY[direction];
    }

    animate(dt) {
        this.movementTick += this.speed * dt;

        if (this.movementTick >= 1) {
            this.movementTick = 0;
            handleTile((levelGrid[this.y]||[])[this.x]);
            return;
        }

        let [x, y] = lerp(this.lX, this.lY, this.x, this.y, this.movementTick);

        this.spriteX = x;
        this.spriteY = y;
    }

    kill(cause) {
        // hack for death screen timeout.
        // without this you can spam any arrow and keep moving, introducing bugs
        // spaghetti code though
        this.movementTick = 1;

        let t = 0;

        // if there's no cause, it's a new level
        if (cause) {
            t = deathTimer
            camera.dZoom = 3;
        }

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
                camera.dZoom = 2;
                break;
        }

        running = false;

        setTimeout(()=>{
            resetPlayer(cause, this);
        }, t);

        function resetPlayer(cause, self) {
            // checks for next level
            self.x = startX;
            self.y = startY;

            self.spriteX = self.x;
            self.spriteY = self.y;

            self.sprite = "player_idle";

            // update the deathTile sprite, check for new level (no cause)
            if (deathTile && cause) updateTileSprite(deathTile);

            if (cause == "won") nextLevel();

            self.movementTick = 0;

            camera.dZoom = 2;
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
    running = false;

    levelSize += 2;

    // speed up
    updateInterval -= updateIncrease;
    if (updateInterval < lowestUpdateInterval) updateInterval = lowestUpdateInterval;
    player.speed += speedIncrease;

    levelGrid = randomLevel(levelSize, levelSize);
}

function runLevel() {
    if (running || player.movementTick) return;

    running = true;
    camera.dZoom = 2.2;
}

let desired = 60, fps = 1000 / desired, last = Date.now();
function loop() {
    let now = Date.now();
    let dt = (now - last) / fps;
    last = now;

    animationTick++;
    if (animationTick >= maxAnimationTick) animationTick = 0;

    if (running) {
        tick();
        player.animate(dt);
    }
    
    camera.updateZoom();
    camera.toPlayer();
    render();

    requestAnimationFrame(loop);
}

function tick() {
    if (player.movementTick === 0) {
        player.move(currentInstruction);
    }
}

// gets called when start button is clicked, called from html
function load() {
    onResize();

    player = new Player();

    levelGrid = randomLevel(levelSize, levelSize);

    document.getElementById("loadingScreen").className = "animation";

    requestAnimationFrame(loop);
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
        case "w":
            if (!running)
            camera.dZoom *= 1.1;
            break;
        case "s":
            if (!running)
            camera.dZoom /= 1.1;
            break;
    }

    // run level on arrow down
    if (isArrow) runLevel();
}

function onResize() {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;

    centerX = width/2;
    centerY = height/2;
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
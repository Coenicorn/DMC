/* 
    Code copyrighted by... nobody, you're free to use this sh*t whenever you'd like
    I couldn't care less what you do with this, it's pretty doodoo anyway lol
    Please just credit me, or not even me, the awesome people who made the art
    for this game, it's seriously cool of them to have done so and it would
    just be disrespectful to not credit them, thanks!

    Anyway, prepare for an **amazing** -_- ride if you're just trying to look
    through this code, it's pretty bad lol.
*/

// ------------------------------------------------------------------------------
// RENDERING AND IMAGE LOADING
// ------------------------------------------------------------------------------

// reference to DOM canvas
const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

// level cache
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
    "water1", "water2", "water_death", "checkpoint", "bridge_horizontal", "bridge_vertical",
    "fancy_arrow"
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
    let [x, y] = getScreenCoordinates(player.x, player.y - .3);

    // account for player direction
    // not set for debugging, might forget to turn on, we'll see
    let dir = "";
    if (player.sprite == "player_idle") dir = "_left";

    context.drawImage(Pic(player.sprite + dir), x, y, imageSize * camera.zoom, imageSize * camera.zoom);
}

// updates the tile sprite on the level cache after death "animation" has played
function updateTileSprite(tile, sprite) {
    let x = tile.x * imageSize;
    let y = tile.y * imageSize;

    levelContext.clearRect(x, y, imageSize, imageSize);

    if (sprite && sprite !== currentTheme + "_death") levelContext.drawImage(Pic(currentTheme), x, y, imageSize, imageSize);

    // if there's another sprite given, draw that, otherwise just draw the tile's sprite
    if (sprite) levelContext.drawImage(Pic(sprite), x, y, imageSize, imageSize);
    else levelContext.drawImage(Pic(tiles[tile.state]), x, y, imageSize, imageSize);
}

function render() {
    // no blurry images here!
    context.imageSmoothingEnabled = false;

    context.clear();

    let [x, y] = getScreenCoordinates(0, 0);

    // render the level on the current canvas
    context.drawImage(levelCache, x, y, levelCache.width * camera.zoom, levelCache.height * camera.zoom);
    let a = (deathAmnt / 10);
    context.globalAlpha = a < 0 ? 0 : a / 3;
    context.drawImage(pathCache, x, y, levelCache.width * camera.zoom, levelCache.height * camera.zoom);
    context.globalAlpha = 1;

    renderPlayer();

    // render arrow pointing to mouse
    [x, y] = getScreenCoordinates(player.x+.5, player.y+.5);
    let dX = mouse.x - x;
    let dY = mouse.y - y;

    let angle = Math.atan2(centerX - mouse.x, centerY - mouse.y);

    let m = Math.sqrt(Math.pow(Math.abs(dX), 2) + Math.pow(Math.abs(dY), 2));
    dX = (dX / m * 20);
    dY = (dY / m * 20);

    context.save();
    context.translate(x + dX, y + dY);
    context.rotate(-angle);
    context.translate(-(x + dX), -(y + dY));
    context.globalAlpha = .7;
    context.drawImage(Pic("fancy_arrow"), (x + dX)-imageSize/2, (y + dY)-imageSize/2, imageSize, imageSize);
    context.globalAlpha = 1;
    context.restore();
}

function getScreenCoordinates(gX, gY) {
    // multiply with imageSize because all coordinates correspond to tiles on the map

    let x = gX - camera.x-1;
    let y = gY - camera.y-1;

    return [
        centerX + x * camera.zoom * imageSize,
        centerY + y * camera.zoom * imageSize
    ];
}

// ------------------------------------------------------------------------------
// VARIABLE DECLARATIONS
// ------------------------------------------------------------------------------

let levelGrid;
let pathCache;

// imageSize shouldn't change... like, ever, references the image size in pixels
let imageSize = 64;
let levelSize = 10;

// currently not used for much, might get more active in the future
let currentTheme = "water";

// tile player last died on
let deathTile = null;

/* unused */
let focussed = true;

// game state
let running = false;

let playerScore = 0;

// timers for sprite animations
let animationTick = 0;

// amount of deaths
let deathAmnt = 0;

// keeps track of start tile
let startX, startY

let player;
let camera;

let mouse = {
    x: 0,
    y: 0
}

// ------------------------------------------------------------------------------
// MAIN FUNCTIONS
// ------------------------------------------------------------------------------

function getTilePos(x, y) { return ((levelGrid[Math.round(y)]||[])[Math.round(x)]||[]); }

// for when the player 
function handleTile(tile) {
    // for the right death sprite later
    let cause;
    let sprite;

    try {
        switch (tiles[tile.state]) {
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
        deathAmnt++;
    } catch (e) {
        // in case the player goes out of bounds there'd be no tile and an error would occur, hence this
        player.kill(currentTheme + "_death");
        deathAmnt++;
    }
    if (deathAmnt > 10) deathAmnt = 10;
}

function updateScore() {
    document.getElementById("score").innerHTML = "Score: " + playerScore;
}

function initNewLevel() {
    levelGrid = randomLevel(levelSize, levelSize);

    const path = findPath(levelGrid, 1, 1, levelSize-1, levelSize-1);

    pathCache = document.createElement("canvas");
    const ct = pathCache.getContext("2d");

    pathCache.width = levelCache.width;
    pathCache.height = levelCache.height;

    for (let i = 1, l = path.length; i < l; i++) {
        ct.strokeStyle = "red";
        ct.lineWidth = 10;
        ct.beginPath();
        ct.moveTo((path[i-1].x + .5) * imageSize, (path[i-1].y + .5) * imageSize);
        ct.lineTo((path[i].x + .5) * imageSize, (path[i].y + .5) * imageSize);
        ct.closePath();
        ct.stroke();
    }
}

function nextLevel() {
    // stop the gameloop
    running = false;

    // make level bigger (and thus harder)
    levelSize += 2;

    // update score
    playerScore++;
    updateScore();

    // speed up
    player.speed += speedIncrease;
    if (player.speed > maxSpeed) player.speed = maxSpeed;

    initNewLevel();

    deathAmnt = 0;
}

function tick(dt) {
    // move player

    // get vector from player to mouse
    let [dX, dY] = getScreenCoordinates(player.x+.5, player.y+.5);
    dX = mouse.x - dX;
    dY = mouse.y - dY;

    // normalize
    let m = Math.sqrt(Math.pow(Math.abs(dX), 2) + Math.pow(Math.abs(dY), 2));

    // set to player speed
    dX = dX / m * player.speed * dt;
    dY = dY / m * player.speed * dt;

    player.x += dX;
    player.y += dY;
    
    // check tile beneath player
    handleTile(getTilePos(player.x, player.y));
}

let desired = 60, fps = 1000 / desired, last = Date.now();
function loop() {
    let now = Date.now();
    let dt = (now - last) / fps;
    last = now;

    // increment and wrap around animation tick
    // used for any animations in the code
    animationTick++;
    if (animationTick >= maxAnimationTick) animationTick = 0;

    if (running) {
        tick(dt);
    }
    
    camera.follow(player.x-.5, player.y-.5);
    camera.update();

    render();

    requestAnimationFrame(loop);
}

// gets called when start button is clicked, called from html
function load() {
    onResize();

    camera = new Camera();
    player = new Player();

    initNewLevel();

    document.getElementById("howtoplay").style.visibility = "visible";
    document.getElementById("loadingScreen").className = "animation";

    updateScore();

    requestAnimationFrame(loop);
}

function onResize() {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;

    centerX = width/2;
    centerY = height/2;
}

const controls = {
    " ": ()=>{
        document.getElementById("clicktoplay").click();
        if (!running) running = true;
        if (!player.movementTick) camera.setZoom(2.2);
    }
}

addEventListener("blur", () => focussed = false);
addEventListener("focus", () => focussed = true);
addEventListener("resize", onResize);
addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
addEventListener("keydown", (e) => {
    if (controls[e.key]) controls[e.key]();
});

onload = loadImages;
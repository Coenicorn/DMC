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

    context.drawImage(Pic(player.sprite + dir), x, y, tileSize * camera.m_zoom, tileSize * camera.m_zoom);
}

// changes the tile sprite on the level cache
function updateTileSprite(tile, sprite) {
    let x = tile.x * tileSize;
    let y = tile.y * tileSize;

    levelContext.clearRect(x, y, tileSize, tileSize);

    if (sprite && sprite !== currentTheme + "_death") levelContext.drawImage(Pic(currentTheme), x, y, tileSize, tileSize);

    // if there's another sprite given, draw that, otherwise just draw the tile's sprite
    if (sprite) levelContext.drawImage(Pic(sprite), x, y, tileSize, tileSize);
    else levelContext.drawImage(Pic(tiles[tile.state]), x, y, tileSize, tileSize);
}

function render() {
    context.imageSmoothingEnabled = false;

    context.clear();

    let [x, y] = getScreenCoordinates(0, 0);

    // render the level on the current canvas
    context.drawImage(levelCache, x, y, levelCache.width * camera.m_zoom, levelCache.height * camera.m_zoom);

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
    context.drawImage(Pic("fancy_arrow"), (x + dX)-tileSize/2, (y + dY)-tileSize/2, tileSize, tileSize);
    context.globalAlpha = 1;
    context.restore();
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
        centerX + x * camera.m_zoom * tileSize,
        centerY + y * camera.m_zoom * tileSize
    ];
}

// ------------------------------------------------------------------------------
// VARIABLE DECLARATIONS
// ------------------------------------------------------------------------------

let levelGrid;

// tileSize shouldn't change... like, ever, references the image size in pixels
let tileSize = 64;
let levelSize = 10;

// timers in milliseconds
const deathTimer = 2000;

let speedIncrease = 0.005;
let maxSpeed = 0.1;

let currentTheme = "water";

let deathTile = null;
let focussed = true;

let running = false;

let playerScore = 0;

// timer for sprite animations
let animationTick = 0;
const maxAnimationTick = 64;

// keeps track of start tile
let startX, startY

let player;
let camera;

let mouse = {
    x: 0,
    y: 0
}

class Camera {
    x;
    y;
    // velocity
    vX;
    vY;
    // target
    tX;
    tY;
    m_zoom;
    m_dZoom;
    m_speed;

    constructor() {
        this.x = this.y = this.vX = this.vY = this.tX = this.tY = 0;
        this.m_zoom = 1;
        this.m_dZoom = 1;
        this.m_speed = 1;
        this.m_maxSpeed = 10;
    }

    follow(x, y) {
        this.tX = x;
        this.tY = y;
    }

    updateVel() {
        // get vector from current position towards target position
        let v = [this.tX - this.x, this.tY - this.y];
        // get magnitude and normalize
        let m = Math.sqrt(Math.pow(Math.abs(v[0]), 2) + Math.pow(Math.abs(v[1]), 2));

        if (m < .01)
        {
            this.vX = 0;
            this.vY = 0;
            return;
        }

        // get new magnitude
        let nM = m * this.m_speed;

        if (m > this.maxSpeed) nM = this.m_maxSpeed;

        v[0] = v[0] / m * nM;
        v[1] = v[1] / m * nM;

        this.vX = v[0];
        this.vY = v[1];
    }

    update() {
        this.updateVel();

        // update zoom
        let dZ = (this.m_dZoom - this.m_zoom) / 6;
        this.m_zoom += dZ;

        this.x += this.vX;
        this.y += this.vY;
    }

    zoom(z) {
        this.m_dZoom = z;
    }
}

class Player {
    x;
    y;
    lX;
    lY;
    direction;
    sprite;
    movementTick;
    speed;

    constructor() {
        this.x = this.y = 0;

        this.lX = this.lY = 0;
    
        this.direction = 0;
        this.sprite = "player_idle";
    
        this.movementTick = 0;
    
        this.speed = 0.01;
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
            camera.zoom(3);
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
                camera.zoom(2);
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

            self.x = self.x;
            self.y = self.y;

            self.sprite = "player_idle";

            // update the deathTile sprite, check for new level (no cause)
            if (deathTile && cause) updateTileSprite(deathTile);

            if (cause == "won") nextLevel();

            self.movementTick = 0;

            camera.zoom(2);
        }
    }
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
    } catch (e) {
        // in case the player goes out of bounds there'd be no tile and an error would occur, hence this
        player.kill(currentTheme + "_death");
    }
}

function updateScore() {
    document.getElementById("score").innerHTML = "Score: " + playerScore;
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

    levelGrid = randomLevel(levelSize, levelSize);
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

    levelGrid = randomLevel(levelSize, levelSize);

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

addEventListener("blur", () => focussed = false);
addEventListener("focus", () => focussed = true);
addEventListener("resize", onResize);
addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
addEventListener("keydown", (e) => {
    if (e.key == " ") {
        document.getElementById("clicktoplay").click();
        if (!running && !player.movementTick) {
            running = true;
            camera.zoom(2.2);
        }
    }
});

onload = loadImages;
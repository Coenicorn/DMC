// timers in milliseconds
const deathTimer = 2000;
const maxAnimationTick = 64;
function Tile(x, y, state) {
    this.x = x;
    this.y = y;

    this.state = state;
}

// if you want to add a new tile, you need to update these three lines of code
const tiles = ["cracked", "spikes", "nowalk", "checkpoint", "end", "walk", "start"];
// To check if a tile is walkable without includes(), just check if it's state is lower/higher than this
const firstWalkableTile = 3;
const speedIncrease = 0.003;
const maxSpeed = 0.07;

class Camera {
    x;
    y;
    // velocity
    vX;
    vY;
    // target
    tX;
    tY;
    // current setZoom
    zoom;
    // target setZoom for nice interpolation
    dZoom;
    // how fast the camera moves
    speed;

    constructor() {
        this.x = this.y = this.vX = this.vY = this.tX = this.tY = 0;
        this.zoom = 1;
        this.dZoom = 1;
        this.speed = 1;
        this.maxSpeed = 10;
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
        let nM = m * this.speed;

        if (m > this.maxSpeed) nM = this.maxSpeed;

        v[0] = v[0] / m * nM;
        v[1] = v[1] / m * nM;

        this.vX = v[0];
        this.vY = v[1];
    }

    update() {
        this.updateVel();

        // update setZoom
        let dZ = (this.dZoom - this.zoom) / 6;
        this.zoom += dZ;

        this.x += this.vX;
        this.y += this.vY;
    }

    setZoom(z) {
        this.dZoom = z;
    }
}

class Player {
    x;
    y;
    lX;
    lY;
    sprite;
    movementTick;
    speed;

    constructor() {
        this.x = this.y = 0;

        this.lX = this.lY = 0;
    
        this.sprite = "player_idle";
    
        this.movementTick = 0;
    
        this.speed = 0.02;
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
            camera.setZoom(3);
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
                camera.setZoom(2);
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

            camera.setZoom(2);
        }
    }
}
import { Renderer } from "./rendering/renderer.js";
import { Player } from "./entities.js";

class Game extends Renderer{
    renderer: Renderer;

    fps: number;
    running: boolean;

    currentDirection: number;
    player: Player;

    theme: string;

    constructor() {
        super();

        this.renderer = new Renderer();

        this.running = false;
    }

    async init() {
        await this.renderer.loadAssets([
            "cracked"
        ]);

        this.running = true;

        this.loop();
    }

    loop() {
        let last = Date.now();
        let now = 0;
        let lag = 0;

        this.fps = 1000/60;

        function run() {
            now = Date.now();
            lag = now - last;
            last = now;

            while (lag > 0) {
                this.update();

                lag -= this.fps;
            }

            this.render();

            if (this.running)
                requestAnimationFrame(run.bind(this));
        }

        // bind it to the Game object to use 'this'
        requestAnimationFrame(run.bind(this));
    }

    update() {
        
    }

    render() {
        this.renderer.clear();

        // render player
    }
}

export { Game }
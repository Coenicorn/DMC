import { GameObject } from "./gameObject.js";
import { Renderer } from "./rendering/renderer.js";
import { Vec2 } from "./vec2.js";
import { Player } from "./entities.js";

class Game extends Renderer{
    renderer: Renderer;

    fps: number;
    running: boolean;

    testObject: GameObject;

    gameObjects: Array<GameObject>;

    constructor() {
        super();

        this.renderer = new Renderer();

        this.gameObjects = [];
        this.running = false;
    }

    async init() {
        await this.renderer.imageLoader.loadAssets([], "../img");

        this.running = true;

        this.gameObjects.push(new Player(new Vec2(0, 0)));

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
        for (let obj of this.gameObjects) {
            obj.update();
        }
    }

    render() {
        this.renderer.clear();

        for (let obj of this.gameObjects) {
            obj.render(this.renderer.context);
        }
    }
}

export { Game }
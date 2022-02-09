import { Game } from "./game.js";
const game = new Game();
addEventListener("resize", game.resize);
onload = async () => {
    await game.init();
};

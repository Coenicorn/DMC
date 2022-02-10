import { Game } from "./game.js";
const game = new Game();
addEventListener("resize", game.resize.bind(game));
onload = async () => {
    await game.init();
};

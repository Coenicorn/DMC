"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
class Renderer {
    contructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
    }
    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map
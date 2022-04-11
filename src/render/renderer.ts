export class Renderer {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    public width: number;
    public height: number;

    contructor(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
}
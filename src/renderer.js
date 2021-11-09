const canvas = document.getElementById("GameScreen");
const screen = canvas.getContext("2d");

const WIDTH = canvas.width = window.screen.width;
const HEIGHT = canvas.height = window.screen.height;

const seaBlue = "rgba(0, 200, 255, 0.5)";

const fishDisplay = document.getElementById("fish");

screen.centre = new Vector2(WIDTH/2, HEIGHT/2);

screen.clear = function ()
{
    screen.clearRect(0, 0, WIDTH, HEIGHT);
}

screen.color = function color(c)
{
    screen.fillStyle = c;
}

screen.rect = function rect(x, y, w, h)
{
    screen.fillRect(x, y, w, h);
}

screen.line = function line(x1, y1, x2, y2, w = 1)
{
    screen.beginPath();
    screen.lineWidth = w;
    screen.moveTo(x1, y1);
    screen.lineTo(x2, y2);
    screen.stroke();
    screen.closePath();
}

// image loading

const assetPaths = ["assets/boat_im_ashamed.png", "assets/background.png", "assets/fishing_rod.png", "assets/bobber.png", "assets/player.png", "assets/fish.png"];
const assets = [];

// expects a callback function as input
function loadImages(callBack)
{
    let imageCount = assetPaths.length;

    function onImageLoad()
    {
        imageCount--;

        if (imageCount == 0)
        {
            callBack();
        }
    }

    function run()
    {
        for (let i = 0, len = imageCount; i < len; i++)
        {
            let img = new Image();
            img.src = assetPaths[i];

            assets.push(img);

            img.onload = onImageLoad;
        }
    }

    run();
}
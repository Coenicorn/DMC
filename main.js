const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

const width = canvas.width = screen.width;
const height = canvas.height = screen.height;

// sum postprocessing hack to be implemented

// const postprocessing = function(intensity)
// {
//     let t = new OffscreenCanvas(width, height);

    
// }(10);

context.color = function(r, g, b, a = 1)
{
    // if the input is rgba handle it accordingly
    if (r != null && g != null && b != null)
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    // and if it aint, assume it's a string color input like "blue"
    else
        context.fillStyle = c;
}

context.background = function(r, g = r, b = r, a = 1)
{
    context.color(r, g, b, a);
    context.fillRect(0, 0, width, height);
}

// image loading function I got from stackoverflow lol, preeeetty smart stuff

const imagePaths = ["assets/up.png","assets/right.png","assets/down.png","assets/left.png","assets/player_neutral.png","assets/player_happy.png"];
const assets = [];

function loadImages(callback)
{
    let imagesLoading = imagePaths.length;

    function onImageLoad()
    {
        imagesLoading--;

        if (!imagesLoading)
            callback();

            return;
    }

    function main()
    {
        for (let i = 0; i < imagePaths.length; i++)
        {
            let t = new Image();
            t.src = imagePaths[i];

            assets.push(t);

            t.onload = onImageLoad;
        }
    }

    main();
}

const mouse = {x: 0, y: 0}

// spacing in pixels
const nodeSpacing = 4;

const instructionSize = 60;
const instructionSpacing = 4;

// level stuff

function Instruction(x, y, state, unmovable)
{
    this.x = x;
    this.y = y;

    this.state = state;
    this.unmovable = unmovable

    this.render = function()
    {
        context.drawImage(assets[this.state], this.x, this.y, instructionSize, instructionSize);
    }

    this.click = function(x, y)
    {
        if (x > this.x && x < this.x + instructionSize && y > this.y && y < this.y + instructionSize)
        {
            if (!this.unmovable)
            {
                return this;
            }
            else
            {
                let instruction = new Instruction(this.x, this.y, this.state, false);
                currentLevel.instructions.push(instruction);

                return instruction;
            }
        }
    }
}

function clickAction()
{
    if (!selectedInstruction)
    {
        let selected = null;

        for (let i = 0; i < currentLevel.instructions.length; i++)
        {
            let currentInstruction = currentLevel.instructions[i].click(mouse.x, mouse.y);

            if (currentInstruction)
            {
                selected = currentInstruction;
                break;
            }
        }

        selectedInstruction = selected;
    }
}

function level(layout){
    this.nodeWidth = width / layout[0].length;
    this.nodeHeight = height / layout.length;

    this.grid = [];
    for (let i = 0; i < layout.length; i++)
    {
        let tt = [];
        for (let ii = 0; ii < layout[i].length; ii++)
        {
            let node = {
                x: ii * this.nodeWidth,
                y: i * this.nodeHeight,
                walkable: layout[i][ii]
            }

            tt.push(node);
        }
        this.grid.push(tt);
    }

    this.instructions = [];
    this.currentInstruction = 3;
    for (let i = 0; i < 4; i++)
    {
        this.instructions.push(new Instruction(instructionSpacing + (instructionSize + instructionSpacing) * i, height - instructionSize - instructionSpacing, i, true))
    }

    this.playerNodeX = 0;
    this.playerNodeY = 0;
    this.playerNode = this.grid[this.playerNodeX][this.playerNodeY];

    this.updatePlayerNode = function()
    {
        this.playerNode = this.grid[this.playerNodeY][this.playerNodeX];
    }

    this.move = function(direction)
    {
        try
        {
            switch (direction)
            {
                case 0:
                    if (this.grid[this.playerNodeY - 1][this.playerNodeX].walkable)
                        this.playerNodeY--;
                    break;
                case 1:
                    if (this.grid[this.playerNodeY][this.playerNodeX + 1].walkable)
                        this.playerNodeX++;
                    break;
                case 2:
                    if (this.grid[this.playerNodeY + 1][this.playerNodeX].walkable)
                        this.playerNodeY++;
                    break;
                case 3:
                    if (this.grid[this.playerNodeY][this.playerNodeX - 1].walkable)
                        this.playerNodeX--;
                    break;
            }
        } catch (e)
        {
            return;
        }

        this.updatePlayerNode();
    }
    
    this.run = function()
    {
        this.currentInstruction++;

        let instruction = this.instructions[this.currentInstruction];

        if (instruction)
            {
            if (!instruction.unmovable)
            {
                this.move(instruction.state);
            }
        }else{
            clearInterval(run);
        }
    }
};

function renderPlayer(level)
{
    let x = level.playerNode.x;
    let y = level.playerNode.y;

    context.drawImage(assets[4], x + nodeSpacing / 2, y + nodeSpacing / 2, level.nodeWidth - nodeSpacing, level.nodeHeight - nodeSpacing);
}

function renderInstructions()
{
    context.color(255, 255, 255);

    for (let i = 0; i < currentLevel.instructions.length; i++)
    {
        currentLevel.instructions[i].render();
    }
}

const levels = [];

levels.push(new level([
    [1, 1, 1, 1, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
]));

let currentLevel = levels[0];

let selectedInstruction = null;

let running = true;
let desiredFPS = 60, FPS = 1000 / 60, last = Date.now(), lag = 0;
function mainLoop()
{
    let now = Date.now();
    lag = now - last;
    last = now;

    while (lag > 0)
    {
        update();

        lag -= FPS;
    }

    render();

    if (running)
        requestAnimationFrame(mainLoop);
}

function update()
{
    try {
        selectedInstruction.x = mouse.x;
        selectedInstruction.y = mouse.y;
    } catch (error) {
        return;
    }
}

function render()
{
    context.imageSmoothingEnabled = false;

    context.background(100);

    for (let i = 0; i < currentLevel.grid.length; i++)
    {
        for (let ii = 0; ii < currentLevel.grid[i].length; ii++)
        {
            let currentNode = currentLevel.grid[i][ii];

            if (currentNode.walkable)
                context.color(110, 110, 110);
            else
                context.color(80, 80, 80);

            context.fillRect(currentNode.x + nodeSpacing / 2, currentNode.y + nodeSpacing / 2, currentLevel.nodeWidth - nodeSpacing, currentLevel.nodeHeight - nodeSpacing);
        }
    }

    renderPlayer(currentLevel);

    renderInstructions();
}

onload = loadImages(mainLoop);

addEventListener("mousemove", (e)=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
addEventListener("mousedown", clickAction);
addEventListener("mouseup", ()=>{
    selectedInstruction = null;
});
addEventListener("keyup", (e)=>{
    if (e.key == "Enter")
        window.run = setInterval(currentLevel.run.bind(currentLevel), 300);
});
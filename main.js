const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

const width = canvas.width = screen.width;
const height = canvas.height = screen.height;

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
const instructionSpacing = 8;

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
            if (this.unmovable)
            {
                return this.state + 1;
            }
            else
            {
                return this;
            }
        }
    }
}
function clickAction()
{
    for (let i = 0; i < levels[currentLevelIndex].instructions.length; i++)
    {
        let current = levels[currentLevelIndex].instructions[i];

        let instruction = current.click(mouse.x, mouse.y);

        if (typeof(instruction) == "object")
        {
            levels[currentLevelIndex].instructions.splice(levels[currentLevelIndex].instructions.indexOf(instruction),1);

            levels[currentLevelIndex].instructionX -= instructionSize + instructionSpacing;

            for (let i = 0; i < levels[currentLevelIndex].instructions.length; i++)
            {
                let current2 = levels[currentLevelIndex].instructions[i]
                if (!current2.unmovable)
                    current2.x = levels[currentLevelIndex].instructionXFinal + (instructionSize + instructionSpacing) * (i-4) + instructionSpacing;
            }

            return;
        }

        if (instruction && levels[currentLevelIndex].instructions.length - 4 < levels[currentLevelIndex].maxInstructions)
        {
            instruction--;

            levels[currentLevelIndex].instructionX += instructionSize + instructionSpacing;

            let pushInstruction = new Instruction(levels[currentLevelIndex].instructionX, levels[currentLevelIndex].instructionY, instruction, false);

            levels[currentLevelIndex].instructions.push(pushInstruction);
        }
    }
}

function level(layout, maxInstructions){
    this.nodeWidth = width / layout[0].length;
    this.nodeHeight = height / layout.length;

    this.grid = [];
    for (let i = 0; i < layout.length; i++)
    {
        let tt = [];
        for (let ii = 0; ii < layout[i].length; ii++)
        {
            if (layout[i][ii] == -1)
            {
                let node = {
                    x: ii * this.nodeWidth,
                    y: i * this.nodeHeight,
                    state: 1
                }
    
                tt.push(node);
                
                this.playerNodeX = ii;
                this.playerNodeY = i;
                this.startNode = node;

                continue;
            }

            let node = {
                x: ii * this.nodeWidth,
                y: i * this.nodeHeight,
                state: layout[i][ii]
            }

            tt.push(node);
        }
        this.grid.push(tt);
    }

    this.maxInstructions = maxInstructions;
    this.instructions = [];
    this.currentInstruction = 3;
    for (let i = 0; i < 4; i++)
    {
        this.instructions.push(new Instruction(instructionSpacing + (instructionSize + instructionSpacing) * i, height - instructionSize - instructionSpacing, i, true))
    }
    this.instructionX = instructionSpacing + (instructionSize + instructionSpacing) * 3 + instructionSpacing;
    this.instructionY = height - instructionSize - instructionSpacing;
    this.instructionXFinal = instructionSpacing + (instructionSize + instructionSpacing) * 3 + instructionSize + instructionSpacing;
    this.instructionYFinal = height - instructionSize - instructionSpacing;

    this.playerNode = this.grid[this.playerNodeX][this.playerNodeY];
    this.won = false;

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
                    if (this.grid[this.playerNodeY - 1][this.playerNodeX].state)
                        this.playerNodeY--;
                    break;
                case 1:
                    if (this.grid[this.playerNodeY][this.playerNodeX + 1].state)
                        this.playerNodeX++;
                    break;
                case 2:
                    if (this.grid[this.playerNodeY + 1][this.playerNodeX].state)
                        this.playerNodeY++;
                    break;
                case 3:
                    if (this.grid[this.playerNodeY][this.playerNodeX - 1].state)
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

function renderLevel()
{
    for (let i = 0; i < levels[currentLevelIndex].grid.length; i++)
    {
        for (let ii = 0; ii < levels[currentLevelIndex].grid[i].length; ii++)
        {
            let currentNode = levels[currentLevelIndex].grid[i][ii];

            if (currentNode.state == 2)
                context.color(0, 255, 0)
            else if (currentNode.state == 1)
                context.color(110, 110, 110);
            else if (currentNode.state == 0)
                context.color(80, 80, 80);

            context.fillRect(currentNode.x + nodeSpacing / 2, currentNode.y + nodeSpacing / 2, levels[currentLevelIndex].nodeWidth - nodeSpacing, levels[currentLevelIndex].nodeHeight - nodeSpacing);
        }
    }
}

function renderPlayer(level)
{
    let x = level.playerNode.x;
    let y = level.playerNode.y;

    let index = levels[currentLevelIndex].won ? 5 : 4;

    context.drawImage(assets[index], x + nodeSpacing / 2, y + nodeSpacing / 2, level.nodeWidth - nodeSpacing, level.nodeHeight - nodeSpacing);
}

function renderInstructions()
{
    context.color(60, 60, 60, .5);
    context.fillRect(levels[currentLevelIndex].instructionXFinal, levels[currentLevelIndex].instructionYFinal - instructionSpacing, (instructionSize + instructionSpacing) * levels[currentLevelIndex].maxInstructions + instructionSpacing, instructionSize + instructionSpacing * 2);

    for (let i = 0; i < levels[currentLevelIndex].instructions.length; i++)
    {
        levels[currentLevelIndex].instructions[i].render();
    }
}

const levels = [];

// all da levels |

levels.push(new level([
    [-1, 1, 1, 1, 0, 0, 0, 2],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
], 9));

levels.push(new level([
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, -1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
], 6));

levels.push(new level([
    [1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 0, 1],
    [1, -1, 0, 1, 0, 2, 0, 1],
    [0, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
], 14));

let currentLevelIndex = 0;

let selectedInstruction = null;

let run = null;

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
    if (levels[currentLevelIndex].playerNode.state == 2)
    {
        levels[currentLevelIndex].won = true;

        if (levels[currentLevelIndex+1])
        {
            currentLevelIndex++;
            levels[currentLevelIndex].playerNode = levels[currentLevelIndex].startNode;
        }
    }
}

function render()
{
    context.imageSmoothingEnabled = false;

    context.background(100);

    renderLevel();

    renderPlayer(levels[currentLevelIndex]);

    renderInstructions();
}

onload = loadImages(mainLoop);

addEventListener("mousemove", (e)=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
addEventListener("mouseup", clickAction);

addEventListener("keyup", (e)=>{
    if (e.key == "Enter" && !levels[currentLevelIndex].won)
    {
        levels[currentLevelIndex].playerNode = levels[currentLevelIndex].startNode;
        run = setInterval(levels[currentLevelIndex].run.bind(levels[currentLevelIndex]), 200);
    }
});
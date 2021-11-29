// This project doesn't have a main loop, but instead renders based on events, pretty neat right?

const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

const width = canvas.width = screen.width;
const height = canvas.height = screen.height;

context.color = function(r, g, b, a = 1)
{
    // if the input is rgba handle it accordingly
    if (g != undefined)
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    // and if it aint, assume it's a string color input like "blue"
    else
        context.fillStyle = r;
}

context.background = function(r, g = r, b = r, a = 1)
{
    context.color(r, g, b, a);
    context.fillRect(0, 0, width, height);
}

context.clear = function()
{
    context.clearRect(0, 0, width, height);
}

// image loading function I got from stackoverflow lol, preeeetty smart stuff

const imagePaths = [
    "assets/ui/up.png","assets/ui/right.png","assets/ui/down.png","assets/ui/left.png",
    "assets/character/player_neutral.png","assets/character/player_happy.png", 
    "assets/tiles/start.png", "assets/tiles/non_walkable_tile.png", "assets/tiles/walkable_tile1.png", "assets/tiles/walkable_tile2.png", "assets/tiles/walkable_tile3.png", "assets/tiles/end.png", "assets/tiles/death.png"
];
const assets = [];

function loadImages(callback)
{
    let imagesLoading = imagePaths.length;

    function onImageLoad()
    {
        imagesLoading--;

        if (!imagesLoading)
        {
            try{
                callback();
            }catch(e){return}
        }
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

// initial variables

const mouse = {x: 0, y: 0}

const instructionSize = 60;
const instructionSpacing = 8;

const levels = [];

let currentLevelIndex = 0;

let run = null;

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
                // I do this because if I don't, it'll not see it, as if(1) gives true, but if(0) doesn't, I retrieve the original value somewhere doen there
                return this.state + 1;
            }
            else
            {
                return this;
            }
        }
    }
}

function Tile(x, y, state)
{
    this.x = x;
    this.y = y;
    this.state = state;
    this.available = this.state == 1 ? false : true
    this.asset = function()
    {
        switch (state)
        {
            case 0:
                return assets[6];

            case 1:
                return assets[7];

            case 2:
                return assets[8 + Math.floor(Math.random() * 2)];

            case 3:
                return assets[11];

            case 4:
                return assets[12];

        }
    }();
    this.action = function(instruction)
    {
        try
        {
            switch (this.state)
            {
                case 3: 
                    levels[currentLevelIndex].won = true;

                    if (levels[currentLevelIndex+1])
                    {
                        currentLevelIndex++;
                    }

                    resetLevel();

                    break;
                case 4:
                    resetLevel();
                    resetPlayer();
                    return;
            }
        }catch(e){}
    }
}

function Level(layout, maxInstructions){
    this.TileWidth = width / layout[0].length;
    this.TileHeight = height / layout.length;

    this.grid = [];
    for (let i = 0; i < layout.length; i++)
    {
        let tt = [];
        for (let ii = 0; ii < layout[i].length; ii++)
        {
            let x = ii * this.TileWidth, y = i * this.TileHeight, state;

            // if the current tile is the start tile, do some funky stuff. Also, every level expects a start Tile, otherwise things break...
            if (!layout[i][ii])
            {
                state = layout[i][ii];
                
                this.startTileX = ii;
                this.startTileY = i;
                this.playerTileX = this.startTileX;
                this.playerTileY = this.startTileY;
            }
            else
            {
                state = layout[i][ii];
            }

            let tile = new Tile(x, y, state);

            tt.push(tile);
        }

        this.grid.push(tt);
    }

    if (this.startTileX == undefined)
        throw new Error(`Error loading level, no start node defined`);

    this.maxInstructions = maxInstructions;
    this.instructions = [];
    this.currentInstruction = 3;

    // initial instructions
    for (let i = 0; i < 4; i++)
    {
        this.instructions.push(new Instruction(instructionSpacing + (instructionSize + instructionSpacing) * i, height - instructionSize - instructionSpacing, i, true))
    }

    // this is probably waaaaay to long, but if it aint broke, don't fix it (but you should tho)
    this.instructionX = instructionSpacing + (instructionSize + instructionSpacing) * 3 + instructionSpacing;
    this.instructionY = height - instructionSize - instructionSpacing;
    this.instructionXFinal = instructionSpacing + (instructionSize + instructionSpacing) * 3 + instructionSize + instructionSpacing;
    this.instructionYFinal = height - instructionSize - instructionSpacing;

    this.won = false;

    // wow look, hardcoded values, I hate myself
    this.move = function(direction)
    {
        try
        {
            switch (direction)
            {
                case 0:
                    if (this.grid[this.playerTileY - 1][this.playerTileX].available)
                        this.playerTileY--;
                    break;
                case 1:
                    if (this.grid[this.playerTileY][this.playerTileX + 1].available)
                        this.playerTileX++;
                    break;
                case 2:
                    if (this.grid[this.playerTileY + 1][this.playerTileX].available)
                        this.playerTileY++;
                    break;
                case 3:
                    if (this.grid[this.playerTileY][this.playerTileX - 1].available)
                        this.playerTileX--;
                    break;
            }
        // I have like three try-catch statements with different styles of programming, consistency!
        }catch(e){}
    }
}

function randomMaze(w, h)
{
    let maze = [];
    let level, hasStart = false;
    for (let i = 0; i < h+1; i++)
    {
        let t = [];
        for (let ii = 0; ii < w+1; ii++)
        {
            t.push({x: ii, y: i, state: 1, parent: null});
        }
        maze.push(t);
    }

    function hasNeighbours(tile)    
    {
        let neighbours = [];

        let x = tile.x;
        let y = tile.y;

        let t1 = (maze[y+2]||[])[x] != undefined ? (maze[y+2]||[])[x] : {state:0};
        let t2 = (maze[y-2]||[])[x] != undefined ? (maze[y-2]||[])[x] : {state:0};
        let t3 = maze[y][x+2] != undefined ? (maze[y]||[])[x+2] : {state:0};;
        let t4 = maze[y][x-2] != undefined ? (maze[y]||[])[x-2] : {state:0};;

        if (t1.state)
            neighbours.push(t1);
        if (t2.state)
            neighbours.push(t2);
        if (t3.state)
            neighbours.push(t3);
        if (t4.state)
            neighbours.push(t4);

        if (neighbours.length)
            return neighbours;
    }

    function generate(tile)
    {
        tile.state = 0;

        let neighbours = hasNeighbours(tile);

        if (neighbours)
        {
            let next = neighbours[Math.floor(Math.random() * neighbours.length)];

            next.parent = tile;

            let betweenX = (tile.x + next.x) / 2;
            let betweenY = (tile.y + next.y) / 2;
            maze[betweenY][betweenX].state = 0;

            generate(next);
        }
        else if (tile.parent)
        {
            generate(tile.parent);
        }
        else
        {
            mazeToLevel();
        }
    }

    function mazeToLevel()
    {
        level = [];
        for (let i = 0; i < maze.length; i++)
        {
            let level_temp = [];
            for (let ii = 0; ii < maze[i].length; ii++)
            {
                let t = maze[i][ii].state == 1 ? 1 : 2;

                if (!hasStart && Math.random() > .9 && t == 2)
                {
                    t = 3;
                    hasStart = true;
                }

                level_temp.push(t);
            }
            level.push(level_temp);
        }
        level[1][1] = 0;
    }

    generate(maze[1][1]);

    return level;
}

function runLevel()
{
    resetLevel();
    resetPlayer();

    let level = levels[currentLevelIndex];

    run = setInterval(main, 200);

    function main()
    {
        let instruction = level.instructions[level.currentInstruction];

        if (!instruction && !levels[currentLevelIndex].won)
        {
            resetLevel();
            resetPlayer();

            return;
        }

        level.move(instruction.state);

        level.grid[level.playerTileY][level.playerTileX].action(instruction);

        render();

        level.currentInstruction++;
    }
}

function resetLevel()
{
    clearInterval(run);
    run = null;
    levels[currentLevelIndex].currentInstruction = 4;
}

function clickAction()
{
    if (!run)
    {
        // loop through instructions
        for (let i = 0; i < levels[currentLevelIndex].instructions.length; i++)
        {
            let current = levels[currentLevelIndex].instructions[i];

            // does the instruction exist and is it clicked?
            let instruction = current.click(mouse.x, mouse.y);

            if (typeof(instruction) == "object")
            {
                // if the instruction is an object, it's not unmovable and should be removed
                levels[currentLevelIndex].instructions.splice(levels[currentLevelIndex].instructions.indexOf(instruction),1);

                // update positions
                levels[currentLevelIndex].instructionX -= instructionSize + instructionSpacing;

                for (let i = 4; i < levels[currentLevelIndex].instructions.length; i++)
                {
                    let current2 = levels[currentLevelIndex].instructions[i];
                    current2.x = levels[currentLevelIndex].instructionXFinal + (instructionSize + instructionSpacing) * (i-4) + instructionSpacing;
                }

                resetLevel();
                resetPlayer();

                return;
            }

            // Only add the instruction if there's slots available
            if (instruction && levels[currentLevelIndex].instructions.length - 4 < levels[currentLevelIndex].maxInstructions)
            {
                // retrieve original state
                instruction--;

                levels[currentLevelIndex].instructionX += instructionSize + instructionSpacing;

                let pushInstruction = new Instruction(levels[currentLevelIndex].instructionX, levels[currentLevelIndex].instructionY, instruction, false);

                levels[currentLevelIndex].instructions.push(pushInstruction);
            }
        }
    }
}

function resetPlayer()
{
    levels[currentLevelIndex].playerTileX = levels[currentLevelIndex].startTileX;
    levels[currentLevelIndex].playerTileY = levels[currentLevelIndex].startTileY;   
}

// level is rerendered whenever render() is called, you could cache it and just draw it once, but here it doesn't really matter unless your
// level is really big
function renderLevel()
{
    for (let i = 0; i < levels[currentLevelIndex].grid.length; i++)
    {
        for (let ii = 0; ii < levels[currentLevelIndex].grid[i].length; ii++)
        {
            let currentTile = levels[currentLevelIndex].grid[i][ii];

            context.drawImage(currentTile.asset, currentTile.x, currentTile.y, levels[currentLevelIndex].TileWidth, levels[currentLevelIndex].TileHeight);
        }
    }
}

function renderPlayer(level)
{
    let x = level.playerTileX * level.TileWidth;
    let y = level.playerTileY * level.TileHeight;

    let index = levels[currentLevelIndex].won ? 5 : 4;

    context.drawImage(assets[index], x, y, level.TileWidth, level.TileHeight);
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

// all da levels
// declare a level as shown below, 0 being start, 1 being non-walkable, 2 being walkable, 3 being end and 4 being a death tile


function render()
{
    context.imageSmoothingEnabled = false;

    renderLevel();

    renderPlayer(levels[currentLevelIndex]);

    renderInstructions();
}

function load()
{
    context.background(50);

    context.color(120, 120, 120);
    context.font = "48px Tahoma";
    context.fillText("Best experienced in fullscreen", width/2-300, height/2, 600);
    context.fillText("Click to begin", width/2-200, height/2 + 100, 400);

    //     levels.push(new Level([
    //     [0, 2, 2, 2, 1, 1, 1, 3],
    //     [1, 1, 2, 2, 2, 2, 2, 2],
    //     [1, 1, 2, 2, 1, 2, 1, 1],
    //     [1, 1, 2, 2, 1, 2, 2, 2],
    //     [1, 1, 1, 1, 1, 2, 2, 2],
    // ], 9));

    // levels.push(new Level([
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //     [1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    //     [1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    //     [1, 1, 1, 2, 2, 2, 0, 1, 1, 1, 1, 1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // ], 6));

    // levels.push(new Level([
    //     [2, 2, 2, 1, 2, 2, 2, 1],
    //     [2, 1, 2, 2, 2, 1, 2, 1],
    //     [2, 0, 1, 2, 1, 3, 2, 1],
    //     [1, 1, 1, 2, 4, 2, 2, 2],
    //     [1, 1, 1, 1, 1, 1, 2, 2],
    // ], 14));

    levels.push(new Level(randomMaze(10, 6), 20));
    levels.push(new Level(randomMaze(10, 6), 20));
    levels.push(new Level(randomMaze(10, 6), 20));
    levels.push(new Level(randomMaze(10, 6), 20));
    levels.push(new Level(randomMaze(10, 6), 10));
}

function onEvent(event)
{
    try{
        let type = event.type;
        switch (type)
        {
            case "mouseup":
                clickAction(mouse.x, mouse.y);
                break;
            case "keyup":
                if (event.key == "Enter" && !levels[currentLevelIndex].won)
                    runLevel(levels[currentLevelIndex]);
        }
    }catch(e){}

    try {
        render();
    }catch(e){}
}   

addEventListener("mousemove", (e)=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
addEventListener("mouseup", onEvent);

addEventListener("keyup", onEvent);

onload = loadImages(load);
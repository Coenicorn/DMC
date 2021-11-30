// This project doesn't have a main loop, but instead renders based on events, pretty neat right?

const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

const width = canvas.width = screen.width;
const height = canvas.height = screen.height;

const levelCache = new OffscreenCanvas(width, height);
const levelContext = levelCache.getContext("2d");

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
    "assets/character/player_neutral.png","assets/character/player_water.png", 
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

const levels = [];

let currentLevelIndex = 0;

let run = null;

// level stuff

function addInstruction(dir)
{
    if (run === null)
    {
        let t = document.createElement("img");
        t.src = "assets/ui/"+dir+".png";

        t.id = "input";

        levels[currentLevelIndex].instructions.push({dir: dir, element: t});

        t.onclick = function(){
            document.getElementById("gui").removeChild(t);

            let level = levels[currentLevelIndex];

            level.instructions.splice(level.instructions.indexOf({dir: dir, element: t}));
        }

        document.getElementById("gui").appendChild(t);
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
                return assets[2];

            case 1:
                return assets[3];

            case 2:
                return assets[4 + Math.floor(Math.random() * 2)];

            case 3:
                return assets[7];

            case 4:
                return assets[8];

        }
    }();
    this.action = function()
    {
        try
        {
            switch (this.state)
            {
                case 1:
                    setTimeout(()=>{
                        resetLevel();
                        resetPlayer();
                    }, 20);

                case 3: 
                    levels[currentLevelIndex].won = true;

                    for (let i in levels[currentLevelIndex].instructions)
                    {
                        document.getElementById("gui").removeChild(levels[currentLevelIndex].instructions[i].element);
                    }

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
    this.currentInstruction = 0;

    this.won = false;

    this.move = function(direction)
    {
        try
        {
            switch (direction)
            {
                case 0:
                    this.playerTileY++;
                    break;
                case 1:
                    this.playerTileX++;
                    break;
                case 2:
                    this.playerTileY--;
                    break;
                case 3:
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
    let level, hasEnd = false;
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

                if (!hasEnd && Math.random() > .9 && t == 2)
                {
                    t = 3;
                    hasEnd = true;
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

    run = setInterval(main, 300);

    function main()
    {
        let instruction = level.instructions[level.currentInstruction];

        if (!instruction && !levels[currentLevelIndex].won)
        {
            resetLevel();
            resetPlayer();

            return;
        }

        level.move(instruction.dir);

        level.grid[level.playerTileY][level.playerTileX].action(instruction);

        render();

        level.currentInstruction++;
    }
}

function resetLevel()
{
    clearInterval(run);
    run = null;
    levels[currentLevelIndex].currentInstruction = 0;
}

function resetPlayer()
{
    levels[currentLevelIndex].playerTileX = levels[currentLevelIndex].startTileX;
    levels[currentLevelIndex].playerTileY = levels[currentLevelIndex].startTileY;   
}

// level is rerendered whenever render() is called, you could cache it and just draw it once, but here it doesn't really matter unless your
// level is really big
function renderLevel(level)
{
    for (let i = 0; i < level.grid.length; i++)
    {
        for (let ii = 0; ii < level.grid[i].length; ii++)
        {
            let currentTile = level.grid[i][ii];

            context.drawImage(currentTile.asset, currentTile.x, currentTile.y, level.TileWidth, level.TileHeight);
        }
    }
}

function renderPlayer(level)
{
    let x = level.playerTileX * level.TileWidth;
    let y = level.playerTileY * level.TileHeight - 20;

    let index = level.won ? 1 : 0;

    context.drawImage(assets[index], x, y, level.TileWidth, level.TileHeight);
}


function render()
{
    context.imageSmoothingEnabled = false;

    let level = levels[currentLevelIndex];

    renderLevel(level);

    renderPlayer(level);
}

function load()
{
    // all da levels
    // declare a level as shown below, 0 being start, 1 being non-walkable, 2 being walkable, 3 being end and 4 being a death tile

    levels.push(new Level([
        [0, 2, 2, 2, 1, 1, 1, 3],
        [1, 1, 2, 2, 2, 2, 2, 2],
        [1, 1, 2, 2, 1, 2, 1, 1],
        [1, 1, 2, 2, 1, 2, 2, 2],
        [1, 1, 1, 1, 1, 2, 2, 2],
    ], 9));

    levels.push(new Level([
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 2, 2, 2, 0, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ], 6));

    levels.push(new Level([
        [2, 2, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 2, 2, 1, 2, 1],
        [2, 0, 1, 2, 1, 3, 2, 1],
        [1, 1, 1, 2, 4, 2, 2, 2],
        [1, 1, 1, 1, 1, 1, 2, 2],
    ], 14));

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
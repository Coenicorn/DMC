// This project doesn't have a main loop, but instead renders based on events, pretty neat right?

// ------------------------------------------------------------------------------
// VARIABLE DECLERATIONS
// ------------------------------------------------------------------------------

const camera = {
    x: 0,
    y: 0
}

const mouse = {x: 0, y: 0}
const levels = [];

let currentLevelIndex = 0;

const updateInterval = 200;

let running = false;

// ------------------------------------------------------------------------------
// RENDERING AND IMAGE LOADING
// ------------------------------------------------------------------------------

const canvas = document.getElementById("GameScreen");
const context = canvas.getContext("2d");

const levelCache = document.getElementById("LevelCanvas");
const levelContext = levelCache.getContext("2d");

const width = canvas.width = levelCache.width = screen.width;
const height = canvas.height = levelCache.height = screen.height;


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
    "assets/tiles/start.png", "assets/tiles/non_walkable_tile.png", "assets/tiles/walkable_tile1.png", "assets/tiles/walkable_tile2.png", "assets/tiles/walkable_tile3.png", "assets/tiles/end.png", "assets/tiles/spikes_retracted.png", "assets/tiles/spikes_extended.png"
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

// level is rerendered whenever render() is called, you could cache it and just draw it once, but here it doesn't really matter unless your
// level is really big
function renderLevel(level)
{
    levelContext.imageSmoothingEnabled = false;
    
    for (let i = 0; i < level.grid.length; i++)
    {
        for (let ii = 0; ii < level.grid[i].length; ii++)
        {
            let currentTile = level.grid[i][ii];

            levelContext.drawImage(currentTile.asset, currentTile.x * level.TileSize, currentTile.y * level.TileSize, level.TileSize, level.TileSize);
        }
    }
}

function renderPlayer(level)
{
    let x = level.playerX * level.TileSize;
    let y = level.playerY * level.TileSize - 20;

    context.drawImage(assets[level.playerAssetIndex], x, y, level.TileSize, level.TileSize);
}


function render()
{
    context.imageSmoothingEnabled = false;

    let level = levels[currentLevelIndex];

    context.drawImage(levelCache, 0, 0);

    renderPlayer(level);
}

// ------------------------------------------------------------------------------
// CLASSES AND OBJECTS BOIIIIIIIIIIIIII
// ------------------------------------------------------------------------------

function addInstruction(dir)
{
    if (!running)
    {
        let t = document.createElement("img");
        t.src = "assets/ui/"+dir+".png";

        t.id = "input";

        levels[currentLevelIndex].instructions.push({dir: dir, element: t});

        document.getElementById("gui").appendChild(t);

        t.onclick = function(){
            document.getElementById("gui").removeChild(t);

            let level = levels[currentLevelIndex];

            level.instructions.splice(level.instructions.indexOf({dir: dir, element: t}));
        }
    }
}

function Tile(x, y, state)
{
    this.x = x;
    this.y = y;
    this.state = state;
    this.available = this.state == 1 ? false : true;
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
                case 0:
                    break;

                case 1:
                    running = false;

                    levels[currentLevelIndex].playerAssetIndex = 1;
                    render();

                    setTimeout(resetPlayer, updateInterval);

                    break;

                case 3: 

                    running = false;

                    setTimeout(nextLevel, updateInterval);

                    break;
                case 4:
                    running = false;
                    setTimeout(resetPlayer, updateInterval);

                    break;
            }
        }catch(e){}
    }
}

function Level(layout){
    this.TileSize = height / layout.length;
    this.renderFrom = width / 2 - (layout[0].length / 2 * this.TileSize);

    this.grid = [];
    for (let i = 0; i < layout.length; i++)
    {
        let tt = [];
        for (let ii = 0; ii < layout[i].length; ii++)
        {
            let x = ii, y = i;
            let state;

            // if the current tile is the start tile, do some funky stuff. Also, every level expects a start Tile, otherwise things break...
            if (!layout[i][ii])
            {
                state = layout[i][ii];
                
                this.startTileX = ii;
                this.startTileY = i;
                this.playerTileX = this.startTileX;
                this.playerTileY = this.startTileY;
                this.playerX = this.playerTileX;
                this.playerY = this.playerTileY;
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

    this.instructions = [];
    this.currentInstruction = 0;

    this.won = false;
    this.playerAssetIndex = 0;

    this.move = function(direction, callback)
    {
        // fps-estimation, fpstimation, haha puns
        let fpstimation = 20, displacement = 1 / fpstimation, i = 0, self = this, xFinal, yFinal;

        function moveAnimation(x, y)
        {
            if (x != undefined && y != undefined)
            {
                xFinal = x;
                yFinal = y;
            }

            self.playerY += yFinal * displacement;
            self.playerX += xFinal * displacement;

            i++;
            if (i <= fpstimation)
                requestAnimationFrame(moveAnimation);
            else
            {
                self.playerX = self.playerTileX;
                self.playerY = self.playerTileY;

                callback();
            }

            render();
        }

        try
        {
            switch (direction)
            {
                case 0:
                    if (this.grid[this.playerTileY+1][this.playerTileX])
                        this.playerTileY++;
                        moveAnimation(0, 1);
                    break;
                case 1:
                    if (this.grid[this.playerTileY][this.playerTileX+1])
                        this.playerTileX++;
                        moveAnimation(1, 0);
                    break;
                case 2:
                    if (this.grid[this.playerTileY-1][this.playerTileX])
                        this.playerTileY--;
                        moveAnimation(0, -1);
                    break;
                case 3:
                    if (this.grid[this.playerTileY][this.playerTileX-1])
                        this.playerTileX--;
                        moveAnimation(-1, 0);
                    break;
            }
        // I have like three try-catch statements with different styles of programming, consistency!
        }catch(e){}
    }
}

// random level generation, quite proud of that one

function randomMaze(w, h)
{
    let maze = [], level, hasEnd = false;
    let startX = Math.floor(Math.random() * (w / 2)) + 1, startY = Math.floor(Math.random() * (h / 2)) + 1;
    
    for (let i = 0; i < h+1; i++)
    {
        let t = [];
        for (let ii = 0; ii < w+1; ii++)
        {
            t.push({x: ii, y: i, state: 1, parent: null, loopedOver: false});
        }
        maze.push(t);
    }

    function hasNeighbours(tile)    
    {
        let neighbours = [];

        let x = tile.x;
        let y = tile.y;

        let t1 = (maze[y+2]||[])[x] != undefined ? (maze[y+2]||[])[x] : {state:2};
        let t2 = (maze[y-2]||[])[x] != undefined ? (maze[y-2]||[])[x] : {state:2};
        let t3 = maze[y][x+2] != undefined ? (maze[y]||[])[x+2] : {state:2};
        let t4 = maze[y][x-2] != undefined ? (maze[y]||[])[x-2] : {state:2};

        if (t1.state == 1)
            neighbours.push(t1);
        if (t2.state == 1)
            neighbours.push(t2);
        if (t3.state == 1)
            neighbours.push(t3);
        if (t4.state == 1)
            neighbours.push(t4);

        return neighbours;
    }

    function generate(tile)
    {
        if (tile.state != 3)
            tile.state = 2;

        let neighbours = hasNeighbours(tile);

        if (neighbours.length)

        {
            let next = neighbours[Math.floor(Math.random() * neighbours.length)];

            next.parent = tile;

            let betweenX = (tile.x + next.x) / 2;
            let betweenY = (tile.y + next.y) / 2;
            maze[betweenY][betweenX].state = 2;

            generate(next);
        }
        else if (tile.parent)
        {
            if (!hasEnd)
                tile.state = 3;
                hasEnd = true;

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
                let t = maze[i][ii].state;

                level_temp.push(t);
            }
            level.push(level_temp);
        }
        level[startX][startY] = 0;
    }

    generate(maze[startX][startY]);

    return level;
}

// ------------------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------------------

function runLevel()
{
    resetLevel();
    resetPlayer();

    running = true;

    let level = levels[currentLevelIndex];
    let instruction;

    function main()
    {
        if (running)
        {
            instruction = level.instructions[level.currentInstruction];

            if (!instruction && !levels[currentLevelIndex].won)
            {
                running = false;
                resetPlayer();

                return;
            }

            level.currentInstruction++;

            level.move(instruction.dir, runMain);
        }
    }

    function runMain()
    {
        level.grid[level.playerTileY][level.playerTileX].action(instruction);

        render();

        main();
    }

    main();
}

// ------------------------------------------------------------------------------
// RESET FUNCTIONS
// ------------------------------------------------------------------------------

function nextLevel()
{
    for (let i in levels[currentLevelIndex].instructions)
    {
        document.getElementById("gui").removeChild(levels[currentLevelIndex].instructions[i].element)
    }

    if (!levels[currentLevelIndex+1])
        levels.push(new Level(randomMaze(16, 10), 10));
    
    currentLevelIndex++;

    renderLevel(levels[currentLevelIndex]);
    render();
}

function resetLevel()
{
    levels[currentLevelIndex].currentInstruction = 0;
}

function resetPlayer()
{
    running = false;
    let level = levels[currentLevelIndex];

    level.playerTileX = level.startTileX;
    level.playerTileY = level.startTileY; 
    level.playerX = level.startTileX;
    level.playerY = level.startTileY; 
    
    level.playerAssetIndex = 0;
}

function load()
{
    // all da levels
    // declare a level as shown below, 0 being start, 1 being non-walkable, 2 being walkable, 3 being end and 4 being a death tile

    // levels.push(new Level([
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //     [1, 0, 2, 2, 2, 1, 1, 1, 3, 1],
    //     [1, 1, 1, 2, 2, 4, 2, 2, 2, 1],
    //     [1, 1, 1, 2, 2, 2, 2, 1, 1, 1],
    //     [1, 1, 1, 2, 2, 1, 2, 2, 2, 1],
    //     [1, 1, 1, 1, 1, 1, 2, 2, 2, 1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    // ], 9));

    levels.push(new Level(randomMaze(11, 6), 10));
    levels.push(new Level(randomMaze(12, 6), 10));
    levels.push(new Level(randomMaze(12, 6), 10));
    levels.push(new Level(randomMaze(12, 6), 10));
    levels.push(new Level(randomMaze(12, 8), 10));
    levels.push(new Level(randomMaze(13, 8), 10));
    levels.push(new Level(randomMaze(13, 8), 10));
    levels.push(new Level(randomMaze(13, 8), 10));
    levels.push(new Level(randomMaze(14, 8), 10));
    levels.push(new Level(randomMaze(14, 8), 10));
    levels.push(new Level(randomMaze(14, 8), 10));

    renderLevel(levels[currentLevelIndex]);

}

function onEvent(event)
{
    try{
        let type = event.type;
        switch (type)
        {
            case "keyup":
                
                switch (event.key)
                {
                    case "Enter":
                        if (!levels[currentLevelIndex].won)
                            runLevel(levels[currentLevelIndex]);
                        break;
                    case "ArrowRight":
                        addInstruction(1);
                        break;
                    case "ArrowLeft":
                        addInstruction(3);
                        break;
                    case "ArrowUp":
                        addInstruction(2);
                        break;
                    case "ArrowDown":
                        addInstruction(0);
                        break;
                }
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
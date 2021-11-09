let seaLevel = HEIGHT/2;
let seaHeightMultiplier = 15;

let fishSpawnRate = 1;
let fishSpawnChance = .7;

let GRAVITY = new Vector2(0, .5);

const entities = [];

function load()
{
    boat.init();

    loop();
    setInterval(tick, 1000);
}

function tick()
{
    summonFish();
}

function summonFish()
{
    for (let i = 0; i < fishSpawnRate; i++)
    {
        let x = Math.random() > .5 ? WIDTH : 0;
        let y = HEIGHT/2 + (Math.random() * (HEIGHT / 2 - 200) + 100);

        if (Math.random() > fishSpawnChance)
            entities.push(new Fish(x, y));
    }
}

let running = true;
let TIMER = 0;

function loop()
{
    TIMER++;

    update();
    render();

    if (running) requestAnimationFrame(loop);
}

function sea()
{
    let offset = Math.sin(TIMER / 15) * seaHeightMultiplier;
    seaLevel = HEIGHT/2 - offset;

    screen.color(seaBlue);

    screen.rect(0, seaLevel, WIDTH, HEIGHT);
}

function render()
{
    screen.imageSmoothingEnabled = false;
    screen.clear();

    screen.drawImage(assets[1], 0, 0, WIDTH, HEIGHT);

    boat.render();

    for (let entity in entities)
    {
        entities[entity].render();
    }

    sea();
}

function update()
{
    boat.update();

    for (let entity in entities)
    {
        entities[entity].update();
    }

    return;
}

addEventListener("load", loadImages(load));
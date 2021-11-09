const boat = {
    rod: null,

    init: function()
    {
        boat.sprite = assets[0];
        boat.player.sprite = assets[4];

        boat.width = 400;
        boat.height = 400;

        boat.pos = new Vector2(WIDTH/2, HEIGHT/2);
    },
    update: function()
    {
        let offset = Math.sin((TIMER - 5) / 15) * seaHeightMultiplier;

        boat.pos.y = HEIGHT/2 - offset;

        boat.player.update();
    },
    render: function()
    {
        screen.drawImage(boat.sprite, boat.pos.x - boat.width/2, boat.pos.y - boat.height + 50, boat.width, boat.height);
        boat.player.render();
    },
}

boat.player = {
    pos: new Vector2(0, 0),
    facing: 0,
    rod: null,
    fish: 0,
    sprite: null,
    cast: function(e)
    {
        if (boat.player.rod)
        {
            boat.player.rod.retract();
            return;
        }

        let dir = new Vector2(e.clientX, e.clientY);

        let center = new Vector2(boat.player.pos.x, boat.player.pos.y);
        dir.sub(center);
        
        dir.div(50);

        if (dir.x > 0)
        {
            boat.player.facing = 1;
        }else{
            boat.player.facing = 0;
        }

        boat.player.rod = new Rod(dir);
    },
    update: function()
    {
        boat.player.pos = boat.pos.copy();
        boat.player.pos.x -= 30;
        boat.player.pos.y -= 137;

        if (boat.player.rod)
        {
            boat.player.rod.update();
        }
    },
    render: function()
    {
        if (boat.player.rod)
        {
            let offset = boat.player.facing * 64 + 64;

            screen.drawImage(boat.player.sprite, offset, 0, 64, 64, boat.player.pos.x - 64, boat.player.pos.y - 64, 128, 128);

            boat.player.rod.render();

            return;
        }

        screen.drawImage(boat.player.sprite, 0, 0, 64, 64, boat.player.pos.x - 64, boat.player.pos.y - 64, 128, 128);
    }
}

addEventListener("mouseup", boat.player.cast);

class Rod
{
    active;

    anchor;
    hook;
    vel;

    rodSprite;
    bobberSprite;

    caught;

    constructor(dir)
    {
        this.active = true;

        this.anchor = boat.player.pos.copy();
        this.hook = this.anchor.copy();
        this.vel = dir.copy();

        this.rodSprite = assets[2];
        this.bobberSprite = assets[3];
    }

    update()
    {
        this.anchor = boat.player.pos.copy();

        if (this.active)
        {
            this.hook.add(this.vel);

            if (this.hook.y > seaLevel)
            {
                this.vel.mult(0.9);

                this.vel.add(new Vector2(0, -.5));
            }else
            {
                this.vel.mult(0.99);

                this.vel.add(GRAVITY);
            }

            return;
        }

        this.vel.mult(0.9);

        let toBoat;

        toBoat = boat.player.pos.copy();
        toBoat.sub(this.hook);

        if (this.caught)
        {
            this.caught.pos = this.hook.copy();
        }

        if (toBoat.mag() < 10) 
        {
            boat.player.rod = null;

            if (this.caught)
            {
                entities.splice(entities.indexOf(this.caught), 1);

                boat.player.fish += 1;

                fishDisplay.innerHTML = "Fish caught: " + boat.player.fish;
            }
        }

        toBoat.setMag(1);
        this.vel.add(toBoat);

        this.hook.add(this.vel);
    }

    retract()
    {
        if (this.active)
        {
            this.active = false;
        }
    }

    render()
    {
        if (boat.player.facing)
        {
            screen.drawImage(this.rodSprite, boat.player.facing * 32, 0, 32, 32, this.anchor.x - 24, this.anchor.y - 28, 64, 64);

            screen.line(this.anchor.x + 35, this.anchor.y - 18, this.hook.x, this.hook.y);
        }else{
            screen.drawImage(this.rodSprite, 0, 0, 32, 32, this.anchor.x - 40, this.anchor.y - 28, 64, 64);

            screen.line(this.anchor.x - 36, this.anchor.y - 18, this.hook.x, this.hook.y);
        }
    
        screen.drawImage(this.bobberSprite, this.hook.x - 16, this.hook.y - 16);
    }
}


class Fish
{
    pos;

    vel;
    initialVel;

    speed;

    #sprite;

    constructor(x, y)
    {
        this.speed = 2;

        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.vel.x = this.pos.x == 0 ? this.speed : -this.speed;
        this.initialVel = this.vel.copy();

        this.#sprite = assets[5];
    }

    update()
    {
        this.followBobber();

        this.pos.add(this.vel);

        if (this.pos.x < 0 || this.pos.x > WIDTH) entities.splice(entities.indexOf(this), 1);

        if (this.pos.y < seaLevel) this.pos.y += this.speed;

        try
        {
            if (Vector2.sub(boat.player.rod.hook, this.pos).mag() < 10)
            {
                boat.player.rod.caught = this;
            }
        }catch(e){return};
    }

    render()
    {
        let offset = this.vel.x > 0 ? 0 : 16;

        screen.drawImage(this.#sprite, 0, offset, 32, 16, this.pos.x, this.pos.y, 32, 16);
    }

    followBobber()
    {
        try
        {
            if (boat.player.rod)
            {
                let bobber = boat.player.rod.hook.copy();

                bobber.sub(this.pos);
                bobber.setMag(this.speed);

                this.vel = bobber;
            }else{
                this.vel = this.initialVel;
            }
        }catch(e){return;}
    }
}
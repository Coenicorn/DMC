class Rod 
{
    anchor;
    hook;

    vel;
    aboveSea;

    sprite;

    constructor(x, y, dir)
    {
        this.anchor = new Vector2(x, y);
        this.hook = new Vector2(x, y);

        this.vel = dir;

        this.aboveSea = false;

        this.sprite = assets[3];
    }

    update()
    {
        this.hook.add(this.vel);

        if (this.hook.y > seaLevel)
        {
            this.vel.mult(0.9);

            this.vel.add(new Vector2(0, -1));
        }else
        {
            this.vel.mult(0.99);

            this.vel.add(GRAVITY);
        }
    }

    render()
    {
        screen.color("black");

        screen.line(this.anchor.x, this.anchor.y, this.hook.x, this.hook.y, 2);

        screen.drawImage(this.sprite, this.hook.x - 16, this.hook.y - 16);
    }
}
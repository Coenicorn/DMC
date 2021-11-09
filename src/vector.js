class Vector2{
    x;
    y;
    m;
    #l;

    constructor(x, y){
        this.x = x;
        this.y = y;
        this.m = this.mag();
    }

    add(arg){
        try{
            if(typeof(arg) == "object"){
                this.x += arg.x;
                this.y += arg.y;
            }else{
                this.x += arg;
                this.y += arg;
            }
        }
        catch(e){
            throw new Error(`Can't add up values of a vector and ${typeof(arg)}`);
        }

        if(this.l && this.mag() > this.l){
            this.setMag(this.l);
        }

        this.mag();
    }

    sub(arg){
        try{
            if(typeof(arg) == "object"){
                this.x -= arg.x;
                this.y -= arg.y;
            }else{
                this.x -= arg;
                this.y -= arg;
            }
        }
        catch(e){
            throw new Error(`Can't subtract values of a vector and ${typeof(arg)}`);
        }

        if(this.l && this.mag() > this.l){
            this.setMag(this.l);
        }

        this.mag();
    }
    
    div(arg){
        try{
            if(typeof(arg) == "object"){
                this.x /= arg.x;
                this.y /= arg.y;
            }else{
                this.x /= arg;
                this.y /= arg;
            }
        }
        catch(e){
            throw new Error(`Can't subtract values of a vector and ${typeof(arg)}`);
        }

        if(this.l && this.mag() > this.l){
            this.setMag(this.l);
        }

        this.mag();
    }

    mult(arg){
        try{
            if(typeof(arg) == "object"){
                this.x *= arg.x;
                this.y *= arg.y;
            }else{
                this.x *= arg;
                this.y *= arg;
            }
        }
        catch(e){
            throw new Error(`Can't multiply values of a vector and ${typeof(arg)}`);
        }

        if(this.l && this.mag() > this.l){
            this.setMag(this.l);
        }

        this.mag();
    }

    setMag(m){
        this.mag();
        this.x = this.x / this.m * m;
        this.y = this.y / this.m * m;
        this.m = m;

        if(this.l && this.mag() > this.l){
            this.setMag(this.l);
        }
    }

    copy(){
        return new Vector2(this.x, this.y);
    }

    mag(){
        this.m = Math.sqrt(Math.pow(0 - this.x,2)+Math.pow(0 - this.y,2));
        return this.m;
    }

    angle(radians = false)
    {
        if (radians)
        {
            return Math.atan2(this.x, this.y);
        }

        return Math.atan2(this.x, this.y) * 180 / Math.PI;
    }

    limit(l){
        this.l = l;
    }

    // ---------------------------------

    static sub(v1, v2){
        try{
            if(typeof(v1) == "object" && typeof(v2) == "object"){
                return new Vector2(v1.x - v2.x, v1.y - v2.y);
            }else{
                return new Vector2(v1.x - v2, v1.y - v2);
            }
        }
        catch(e){
            throw new Error(`An error occurred whilst trying to subtract type vector and ${typeof(v2)}`);
        }
    }

    static add(v1, v2){
        try{
            if(typeof(v1) == "object" && typeof(v2) == "object"){
                return new Vector2(v1.x + v2.x, v1.y + v2.y);
            }else{
                return new Vector2(v1.x + v2, v1.y + v2);
            }
        }
        catch(e){
            throw new Error(`An error occurred whilst trying to add type vector and ${typeof(v2)}`);
        }
    }

    static mult(v1, v2){
        try{
            if(typeof(v1) == "object" && typeof(v2) == "object"){
                return new Vector2(v1.x * v2.x, v1.y * v2.y);
            }else{
                return new Vector2(v1.x * v2, v1.y * v2);
            }
        }
        catch(e){
            throw new Error(`An error occurred whilst trying to multiply type vector and ${typeof(v2)}`);
        }
    }

    static div(v1, v2){
        try{
            if(typeof(v1) == "object" && typeof(v2) == "object"){
                return new Vector2(v1.x / v2.x, v1.y / v2.y);
            }else{
                return new Vector2(v1.x / v2, v1.y / v2);
            }
        }
        catch(e){
            throw new Error(`An error occurred whilst trying to divide type vector and ${typeof(v2)}`);
        }
    }
}
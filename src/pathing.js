/*
    TODO pathfinding
    ideally returns an array of path tiles

    A*...?
*/

function findPath(levelGrid /*two dimensional array of tiles*/, sX, sY, gX, gY) {

    const sqrt2 = 1.41421356237;

    const open = [];
    const closed = [];
    const values = (function(){
        let o = [];
        for (let i = 0, l = levelGrid.length; i < l; i++) {
            o.push([]);
        }
        return o;
    })();

    function getTileAt(x, y) {
        return ((levelGrid[y]||[])[x]||[]);
    }

    function atNeighbour(x, y, dX, dY) {
        let c = getTileAt(x+dX, y+dY);
        if (c === [] || closed.includes(c) || c.state < firstWalkableTile) return;

        let tg = values[y][x].g + (dX === 0 || dY === 0 ? 1 : sqrt2);
        let th = dist(c.x, c.y, gX, gY);

        if (open.includes(c) && tg > values[c.y][c.x].g) return;

        values[c.y][c.x] = {
            p: getTileAt(x, y),
            g: tg,
            h: th,
            f: tg + th
        };

        open.push(c);
    }

    // heuristic
    function dist(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    values[sY][sX] = {
        g: 0, f: 0, p: null
    };
    open.push(getTileAt(sX, sY));

    while (open.length > 0) {
        // get node with lowest F
        let lF = Infinity, l, li;
        for (let i = 0, len = open.length; i < len; i++) {
            if (values[open[i].y][open[i].x].f < lF) {
                l = open[i];
                li = i;
                lF = values[open[i].y][open[i].x].f;
            }
        }

        closed.push(l);
        open.splice(li, 1);

        if (l.x == gX && l.y == gY) break;
        
        let x = l.x;
        let y = l.y;
        
        // diagonal neighbours
        atNeighbour(x, y, -1, 1);   
        atNeighbour(x, y, 1, 1); 
        atNeighbour(x, y, -1, -1); 
        atNeighbour(x, y, 1, -1); 
        
        atNeighbour(x, y, -1, 0); 
        atNeighbour(x, y, 1, 0); 
        atNeighbour(x, y, 0, -1); 
        atNeighbour(x, y, 0, 1);
    }

    let next = levelGrid[gY][gX], o = [];
    while (values[next.y][next.x].p) {
        o.push(next);
        next = values[next.y][next.x].p;
    }

    return o;
}
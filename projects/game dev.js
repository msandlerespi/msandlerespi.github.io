function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    // check if the line has hit any of the rectangle's sides
    // uses the Line/Line function below
    let left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    let right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
    // let top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
    // let bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

    // if ANY of the above are true, the line
    // has hit the rectangle
    return left || right /*|| top || bottom*/;
}
function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    // calculate the direction of the lines
    let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    // if uA and uB are between 0-1, lines are colliding
    return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.w = width;
    }
    display() {
        strokeWeight(5);
        stroke(255);
        line(this.x, this.y, this.x + this.w, this.y);
    }
    collide(x, y, w, h) {
        if (lineRect(this.x, this.y, this.x + this.w, this.y, x, y, w, h)) {
            return y + h - this.y;
        }
        return 0;
    }
}

class Player {
    constructor(x, y, w, h, speed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = speed;
        this.moving = [0, 0, 0, 0];
        this.velocity = 0;
    }
    keyDown() {
        this.moving = [0, 0, 0, 0];
        if (keyIsDown(UP_ARROW) || keyIsDown(32) || keyIsDown(87)) {
            this.moving[0] = 1;
        }
        if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
            this.moving[3] = 1;
        }
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
            this.moving[1] = 1;
        }
        if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
            this.moving[2] = 1;
        }
    }
    update(platforms) {
        // Move
        this.keyDown();
        this.x = this.x - this.moving[1] * this.speed + this.moving[2] * this.speed;
        this.y -= this.velocity;
        document.documentElement.scrollTop -= this.velocity;
        // Check collisions
        if (this.moving[0] === 1) {
            if (this.velocity < 10) this.velocity += 1;
        } else if (this.velocity > -10) this.velocity -= 1;
        if (this.velocity <= 0 && this.moving[3] === 0) {
            platforms.forEach(platform => {
                let collision = platform.collide(this.x, this.y, this.w, this.h);
                if (collision && collision + this.velocity < 0) {
                    this.velocity = 0;
                    this.y -= collision;
                }
            })
        }
    }
    display() {
        fill(0);
        strokeWeight(0);
        rect(this.x, this.y, this.w, this.h);
    }
}

var platforms;
var player;
function setup() {
    platforms = document.getElementsByClassName('platform');
    let temp = [];
    [].forEach.call(platforms, platform => {
        let bb = platform.getBoundingClientRect();
        temp.push(new Platform(bb.x, bb.y + bb.height + 6, bb.width));
    });
    platforms = temp;
    player = new Player(400, 50, 30, 80, 8);
    let c = createCanvas(displayWidth, displayHeight);
    c.position(0, 0, 'fixed');
}
function draw() {
    clear();
    player.update(platforms);
    player.display();
    platforms.forEach(platform => {
        platform.display();
    });
}
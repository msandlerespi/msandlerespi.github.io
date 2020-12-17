var scl = 30;
var grid;
var pageHeight = 600;
var triH = scl / 2 * Math.sqrt(3);
var maxH = Math.floor(pageHeight / triH) / 2;
var currentColor;
var shapeIP;
var shapes;
var hist;
var mode;
var btns;
var selected;
var selector;
var moving;
var b1, b2, b3;

function setup() {
    createCanvas(600, 700);
    frameRate(30);
    clear();
    grid = new Grid();
    currentColor = createColorPicker("#000000");
    currentColor.position(10, pageHeight + 20);
    currentColor.size(80, 80);
    currentColor.style('outline: none; border: none; border-radius: 5px;');
    currentColor.changed(() => {
        if (selected) selected.forEach(s => {
            s.color = currentColor.color();
        });
    });
    shapeIP = null;
    shapes = [];
    hist = [];
    mode = 'draw';
    btns = [];
    b1 = createButton('<i class="fa fa-pencil"></i>');
    b1.style('border: none; outline: none; background-color: white; font-size: 30px; border-radius: 5px; cursor: pointer;');
    b2 = createButton('<i class="far fa-object-group"></i>');
    b2.style('border: none; outline: none; background-color: white; font-size: 30px; border-radius: 5px; cursor: pointer;');
    b3 = createButton('<i class="fas fa-eye-dropper"></i>');
    b3.style('border: none; outline: none; background-color: white; font-size: 30px; border-radius: 5px; cursor: pointer;');
    b1.size(60, 60);
    b1.position(120, pageHeight + 30);
    b1.mousePressed(() => mode = 'draw');
    b2.size(60, 60);
    b2.position(200, pageHeight + 30);
    b2.mousePressed(() => mode = 'select');
    b3.size(60, 60);
    b3.position(280, pageHeight + 30);
    b3.mousePressed(() => mode = 'color');
    selected = null;
    selector = null;
    moving = false;
    let start = new Memento();
    start.data = "null/rgba(200, 0, 80, 1);n;210,103;135,233;210,363;285,233;225,129;210,155;255,233;210,311;165,233;225,129/rgba(200, 100, 30, 1);n;210,103;360,103;435,233;285,233;225,129;255,129;300,207;390,207;345,129;225,129/rgba(200, 50, 50, 1);n;285,233;210,363;360,363;435,233;315,233;300,259;390,259;345,337;255,337;315,233/rgba(200, 50, 50, 1);n;165,233;195,233;225,181;210,155/rgba(200, 50, 50, 1);n;270,155;330,155;345,129;255,129/rgba(200, 50, 50, 1);n;195,233;255,233;240,259;210,259/rgba(200, 50, 50, 1);n;330,155;345,181;330,207;300,207/rgba(200, 0, 80, 1);n;330,311;300,311;285,285;300,259/rgba(200, 0, 80, 1);n;330,311;345,337;390,259;360,259/rgba(200, 0, 80, 1);n;330,155;345,129;390,207;360,207/rgba(200, 0, 80, 1);n;300,155;285,181;300,207;330,155/rgba(200, 100, 30, 1);n;165,233;195,233;225,285;210,311/rgba(200, 100, 30, 1);n;195,233;255,233;240,207;210,207/rgba(200, 100, 30, 1);n;270,311;330,311;345,337;255,337/rgba(200, 100, 30, 1);n;330,311;300,259.80762113533154;330,259.80762113533154;345,285.7883832488647";
    start.retrieve();
}

function draw() {
    clear();
    if (mode === 'draw') {
        b1.class('selected');
        b2.class('');
        b3.class('');
    } else if (mode === 'select') {
        b2.class('selected');
        b1.class('');
        b3.class('');
    } else {
        b3.class('selected');
        b2.class('');
        b1.class('');
    }
    if (!keyIsDown(SHIFT))
        grid.display();
    shapes.forEach(shape => shape.display());
    if (selected)
        selected.forEach(shape => shape.displaySelected());
    if (mode === 'draw' && mouseY <= maxH * triH * 2)
        closestPoint(mouseX, mouseY).display(8, currentColor.color());
    if (shapeIP) {
        shapeIP.displayIP();
        let last = shapeIP.vertices[shapeIP.vertices.length - 1];
        let closest = closestPoint(mouseX, mouseY);
        line(last.x, last.y, closest.x, closest.y);
    }
    if (selector)
        selector.display();
}

function saveToSVG() {
    let svg = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">';
    shapes.forEach(s => {
        svg += s.toSVG();
    });
    svg += '</svg>';
    download('myIsoProject', svg);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function mousePressed() {
    if (mouseY <= pageHeight) {
        if (mode === 'draw') {
            saveHist();
            if (!shapeIP) {
                shapeIP = new Shape([closestPoint(mouseX, mouseY)], currentColor.color());
            } else if (shapeIP.vertices[0].dist(closestPoint(mouseX, mouseY)) < scl / 2) {
                shapes.push(shapeIP);
                shapeIP = null;
            } else {
                shapeIP.addVertex(closestPoint(mouseX, mouseY));
            }
        } else if (mode === 'select') {
            if (selected && selected.reduce((acc, val) => acc || polygonPoint(val.vertices, mouseX, mouseY), false)) {
                saveHist(); //polygonPoint is the problem
                if (keyIsDown(18)) {
                    shapes = shapes.concat(selected.map(s => s.copy()));
                }
                moving = true;
            } else {
                selected = null;
                selector = new Selector(mouseX, mouseY);
            }
        } else {
            let str = get(mouseX, mouseY).toString().split(',');
            str.pop();
            str = "rgb(" + str.join(',') + ")";
            currentColor.value(color(str).toString('#rrggbb'));
        }
    }
}

function mouseDragged() {
    if (selected && moving) {
        let d = closestPoint(mouseX, mouseY);
        d.sub(closestPoint(pmouseX, pmouseY));
        if (d.x !== 0 || d.y !== 0) {
            selected.forEach(s => {
                s.vertices.forEach(v => {
                    v.add(d);
                });
            });
        }
    }
}

function mouseReleased() {
    if (mode === 'select' && selector) {
        selected = selector.getSelected();
        selector = null;
    }
    moving = false;
}

function saveHist() {
    hist.push(new Memento().save());
}

function keyPressed() {
    if (keyCode === 90)
        hist.pop().retrieve();
    if (keyCode === 83)
        saveToSVG();
    if ((keyCode === 46 || keyCode === 8) && selected) {
        saveHist();
        shapes = shapes.filter(s => !selected.includes(s));
        selected = null;
    }
    if (keyCode === 82) {
        setup();
    }
}

function closestPoint(x, y) {
    y = Math.round(y / triH);
    return new Point((Math.round((x - (y % 2 * scl / 2)) / scl) * scl) + (y % 2 * scl / 2), y * triH);
}

class Grid {
    constructor() {
        let points = [];
        let lines = [];
        for (let j = 0; j < pageHeight; j += 2 * triH) {
            lines.push(new Line(0, j, width, j));
            lines.push(new Line(0, j + triH, width, j + triH));
            for (let i = 0; i < width; i += scl) {
                points.push(new Point(i, j))
                points.push(new Point(i + scl / 2, j + triH));
            }
        }

        for (let i = 0; i < width; i += scl) {
            lines.push(new Line(i, 0, i + maxH * scl, maxH * Math.sqrt(3) * scl));
            lines.push(new Line(i - width, 0, i + maxH * scl - width, maxH * Math.sqrt(3) * scl));
            lines.push(new Line(i, 0, i - maxH * scl, maxH * Math.sqrt(3) * scl));
            lines.push(new Line(i + width, 0, i - maxH * scl + width, maxH * Math.sqrt(3) * scl));
        }
        this.points = points;
        this.lines = lines;
    }
    display() {
        this.points.forEach(p => p.display(3, 0));
        this.lines.forEach(l => l.display());
    }
}

class Point extends p5.Vector {
    constructor(x, y) {
        super(x, y)
    }
    display(weight, color) {
        stroke(color);
        strokeWeight(weight);
        point(this.x, this.y);
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.p1 = createVector(x1, y1);
        this.p2 = createVector(x2, y2);
    }
    display() {
        stroke(0, 40);
        strokeWeight(1);
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }
}

class Shape {
    constructor(vertices, color) {
        this.vertices = vertices;
        this.color = color;
    }
    display() {
        strokeWeight(1);
        stroke(this.color);
        fill(this.color);
        beginShape();
        this.vertices.forEach(v => {
            vertex(v.x, v.y);
        });
        endShape(CLOSE);
    }
    displayIP() {
        strokeWeight(3);
        stroke(this.color);
        noFill();
        beginShape();
        this.vertices.forEach(v => {
            vertex(v.x, v.y);
        });
        endShape();
    }
    displaySelected() {
        strokeWeight(8);
        stroke(0, 100);
        noFill();
        beginShape();
        this.vertices.forEach(v => {
            vertex(v.x, v.y);
        });
        endShape(CLOSE);
    }
    addVertex(v) {
        this.vertices.push(v);
    }
    toString() {
        let str = this.color + ';';
        str += selected && selected.includes(this) ? 'y;' : 'n;';
        this.vertices.forEach(v => {
            str += v.x + ',' + v.y + ';';
        });
        return str.substring(0, str.length - 1);
    }
    copy() {
        return new Shape(this.vertices.map(v => v.copy()), this.color);
    }
    toSVG() {
        let svg = '<polygon points="';
        this.vertices.forEach(v => {
            svg += v.x + ',' + v.y + ' ';
        });
        svg += '" fill="' + this.color.toString('#rrggbb') + '" />';
        return svg;
    }
}

class Memento {
    constructor() {
        this.data = "";
        // data stored like this: currentColor, shapeIPColor, shapes
    }
    save() {
        if (shapeIP) this.data = shapeIP.toString() + '/';
        else this.data = 'null/'
        shapes.forEach(shape => {
            this.data += shape.toString() + '/';
        })
        this.data = this.data.substring(0, this.data.length - 1);
        return this;
    }
    retrieve() {
        let sections = this.data.split('/')
        if (sections[0] === 'null') shapeIP = null;
        else shapeIP = retrieveShape(sections[0]);
        shapes = [];
        selected = null;
        for (let i = 1; i < sections.length; ++i) {
            shapes.push(retrieveShape(sections[i]));
        }

        function retrieveShape(str) {
            let sections = str.split(';');
            let shape = new Shape([], color(sections[0]));
            for (let i = 2; i < sections.length; ++i) {
                let v = sections[i].split(',');
                shape.addVertex(new Point(parseInt(v[0]), parseInt(v[1])));
            }
            if (sections[1] === 'y') {
                if (selected === null) selected = [];
                selected.push(shape);
            }
            return shape;
        }
    }
}

class Selector extends p5.Vector {
    constructor(x, y) {
        super(x, y);
    }
    display() {
        fill(0, 20);
        stroke(0, 40);
        strokeWeight(5);
        rect(this.x, this.y, mouseX - this.x, mouseY - this.y);
    }
    getSelected() {
        let rx = this.x;
        let ry = this.y;
        let rw = mouseX - this.x;
        let rh = mouseY - this.y;
        if (rw < 0) {
            rx = mouseX;
            rw = -rw;
        }
        if (rh < 0) {
            ry = mouseY;
            rh = -rh;
        }
        return shapes.filter(shape => polyRect(shape.vertices, rx, ry, rw, rh));
    }
}

// COLLISION FUNCTIONS

function polyRect(vertices, rx, ry, rw, rh) {

    // go through each of the vertices, plus the next
    // vertex in the list
    if (vertices.reduce((acc, val) => {
        return acc && val.x > rx && val.x < rx + rw && val.y > ry && val.y < ry + rh;
    }, true)) return true;
    let next = 0;
    for (let current = 0; current < vertices.length; ++current) {

        // get next vertex in list
        // if we've hit the end, wrap around to 0
        next = current + 1;
        if (next == vertices.length) next = 0;

        // get the PVectors at our current position
        // this makes our if statement a little cleaner
        let vc = vertices[current]; // c for "current"
        let vn = vertices[next]; // n for "next"

        // check against all four sides of the rectangle
        let collision = lineRect(vc.x, vc.y, vn.x, vn.y, rx, ry, rw, rh);
        if (collision) return true;
    }
    return polygonPoint(vertices, rx, ry);
}

function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {

    // check if the line has hit any of the rectangle's sides
    // uses the Line/Line function below
    let left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
    let right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
    let top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
    let bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

    // if ANY of the above are true,
    // the line has hit the rectangle
    return left || right || top || bottom;
}

function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

    // calculate the direction of the lines
    let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    // if uA and uB are between 0-1, lines are colliding
    return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}

function polygonPoint(vertices, px, py) {
    let collision = false;
    // go through each of the vertices, plus the next
    // vertex in the list
    let next = 0;
    for (let current = 0; current < vertices.length; current++) {

        // get next vertex in list
        // if we've hit the end, wrap around to 0
        next = current + 1;
        if (next == vertices.length) next = 0;

        // get the PVectors at our current position
        // this makes our if statement a little cleaner
        let vc = vertices[current]; // c for "current"
        let vn = vertices[next]; // n for "next"

        // compare position, flip 'collision' variable
        // back and forth
        if (((vc.y > py && vn.y < py) || (vc.y < py && vn.y > py)) &&
            (px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x)) {
            collision = !collision;
        }
    }
    return collision;
}
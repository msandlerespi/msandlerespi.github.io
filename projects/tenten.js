var tentenData;

function setNewGame() {
  var value = [];
  //cell rgb values
  for (var i = 0; i < 100; i++) {
    value[i] = "rgb(225,225,225)";
  }
  //pieces
  value[100] = Math.floor(19 * Math.random());
  value[101] = Math.floor(19 * Math.random());
  value[102] = Math.floor(19 * Math.random());
  //points
  value[103] = 0;
  tentenData = value;
}

//Preload stuff
let myFont;
let trophy;
let smallTrophy;
function preload() {
  myFont = loadFont("assets/Liberal-Regular.otf");
  trophy = loadImage("assets/trophy.png");
  smallTrophy = loadImage("assets/trophy.small.png");
}

//Game
let gridStart;
let gridSize;
let cells;
let pieces;
let gameOver;
let inHand;
let points;
let highscore = 0;
let baseColor;
let destroyed;
let pause;
function setup() {
  createCanvas(400, 400);
  setNewGame();
  noStroke();
  textAlign(CENTER);
  textFont(myFont);
  gridStart = createVector(width / 7, height / 20);
  gridSize = width - 2 * gridStart.x;
  gameOver = false;
  pause = true;
  baseColor = color(225);
  inHand = 0;
  points = 0;

  cells = [];
  for (var i = 0; i < 10; i++) {
    cells[i] = [];
    for (var j = 0; j < 10; j++) {
      cells[i][j] = new Cell(createVector(gridStart.x + gridSize / 10 * i, gridStart.y + gridSize / 10 * j), baseColor);
    }
  }
  pieces = [];
  for (var i = 0; i < 100; i++) {
    var rgbVals = tentenData[i].toString().match(/\d+/g);
    cells[int(i / 10)][i % 10].c = color(rgbVals[0], rgbVals[1], rgbVals[2]);
  }
  let piece1 = tentenData[100];
  let piece2 = tentenData[101];
  let piece3 = tentenData[102];
  if (piece1 == null) pieces[0] = null;
  else pieces[0] = new Piece(piece1);
  if (piece2 == null) pieces[1] = null;
  else pieces[1] = new Piece(piece2);
  if (piece3 == null) pieces[2] = null;
  else pieces[2] = new Piece(piece3);
  points = tentenData[103];
  destroyed = [];
}

function draw() {
  background(255);
  draw_UI();
  for (var i = destroyed.length - 1; i >= 0; i--) {
    if (destroyed[i].display()) {
      destroyed.splice(i, 1);
    }
  }
  if (gameOver) {
    fill(255, 100);
    rect(0, 0, width, height);
    textSize(30);
    fill(0);
    text("GAME OVER", width / 2, height / 2);
    text(points, width / 2 + 3, height / 2 + 40);
  }
  if (pause) {
    //background
    fill(255);
    rect(0, 0, width, height);
    //buttons
    rectMode(CENTER);
    fill(152, 220, 85);
    rect(width / 2 - 21 * width / 200, 5 * height / 8, width / 5, height / 5, 10);
    fill(125, 132, 213);
    rect(width / 2 + 21 * width / 200, 5 * height / 8, width / 5, height / 5, 10);
    rectMode(CORNER);
    fill(255);
    //play button
    triangle(width / 2 - 14 * width / 200, 5 * height / 8, width / 2 - 26 * width / 200, 47 * height / 80, width / 2 - 26 * width / 200, 53 * height / 80);
    //new game button
    ellipse(width / 2 + 21 * width / 200, 5 * height / 8, width / 11, height / 11);
    fill(125, 132, 213);
    ellipse(width / 2 + 21 * width / 200, 5 * height / 8, 8 * width / 110, 8 * height / 110);
    triangle(width / 2 + 21 * width / 200, 5 * height / 8, width / 2 + 21 * width / 200 - 6 * width / 100, 5 * height / 8 + 5 * height / 100, width / 2 + 21 * width / 200 - 5 * width / 100 + width / 100, 5 * height / 8 + 5 * height / 100 + 20);
    fill(255);
    triangle(width / 2 + 21 * width / 200, 5 * height / 8 + 5 * height / 220, width / 2 + 21 * width / 200, 5 * height / 8 + 13 * height / 220, width / 2 + width / 13 + width / 150, 5 * height / 8 + 9 * height / 220);
    //highscore
    fill(96, 190, 231);
    textSize(40);
    text(highscore, width / 2 + 3, 5 * height / 12);
    image(trophy, width / 2 - trophy.width / 2, height / 4 - trophy.height / 2);
  }
}

function draw_UI() {
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      cells[i][j].display();
    }
  }
  for (var i = 1; i < 4; i++) {
    let temp = pieces[i - 1];
    if (temp != null) {
      if (temp.inUse) {
        pieces[i - 1].display(gridSize / 10, createVector(mouseX, mouseY));
      } else {
        pieces[i - 1].display(width / 27, createVector(i * width / 4, 7 * height / 8));
      }
    }
  }
  textSize(20);
  fill(152, 220, 85);
  text(points, width / 16, 4 * height / 16);
  fill(96, 190, 231);
  text(highscore, 15 * width / 16, 4 * height / 16);
  //pause button
  fill(237, 148, 76);
  rect(15 * width / 16, height / 100, 6, 20, 30);
  rect(15 * width / 16 + 10, height / 100, 6, 20, 30);
}

function mousePressed() {
  if (pause) {
    if (mouseY > 5 * height / 8 - height / 10 && mouseY < 5 * height / 8 + height / 10 && mouseX > width / 2 + 21 * width / 200 - width / 10 && mouseX < width / 2 + 21 * width / 200 + width / 10) {
      pause = false;
      setNewGame();
      setup();
    } else if (mouseY > 5 * height / 8 - height / 10 && mouseY < 5 * height / 8 + height / 10 && mouseX > width / 2 - 21 * width / 200 - width / 10 && mouseX < width / 2 - 21 * width / 200 + width / 10) {
      pause = false;
    }
  } else {
    if (gameOver) {
      setup();
    } else {
      if (inHand == 0) {
        if (mouseY > 7 * height / 8 - width / 12 && mouseY < 7 * height / 8 + width / 12) {
          if (mouseX > width / 4 - width / 12 && mouseX < width / 4 + width / 12 && pieces[0] != null) {
            inHand = 1;
            pieces[0].inUse = true;
          }
          else if (mouseX > width / 2 - width / 12 && mouseX < width / 2 + width / 12 && pieces[1] != null) {
            inHand = 2;
            pieces[1].inUse = true;
          }
          else if (mouseX > 3 * width / 4 - width / 12 && mouseX < 3 * width / 4 + width / 12 && pieces[2] != null) {
            inHand = 3;
            pieces[2].inUse = true;
          }
        } else if (mouseX > 15 * width / 16 - 4 && mouseX < 15 * width / 16 + 20 && mouseY > 0 && mouseY < height / 100 + 24) {
          pause = true;
        }
      } else {
        if (check_validity(mouse_cell(), inHand - 1)) {
          let p = mouse_cell();
          for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
              if (pieces[inHand - 1].cmpts[i][j] == 1) {
                let xi = p.x - (2 - i);
                let yj = p.y - (2 - j);
                cells[xi][yj].c = pieces[inHand - 1].c;
              }
            }
          }
          var r = break_lines();
          r = 5 * r * (r + 1);
          points += pieces[inHand - 1].pts + r;
          pieces[inHand - 1] = null;
          if (pieces[0] == null && pieces[1] == null && pieces[2] == null) gen_pieces();
          save_state();
          gameOver = check_possible();
          if (gameOver) {
            if (highscore < points) {
              highscore = points;
            }
            setNewGame();
          }
        } else {
          pieces[inHand - 1].inUse = false;
        }
        inHand = 0;
      }
    }
  }
}

function mouse_cell() {
  return createVector(int((mouseX - gridStart.x) / (gridSize / 10)), int((mouseY - gridStart.y) / (gridSize / 10)));
}

function save_state() {
  //TODO: fix color issues
  let value = [];
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      value[i * 10 + j] = cells[i][j].c.toString();
    }
  }
  if (pieces[0] == null) value[100] = null;
  else value[100] = pieces[0].type;
  if (pieces[1] == null) value[101] = null;
  else value[101] = pieces[1].type;
  if (pieces[2] == null) value[102] = null;
  else value[102] = pieces[2].type;
  value[103] = points;
  tentenData = value;
}

function check_validity(p, n) {
  if (inHand == 0) {
    return false;
  }
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      if (pieces[n].cmpts[i][j] == 1) {
        let xi = p.x - (2 - i);
        let yj = p.y - (2 - j);
        if (xi >= 0 && xi < 10 && yj >= 0 && yj < 10) {
          if (cells[xi][yj].c.toString() != baseColor.toString()) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  }
  return true;
}

function gen_pieces() {
  pieces[0] = new Piece(pick_piece(int(random(42))));
  pieces[1] = new Piece(pick_piece(int(random(42))));
  pieces[2] = new Piece(pick_piece(int(random(42))));
  function pick_piece(a) {
    if (a == 0) return 13;
    if (a == 1) return 14;
    if (a == 2) return 15;
    if (a == 3) return 18;
    if (a == 4 || a == 5) return 0;
    if (a == 6 || a == 7) return 5;
    if (a == 8 || a == 9) return 6;
    if (a == 10 || a == 11) return 7;
    if (a == 12 || a == 13) return 8;
    if (a == 14 || a == 15) return 9;
    if (a == 16 || a == 17) return 10;
    if (a == 18 || a == 19) return 11;
    if (a == 20 || a == 21) return 12;
    if (a == 22 || a == 23) return 17;
    if (a > 23 && a <= 26) return 1;
    if (a > 26 && a <= 29) return 2;
    if (a > 29 && a <= 32) return 3;
    if (a > 32 && a <= 35) return 4;
    //if(a > 35 && a <=41) return 16;
    return 16;
  }
}

function check_possible() {
  for (var p = 0; p < 3; p++) {
    if (pieces[p] != null) {
      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
          if (check_validity(createVector(i, j), p)) return false;
        }
      }
    }
  }
  return true;
}

function break_lines() {
  let count = 0;
  let is = [];
  let js = [];
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (cells[i][j].c.toString() == baseColor.toString()) {
        break;
      } else if (j == 9) {
        count++;
        is.push(i);
      }
    }
  }
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      if (cells[j][i].c.toString() == baseColor.toString()) {
        break;
      } else if (j == 9) {
        count++;
        js.push(i);
      }
    }
  }
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < is.length; j++) {
      let temp = cells[is[j]][i];
      destroyed.push(new Destroy(temp.pos, temp.c, i));
      cells[is[j]][i].c = baseColor;
    }
    for (var j = 0; j < js.length; j++) {
      let temp = cells[i][js[j]];
      destroyed.push(new Destroy(temp.pos, temp.c, i));
      cells[i][js[j]].c = baseColor;
    }
  }
  return count;
}

function cell_display(scl, c, pos) {
  let sep = 1;
  fill(c);
  rect(pos.x + sep, pos.y + sep, scl - sep, scl - sep, scl / 5);
}

class Cell {

  //accepts a vector pos and a color c
  constructor(pos, c) {
    this.pos = pos;
    this.c = c;
  }

  display() {
    cell_display(gridSize / 10, this.c, this.pos);
  }
}

class Piece {
  constructor(type) {
    this.cmpts = [];
    this.pts = 0;
    this.c = color(255, 0, 0);
    this.type = type;
    this.inUse = false;
    for (var i = 0; i < 5; i++) {
      this.cmpts[i] = [];
    }
    switch (type) {
      case 0:
        //.
        this.cmpts[2][2] = 1;
        this.pts = 1;
        this.c = color(125, 143, 214);
        break;
      case 1:
        //-
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.pts = 2;
        this.c = color(255, 198, 62);
        break;
      case 2:
        //i
        this.cmpts[2][2] = 1;
        this.cmpts[3][2] = 1;
        this.pts = 2;
        this.c = color(255, 198, 62);
        break;
      case 3:
        //_
        this.cmpts[2][1] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.pts = 3;
        this.c = color(237, 148, 76);
        break;
      case 4:
        //I
        this.cmpts[1][2] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[3][2] = 1;
        this.pts = 3;
        this.c = color(237, 148, 76);
        break;
      case 5:
        //r
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[3][2] = 1;
        this.pts = 3;
        this.c = color(89, 203, 134);
        break;
      case 6:
        //l
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[1][2] = 1;
        this.pts = 3;
        this.c = color(89, 203, 134);
        break;
      case 7:
        //j
        this.cmpts[2][2] = 1;
        this.cmpts[2][1] = 1;
        this.cmpts[1][2] = 1;
        this.pts = 3;
        this.c = color(89, 203, 134);
        break;
      case 8:
        //t
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[1][2] = 1;
        this.pts = 3;
        this.c = color(89, 203, 134);
        break;
      case 9:
        //h
        this.cmpts[2][1] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[2][4] = 1;
        this.pts = 4;
        this.c = color(288, 108, 130);
        break;
      case 10:
        //O
        this.cmpts[1][1] = 1;
        this.cmpts[1][2] = 1;
        this.cmpts[1][3] = 1;
        this.cmpts[2][1] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[3][1] = 1;
        this.cmpts[3][2] = 1;
        this.cmpts[3][3] = 1;
        this.pts = 9;
        this.c = color(77, 213, 177);
        break;
      case 11:
        //H
        this.cmpts[2][0] = 1;
        this.cmpts[2][1] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[2][4] = 1;
        this.pts = 5;
        this.c = color(221, 101, 85);
        break;
      case 12:
        //V
        this.cmpts[0][2] = 1;
        this.cmpts[1][2] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[3][2] = 1;
        this.cmpts[4][2] = 1;
        this.pts = 5;
        this.c = color(221, 101, 85);
        break;
      case 13:
        //J
        this.cmpts[0][2] = 1;
        this.cmpts[1][2] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[2][1] = 1;
        this.cmpts[2][0] = 1;
        this.pts = 5;
        this.c = color(92, 190, 229);
        break;
      case 14:
        //T
        this.cmpts[2][0] = 1;
        this.cmpts[2][1] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[3][2] = 1;
        this.cmpts[4][2] = 1;
        this.pts = 5;
        this.c = color(92, 190, 229);
        break;
      case 15:
        //R
        this.cmpts[2][4] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[3][2] = 1;
        this.cmpts[4][2] = 1;
        this.pts = 5;
        this.c = color(92, 190, 229);
        break;
      case 16:
        //o
        this.cmpts[1][3] = 1;
        this.cmpts[1][2] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.pts = 4;
        this.c = color(150, 220, 88);
        break;
      case 17:
        //v
        this.cmpts[0][2] = 1;
        this.cmpts[1][2] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[3][2] = 1;
        this.pts = 4;
        this.c = color(288, 108, 130);
        break;
      case 18:
        //L
        this.cmpts[0][2] = 1;
        this.cmpts[1][2] = 1;
        this.cmpts[2][2] = 1;
        this.cmpts[2][3] = 1;
        this.cmpts[2][4] = 1;
        this.pts = 5;
        this.c = color(92, 190, 229);
        break;
    }
  }
  display(scl, pos) {
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        if (this.cmpts[i][j] == 1) {
          cell_display(scl, this.c, createVector(pos.x - (2 - i) * scl - scl / 2, pos.y - (2 - j) * scl - scl / 2));
        }
      }
    }
  }
}

class Destroy {
  constructor(pos, c, delay) {
    this.pos = createVector(pos.x, pos.y);
    this.c = c;
    this.scl = gridSize / 10;
    this.delay = delay;
    this.sclRate = -2;
  }
  display() {
    if (this.delay == 0) {
      this.sclRate += .5;
      this.scl -= this.sclRate;
      if (this.scl <= 0) {
        return true;
      }
      this.pos.add(this.sclRate / 2, this.sclRate / 2);
    } else {
      this.delay -= 0.5;
    }
    cell_display(this.scl, this.c, this.pos)
    return false;
  }
}
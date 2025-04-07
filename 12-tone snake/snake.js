//function to create snake object, with location and speed
function Snake() {
  this.x = 0;
  this.y = 0;
  this.xspeed = 1;
  this.yspeed = 0;
  this.total = 0; //to track the lenght of snake. If the snakes eat the food, total should go up to 1. total++
  this.tail = [];//an array object for the tail
  this.ate = false;

  //receives the position where the food is
  this.eat = function (pos) {
    //creates a distance variable to where the snake is in relation to where the food is
    var d = dist(this.x, this.y, pos.x, pos.y);
    //tells me wheter or not the snake reaches the food
    if (d < 1) {
      this.total++;//if snake eats the food, total goes up to one
      this.ate = true;
      return true;
    } else {
      this.ate = false;
      return false;
    }
  }

  //directions function receives two values x and y  
  this.dir = function (x, y) {
    this.xspeed = x;
    this.yspeed = y;
  }

  //function to kill the snake when it touches its own body
  this.death = function () {
    for (var i = 0; i < this.tail.length; i++) {//loop throught every spot in the tail (not inc. head)
      var pos = this.tail[i];
      var d = dist(this.x, this.y, pos.x, pos.y);
      if (d < 1) {
        return true;
      }
    }
    return false;
  }


  //function that updates object's moves based on current lcoation + speed.   
  this.update = function () {

    //If the total is the same size as array length, meaning no food has been eaten, then shift everything over
    if (this.total === this.tail.length) {
      for (var i = 0; i < this.tail.length - 1; i++) { //as snakes move shift spots down getting the new spot at the end of the array
        this.tail[i] = this.tail[i + 1];//as it moves shift everything over by one
      }
    }

    this.tail[this.total - 1] = createVector(this.x, this.y);//when I am done moving I want the last spot to create Vector on the tail equals to current location of snake

    this.x = this.x + this.xspeed * scl;
    this.y = this.y + this.yspeed * scl;

    this.x = (this.x + 360) % 360;
    this.y = (this.y + 360) % 360;

  }

  this.show = function () {
    fill(0, 255, 0, 225);
    //draw the tail on current location
    for (var i = 0; i < this.tail.length; i++) {
      rect(this.tail[i].x, this.tail[i].y, scl, scl);
    }

    //draw the head on current location
    rect(this.x, this.y, scl, scl);
    document.dispatchEvent(new CustomEvent('play', {
      detail: {
        x: floor(this.x / scl),
        y: floor(this.y / scl),
        amp: this.ate ? 1 : .5
      }
    }))
  }
}  
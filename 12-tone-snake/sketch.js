// 1. Press Play at the top
// 2. Click on dark grey canvas (before snake hit the wall)
// 3. Use key arrows to move snake

var s, g;
var scl = 30;
var food;
var playing = false;

function setup() {
  createCanvas(360, 360, document.querySelector('.gamespace'));
  frameRate(10);
  g = new Grid();
  s = new Snake();
  food = createVector(random(width), random(height));
  pickLocation();

  document.querySelector('.start').addEventListener('click', () => {
    document.querySelector('.back').disabled = true;
    document.querySelector('.start').disabled = true;
    playing = true;
  });

  // Add event listeners for death screen buttons
  document.querySelector('.play-again').addEventListener('click', () => {
    document.querySelector('.death-screen').style.display = 'none';
    g.cleanup();  // Clean up the old grid
    g = new Grid();  // Create a new grid
    s = new Snake();
    food = createVector(random(width), random(height));
    pickLocation();
    // Re-enable all buttons
    document.querySelectorAll('.note').forEach(button => {
      button.disabled = false;
    });
    document.querySelector('.back').disabled = false;
    document.querySelector('.start').disabled = true;  // Start should be disabled until 12 notes are selected
    playing = false;  // Reset playing state
  });

  document.querySelector('.download-midi').addEventListener('click', () => {
    // Add end of track event
    g.midi.addEvent(new Midi.MetaEvent({
      type: Midi.MetaEvent.END_OF_TRACK,
      time: 0
    }));

    // Convert to bytes and download
    const midiBytes = g.midiFile.toBytes();
    console.log('MIDI bytes:', midiBytes); // Debug log

    // Convert string to Uint8Array
    const bytes = new Uint8Array(midiBytes.length);
    for (let i = 0; i < midiBytes.length; i++) {
      bytes[i] = midiBytes.charCodeAt(i);
    }

    // Create and download the file
    const blob = new Blob([bytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snakeSong.mid';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

//function to store snake's location on the grid
//floor calculates the closest int value that is less than or equal to the value of the parameter.
function pickLocation() {
  var cols = floor(width / scl);
  var rows = floor(height / scl);
  food = createVector(floor(random(cols)), floor(random(rows)));//this ensure the food is in the grid aligned with snake
  food.mult(scl);//to expand it back out
}

function draw() {
  background(255);

  if (s.eat(food)) {
    pickLocation();
  }
  g.show();
  if (playing) {
    if (s.death()) {
      playing = false;
      document.dispatchEvent(new Event('stop'));
      document.querySelector('.death-screen').style.display = 'flex';
    } else {
      s.update();
    }
    s.show();

    fill(255, 0, 100, 225);
    rect(food.x, food.y, scl, scl);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    s.dir(0, -1); //moves 0 along x and -1 (up) along y axis
  } else if (keyCode === DOWN_ARROW) {
    s.dir(0, 1);
  } else if (keyCode === RIGHT_ARROW) {
    s.dir(1, 0);
  } else if (keyCode === LEFT_ARROW) {
    s.dir(-1, 0);
  }
}



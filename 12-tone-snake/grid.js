function Grid() {
  this.indices = [];
  this.notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  this.classes = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
  let _this = this;

  this.osc = new p5.Oscillator();
  this.osc.amp(0.5);
  this.playing = false;

  // Initialize MIDI file and track
  this.midiFile = new Midi.File({ ticks: 128 });
  this.midi = new Midi.Track();
  this.midiFile.addTrack(this.midi);
  this.midi.setTempo(120);
  this.midi.setInstrument(0, 0);

  // Add track name
  this.midi.addEvent(new Midi.MetaEvent({
    type: Midi.MetaEvent.TRACK_NAME,
    data: 'Snake Song',
    time: 0
  }));

  // Store event listeners so we can remove them later
  this.noteClickHandlers = [];
  this.backClickHandler = null;
  this.playEventHandler = null;
  this.stopEventHandler = null;

  // Add note click handlers
  document.querySelectorAll('.note').forEach(note => {
    const handler = function () {
      _this.indices.push(note.dataset.index);
      _this.update();
    };
    this.noteClickHandlers.push(handler);
    note.addEventListener('click', handler);
  });

  // Add back button handler
  this.backClickHandler = function () {
    _this.indices.pop();
    _this.update();
  };
  document.querySelector('.back').addEventListener('click', this.backClickHandler);

  // Add play/stop event handlers
  this.playEventHandler = (e) => { _this.play(e.detail.x, e.detail.y, e.detail.amp) };
  this.stopEventHandler = () => { _this.stop() };
  document.addEventListener('play', this.playEventHandler);
  document.addEventListener('stop', this.stopEventHandler);

  this.update = function () {
    document.querySelectorAll('.note').forEach(note => { note.disabled = false });
    this.indices.forEach(function (index) {
      document.querySelector('.' + _this.classes[index]).disabled = true;
    });
    if (this.indices.length === 12) document.querySelector('.start').disabled = false;
    else document.querySelector('.start').disabled = true;
  }

  // Initialize with all buttons enabled
  this.update();

  // Cleanup method to remove event listeners
  this.cleanup = function () {
    // Remove note click handlers
    document.querySelectorAll('.note').forEach((note, index) => {
      if (this.noteClickHandlers[index]) {
        note.removeEventListener('click', this.noteClickHandlers[index]);
      }
    });
    this.noteClickHandlers = [];

    // Remove back button handler
    if (this.backClickHandler) {
      document.querySelector('.back').removeEventListener('click', this.backClickHandler);
      this.backClickHandler = null;
    }

    // Remove play/stop event handlers
    if (this.playEventHandler) {
      document.removeEventListener('play', this.playEventHandler);
      this.playEventHandler = null;
    }
    if (this.stopEventHandler) {
      document.removeEventListener('stop', this.stopEventHandler);
      this.stopEventHandler = null;
    }

    // Stop and reset audio
    this.stop();

    // Reset other state
    this.indices = [];
    this.playing = false;
    this.midiFile = new Midi.File({ ticks: 128 });
    this.midi = new Midi.Track();
    this.midiFile.addTrack(this.midi);
    this.midi.setTempo(120);
    this.midi.setInstrument(0, 0);
  }

  this.show = function () {
    for (let i = 0; i < this.indices.length; i++) {
      for (let j = 0; j < this.indices.length; j++) {
        let current = (this.indices[i] - (this.indices[j] - this.indices[0]) + 12) % 12;
        stroke('#0006');
        strokeWeight(1);
        fill('white');
        textAlign(CENTER, CENTER);
        rect(i * scl, j * scl, scl, scl);
        strokeWeight(0);
        fill('black');
        text(this.notes[current], (i * scl) + (scl / 2), (j * scl) + (scl / 2));
      }
    }
  }

  this.play = function (x, y, amp) {
    if (!this.playing) {
      this.osc.start();
      this.playing = true;
    }
    let current = 60 + ((this.indices[x] - (this.indices[y] - this.indices[0]) + 12) % 12);

    // Add note to MIDI track
    this.midi.addNote(0, current, 128, 0, 64);
    this.osc.freq(midiToFreq(current));
  }

  this.stop = function () {
    if (this.playing) {
      this.osc.amp(0, .5); // Fade out over 0.1 seconds
      this.osc.stop(.5);
      this.playing = false;
    }
  }
}

function writeFileSync(filename, content) {
  const blob = new Blob([content], { type: "audio/midi" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
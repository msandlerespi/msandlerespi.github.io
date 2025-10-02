let currentTimeIndex = 0; // multiply this value by timeStep to get currentTime;
let audioSignal;

const extractorWorker = new Worker("audioScripts/extractor-worker.js");
extractorWorker.onmessage = e => {
  console.log("From extractor", e.data);
  sendForInferenceMusiCNN(e.data.features);
  if (audioModelNames.includes('bpm')) prepareAudioData('bpm', e.data.bpm);
}

const inferenceWorkers = [];
function initializeInferenceWorkers() {
  for (let i = 0; i < audioModelNames.length; i++) {
    if (!['bpm'].includes(audioModelNames[i])) { // we handle these elsewhere
      let inferenceWorker = new Worker("audioScripts/inference-worker.js")
      inferenceWorkers.push(inferenceWorker);
      inferenceWorker.postMessage(audioModelNames[i]);

      inferenceWorker.onmessage = e => {
        console.log("Predictions from tfjs for " + audioModelNames[i], e.data);
        prepareAudioData(audioModelNames[i], e.data);
      }
    }
  }
}

function sendForFeatureExtraction() {
  if (audioSignal) {
    if (currentTimeIndex * timeStep < audioSignal.length / audioSampleRate * 1000) {
      // audio feature extraction
      let start = currentTimeIndex * timeStep;
      let end = Math.min((currentTimeIndex + 1) * timeStep, audioSignal.length / audioSampleRate * 1000);
      sliceAudioSignal(audioSignal, start, end, audioSampleRate, (audioData) => {
        extractorWorker.postMessage(audioData);
      });
    } else {
      console.log('Inference complete!');
      document.dispatchEvent(new Event('analyzed-audio'));
    }
  } else {
    console.warn("Audio not loaded yet! Try again.");
  }
}

function sendForInferenceMusiCNN(inputFeature) {
  for (let i = 0; i < inferenceWorkers.length; i++) {
    inferenceWorkers[i].postMessage(inputFeature);
  }
}

let inferencesMade = 0;
function prepareAudioData(type, data) {
  inferencesMade++;
  if (typeof data === 'string' || data instanceof String) {
    addQualValue(type, data);
  } else if (typeof data === 'number' || Number.isInteger(data)) {
    addQuantValue(type, data);
  } else if (typeof data === 'object') {
    let entries = Object.entries(data);
    inferencesMade -= (entries.length + 1);
    for (const [key, value] of entries) {
      console.log(typeof value);
      prepareAudioData(key, value);
    }
    inferencesMade++;
  }

  if (inferencesMade === audioModelNames.length) { // if we've finished retrieving all inferences
    inferencesMade = 0;
    currentTimeIndex++;
    sendForFeatureExtraction();
  }
}

document.addEventListener('prepare-audio-data', (e) => {
  console.log(e.detail);
  prepareAudioData('', e.detail);
})

document.addEventListener('analyze', async () => {
  currentTimeIndex = 0;
  extractorWorker.postMessage(windowSize);
  initializeInferenceWorkers();

  getAudioBufferFromFile(audioFile, audioCtx)
    .then((audioBuffer) => downsampleAudioBuffer(audioBuffer, audioSampleRate))
    .then((downsampledAudio) => {
      audioSignal = downsampledAudio;
      sendForFeatureExtraction();
    });
});
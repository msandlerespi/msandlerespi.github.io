importScripts("../lib/essentia-wasm.module.js");
importScripts("../lib/essentia.js-model.umd.js");

const EssentiaWASM = Module;

const essentia = new EssentiaWASM.EssentiaJS(false);
essentia.arrayToVector = EssentiaWASM.arrayToVector;

const extractor = new EssentiaModel.EssentiaTFInputExtractor(EssentiaWASM, "musicnn");
let windowSize = 1024;

self.onmessage = e => {
    if (typeof e.data === 'number' || Number.isInteger(e.data)) {
        windowSize = e.data;
        console.log('Window Size: ' + windowSize);
    } else {
        let features = extractor.computeFrameWise(e.data, windowSize);
        features.audioLength = e.data.length;
        // post the feature as message to the main thread

        let vectorSignal = essentia.arrayToVector(e.data);
        let bpm = essentia.PercivalBpmEstimator(vectorSignal, 1024, 2048, 128, 128, 210, 50, 16000).bpm;
        if (bpm < 90) bpm *= 2;
        if (bpm > 180) bpm /= 2;

        self.postMessage({ features: features, bpm: bpm });
    }
}

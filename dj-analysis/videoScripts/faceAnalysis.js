const MODEL_URL = './videoModels';

await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
await faceapi.loadFaceExpressionModel(MODEL_URL);
await faceapi.loadFaceLandmarkModel(MODEL_URL);
await faceapi.loadFaceRecognitionModel(MODEL_URL);

document.addEventListener('analyze-facial-valence', () => {
  // if (!input) {
  //   input = analysisVideoPlayer;
  //   Scd(input, { mode: 'PlaybackMode' });
  //   input.addEventListener('scenechange', function (e) {
  //     console.log('scene changed @ ', e.timeStamp)
  //   });
  // }
  analyzeFacialValence();
})

async function analyzeFacialValence() {
  let fullFaceDescriptions = await faceapi.detectAllFaces(analysisVideoPlayer).withFaceLandmarks().withFaceExpressions();

  if (fullFaceDescriptions.length > 0) {
    let avgExpressions = fullFaceDescriptions
      .map(x => x.expressions) // get expressions
      .reduce((acc, val) => {  // get the average expression of the group
        Object.keys(acc).forEach((key) => {
          acc[key] += val[key] / fullFaceDescriptions.length;
        });
        return acc;
      }, { angry: 0, disgusted: 0, fearful: 0, happy: 0, neutral: 0, sad: 0, surprised: 0 })
    let valence = avgExpressions['happy'] + avgExpressions['surprised'];
    document.dispatchEvent(new CustomEvent("prepare-facial-valence-data", { detail: valence }));
  } else {
    // console.log('no faces detected');
  }

  if (!analysisVideoPlayer.paused) {
    analysisVideoPlayer.requestVideoFrameCallback(analyzeFacialValence);
  }
}

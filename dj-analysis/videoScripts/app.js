document.addEventListener('analyze', () => {
  if (videoModelNames.includes('facial-valence')) {
    document.dispatchEvent(new Event('analyze-facial-valence'));
  }
  if (videoModelNames.includes('motion')) {
    document.dispatchEvent(new Event('analyze-motion'));
  }
  analysisVideoPlayer.play();
  let timeIndex = 1;
  let timestep = timeStep / 1000;
  analysisVideoPlayer.addEventListener('timeupdate', () => {
    if (analysisVideoPlayer.currentTime > timeIndex * timestep) {
      timeIndex++;
      processVideoStep();
    }
  });
  analysisVideoPlayer.addEventListener('ended', () => {
    document.dispatchEvent(new Event('analyzed-audio'));
  })
});

let facialValenceSum = 0;
let facialValencesViewed = 0;
document.addEventListener('prepare-facial-valence-data', (e) => {
  facialValenceSum += e.detail;
  facialValencesViewed++;
});

let motionSum = 0;
let motionsViewed = 0;
document.addEventListener('prepare-motion-data', (e) => {
  motionSum += e.detail;
  motionsViewed++;
});

function processVideoStep() {
  let facialValenceAvg = 0;
  if (facialValencesViewed > 0) facialValenceAvg = facialValenceSum / facialValencesViewed;
  let motionAvg = 0;
  if (motionsViewed > 0) motionAvg = motionSum / motionsViewed;

  if (facialValenceAvg > 0) addQuantValue('facial-valence', facialValenceAvg);
  if (motionAvg > 0) addQuantValue('motion', motionAvg);

  facialValenceSum = 0;
  facialValencesViewed = 0;
  motionSum = 0;
  motionsViewed = 0;
}
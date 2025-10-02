let previousPoses;
let distThreshold = 50;
posenet.load().then(async function (net) {
  // posenet model loaded
  const imageScaleFactor = 0.50;
  const flipHorizontal = false;
  const outputStride = 16;
  // get up to 5 poses
  const maxPoseDetections = 5;
  // minimum confidence of the root part of a pose
  const scoreThreshold = 0.5;
  // minimum distance in pixels between the root parts of poses
  const nmsRadius = 20;
  // const videoElement = document.getElementById('video');
  // load posenet
  net = await posenet.load();
  async function calculate() {
    const poses = await net.estimateMultiplePoses(
      analysisVideoPlayer, imageScaleFactor, flipHorizontal, outputStride,
      maxPoseDetections, scoreThreshold, nmsRadius);
    processPoses(poses);
    if (!analysisVideoPlayer.paused) {
      analysisVideoPlayer.requestVideoFrameCallback(calculate);
    }
  }
  document.addEventListener('analyze-motion', calculate);
  console.log('loaded!');
});

function processPoses(poses) {
  if (previousPoses && previousPoses.length && poses && poses.length) {
    // step 1
    let ap = poses.map((pose) => {
      return previousPoses.map((prevPose) => {
        let dists = poseDists(pose, prevPose);
        return poseDist(dists);
      })
    });

    // step 2
    let numNewRows = ap.reduce((acc, val) => {
      if (Math.min(...val) >= distThreshold) acc++;
      return acc;
    }, 0);
    let numNewCols = 0;
    for (let i = 0; i < ap[0].length; i++) {
      let row = ap.map(x => x[i]);
      if (Math.min(...row) >= distThreshold) numNewCols++;
    }
    for (let i = 0; i < numNewRows; i++) addRow(ap);
    for (let i = 0; i < numNewCols; i++) addCol(ap);

    // step 3
    while (ap.length > ap[0].length) {
      addRow(ap);
    }
    while (ap[0].length > ap.length) {
      addCol(ap);
    }

    // step 4
    let n = ap.length;
    let assignments = lap(n, ap);

    // step 5
    let numTracked = 0;
    for (let i = 0; i < ap.length; i++) {
      if (ap[i][assignments.col[i]] !== 0) numTracked++;
    }
    if (numTracked > 0) {
      let movement = assignments.cost / numTracked;
      document.dispatchEvent(new CustomEvent("prepare-motion-data", { detail: movement }));
    } else {
      // console.log('No motion detected');
    }
  } else {
    // console.log('No motion detected');
  }

  previousPoses = poses;
}
function poseDists(pose1, pose2) {
  let dists = [];
  for (let i = 0; i < pose1.keypoints.length - 4; i++) {
    let xt = (pose1.keypoints[i].position.x - pose2.keypoints[i].position.x) ** 2;
    let yt = (pose1.keypoints[i].position.y - pose2.keypoints[i].position.y) ** 2;
    let dist = Math.sqrt(xt + yt);
    let confidence = Math.min(pose1.keypoints[i].score, pose2.keypoints[i].score);
    // I think it makes sense to take the min confidence
    // if we are not confident about either one, how could we be any more 
    // confident about their distance?
    dists.push([dist, confidence]);
  }
  return dists;
}
function poseDist(dists) {
  let reduced = dists.reduce((acc, val) => {
    acc[0] += val[0] * val[1];
    acc[1] += val[1];
    return acc;
  }, [0, 0])
  return reduced[0] / reduced[1];
}
function addRow(arr, row) {
  if (!row) row = new Array(arr.length).fill(0);
  for (let i = 0; i < arr.length; i++) {
    arr[i].push(row[i]);
  }
  return arr;
}
function addCol(arr, col) {
  if (!col) col = new Array(arr[0].length).fill(0);
  arr.push(col);
  return arr;
}
let bounces = [3.1, 3.6, 4.03, 4.43, 4.76, 5.06, 5.36, 5.6, 5.8, 6.0, 6.16, 6.33, 6.46, 6.6, 6.7, 6.8, 6.86, 6.93, 7.0]
let bounceDurations = [];
for (let i = 1; i < bounces.length; i++) bounceDurations.push((bounces[i] - bounces[i - 1]) * 1000 - 20);
let numBounces = bounceDurations.length;
let averageDuration = bounceDurations.reduce((acc, val) => acc + val, 0) / numBounces;
alert("Press OK to accept audio")
document.addEventListener("DOMContentLoaded", () => {
  let video = document.querySelector('video');
  video.preservesPitch = true;

  let randomness = 20;

  let minBounce = 0;
  let maxBounce = numBounces;
  let order = generateNextFrames();

  let i = 0;
  video.currentTime = bounces[order[i]];

  let start = undefined;
  let reset = false;

  let evenness = 0;

  function step(timestamp) {
    if (start === undefined) {
      start = timestamp;
    }
    let elapsed = timestamp - start;

    if (elapsed * video.playbackRate >= bounceDurations[order[i]]) {
      start = undefined;
      i = (i + 1) % order.length;
      if (i === 0 || reset) {
        order = generateNextFrames();
        reset = false;
        i = 0;
      }
      video.currentTime = bounces[order[i]];

      // ----

      video.playbackRate = 1 + (((bounceDurations[order[i]] / averageDuration) - 1) * evenness);
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  function generateNextFrames() {
    let final = Array.from({ length: maxBounce - minBounce }, (_, i) => i + minBounce);
    final.sort(() => Math.random() - 0.5);
    let finalScore = final.reduce((acc, val) => {
      if (val + 1 === acc[1] || val - 1 === acc[1]) acc[0]++;
      acc[1] = val;
      return acc;
    }, [0, -2])[0];
    for (let j = 1; j < randomness; j++) {
      let permutation = Array.from({ length: maxBounce - minBounce }, (_, i) => i + minBounce);
      permutation.sort(() => Math.random() - 0.5);

      let score = permutation.reduce((acc, val) => {
        if (val + 1 === acc[1] || val - 1 === acc[1]) acc[0]++;
        acc[1] = val;
        return acc;
      }, [0, -2])[0];

      if (score > finalScore) {
        score = finalScore;
        final = permutation;
      }
    }
    console.log(final);
    return final;
  }

  let evennessSlider = document.querySelector('#evenness');
  evennessSlider.addEventListener('input', () => {
    evenness = evennessSlider.value;
  });

  let biasSlider = document.querySelector('#bias');
  biasSlider.addEventListener('input', () => {
    minBounce = 0;
    maxBounce = numBounces;
    let val = biasSlider.value;
    console.log(val);
    if (val > 0.5) {
      minBounce = Math.floor((parseFloat(val) - 0.5) * numBounces);
    } else if (val < 0.5) {
      maxBounce = Math.floor((parseFloat(val) + 0.5) * numBounces);
    }
    reset = true;
    console.log(minBounce, maxBounce)
  });

  let randomnessSlider = document.querySelector('#randomness');
  randomnessSlider.addEventListener('input', () => {
    randomness = 100 - parseInt(randomnessSlider.value);
    reset = true;
  });
});

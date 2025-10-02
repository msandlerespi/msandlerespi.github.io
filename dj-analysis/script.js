// audio definitions to pass - definitely a better way to do this 
let timeStep = 20000, windowSize = 1024, audioFile, audioCtx, audioModelNames;
const audioSampleRate = 16000;

// video definitions
let analysisVideoPlayer, videoModelNames;

let addQuantValue, addQualValue;

document.addEventListener("DOMContentLoaded", () => {
  // request definitions
  let requestPage = document.querySelector('.request');
  let submitButton = document.querySelector('.submit button');
  let uploader = document.getElementById('file-upload');
  let uploaderLabel = document.querySelector('[for="file-upload"]');
  let upload;

  // results definitions
  let resultsPage = document.querySelector('.results');
  let videoPlayer = document.querySelector('.results video');
  let overview = document.querySelector('.overview');
  let labels = [];
  let quantMetrics = [];
  let qualMetrics = [];
  let qualLabels = [];
  let tCtx = document.querySelector('#timepoints-graph');
  let lCtx = document.querySelector('#labels-graph');
  let tGraph, lGraph;
  let annotation = {
    type: 'line',
    borderWidth: 2,
    label: {
      display: true,
      content: 'Current Time',
      rotation: 90,
      position: 'start'
    },
    scaleID: 'x',
    value: 0
  }

  // analysis definitions
  analysisVideoPlayer = document.querySelector('#analysis-input');
  analysisVideoPlayer.playbackRate = 4; // so its at least a bit faster than realtime haha


  // graph functions
  function initializeGraphs() {
    tGraph = new Chart(tCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: quantMetrics.map(x => { return { label: x, data: [] } })
      },
      options: {
        animation: false,
        plugins: {
          annotation: {
            annotations: {
              annotation
            }
          }
        },
        onClick: clickHandler
      }
    });
    initializeQuantChart(tGraph);
    let tDownloadBtn = tCtx.nextElementSibling;
    console.log(tDownloadBtn);
    tDownloadBtn.addEventListener('click', () => {
      console.log('hi');
      let filename = "quantitative-data" + (tGraph.current ? ("-" + tGraph.current) : '') + ".csv";
      downloadCSV({
        filename: filename,
        chart: tGraph
      });
    });

    lGraph = new Chart(lCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: qualMetrics.map(x => { return { label: x, data: [] } })
      },
      options: {
        animation: false,
        scales: {
          y: {
            ticks: {
              callback: function (value, index, values) {
                if (qualLabels[value]) return qualLabels[value];
                return '';
              }
            }
          }
        },
        plugins: {
          annotation: {
            annotations: {
              annotation
            }
          }
        },
        onClick: clickHandler
      }
    });
    let lDownloadBtn = lCtx.nextElementSibling;
    lDownloadBtn.addEventListener('click', () => {
      downloadCSV({
        filename: 'qualitative-data.csv',
        chart: lGraph
      });
    });


    function clickHandler(e) {
      const canvasPosition = Chart.helpers.getRelativePosition(e, e.chart);
      const dataX = e.chart.scales.x.getValueForPixel(canvasPosition.x);
      timeUpdate(dataX, true);
    }

    videoPlayer.addEventListener('timeupdate', () => {
      let step = timeStep / 1000;
      timeUpdate(Math.floor(videoPlayer.currentTime / step), false);
    });

  }

  addQuantValue = (metric, value) => {
    // tGraph.data.datasets[quantMetrics.indexOf(metric)].ogData.push(value);
    // tGraph.update();
    tGraph.addValue(quantMetrics.indexOf(metric), value);
    tGraph.refresh();
  }
  addQualValue = (metric, value) => {
    if (!qualLabels.includes(value)) qualLabels.push(value);
    let index = qualLabels.indexOf(value)
    lGraph.data.datasets[qualMetrics.indexOf(metric)].data.push(index);
    lGraph.update();
  }
  Array.from(document.querySelectorAll('.quant-mods input')).forEach(input => {
    input.addEventListener('change', () => {
      let quantMod = Array.from(document.querySelectorAll('.quant-mods input:checked')).map(x => x.id).join('');
      quantMod = quantMod ? quantMod : 'og';
      tGraph.current = quantMod;
      tGraph.refresh();
    });
  })
  function updateGraphs() {
    tGraph.refresh();
    lGraph.update();
  }
  function timeUpdate(index, updateVideo) {
    annotation.value = index;
    updateGraphs();

    if (updateVideo) {
      videoPlayer.currentTime = index * (timeStep / 1000);
    }
  }

  // initialize audio context
  initAudioContext();

  // request event handlers
  uploader.addEventListener('input', (e) => {
    audioFile = uploader.files[0];
    upload = URL.createObjectURL(audioFile);
    uploaderLabel.innerHTML = 'Loaded ' + audioFile.name;
    submitButton.disabled = false;

    videoPlayer.src = upload;
    analysisVideoPlayer.src = upload;
  })

  submitButton.addEventListener('click', () => {
    let timestep = timeStep / 1000;
    let length = Math.floor(videoPlayer.duration / timestep) + 1;
    labels = Array.from({ length: length }, (_, i) => {
      let t = i * timestep;
      let m = Math.floor(t / 60);
      let s = t % 60;
      if (s < 10) s = '0' + s;
      return m + ':' + s;
    });
    quantMetrics = Array.from(document.querySelectorAll('#audio-metrics input.quant:checked, #video-metrics input.quant:checked')).map(x => x.id);
    qualMetrics = Array.from(document.querySelectorAll('#audio-metrics input.qual:checked, #video-metrics input.qual:checked')).map(x => x.id);

    initializeGraphs();

    requestPage.style.display = 'none';
    resultsPage.style.display = '';

    audioURL = upload;
    audioModelNames = Array.from(document.querySelectorAll('#audio-metrics input:checked')).map(x => x.id);

    videoModelNames = Array.from(document.querySelectorAll('#video-metrics input:checked')).map(x => x.id);
    analysisVideoPlayer.width = analysisVideoPlayer.getBoundingClientRect().width;
    analysisVideoPlayer.height = analysisVideoPlayer.getBoundingClientRect().height;

    document.dispatchEvent(new Event('analyze'));
  });

  document.addEventListener('analyzed-audio', () => {
    document.addEventListener('analyzed-video', analysisComplete);
  });
  document.addEventListener('analyzed-video', () => {
    document.addEventListener('analyzed-audio', analysisComplete);
  });
  function analysisComplete() {
    overview.classList.remove('loading');
    overview.innerHTML = '';
    tGraph.data.datasets.forEach((dataset) => {
      let sum = dataset.data.reduce((acc, val) => acc + val, 0);
      let avg = sum / dataset.data.length;
      overview.innerHTML += `<div>${dataset.label}: ${avg}</div>`;
    })
    lGraph.data.datasets.forEach((dataset) => {
      let label = qualLabels[mode(dataset.data)];
      overview.innerHTML += `<div>${dataset.label}: ${label}</div>`;
    })
    function mode(arr) {
      return arr.sort((a, b) =>
        arr.filter(v => v === a).length
        - arr.filter(v => v === b).length
      ).pop();
    }
  }
});


// init Web Audio API AudioContext
function initAudioContext() {
  try {
    unlockAudioContext();
  } catch (e) {
    throw 'Could not instantiate AudioContext: ' + e.message;
  }
}

// cross-browser fallback to initiate WebAudio API with user gesture if required
function unlockAudioContext() {
  if (typeof (audioCtx) === "undefined") {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state !== ("suspended")) return;
  const b = document.body;
  const events = ["touchstart", "touchend", "mousedown", "keydown"];
  events.forEach(e => b.addEventListener(e, unlock, false));
  function unlock() { audioCtx.resume().then(clean); }
  function clean() {
    events.forEach(e => b.removeEventListener(e, unlock));
  }
}

function addToMovingAverage(ogArr, outputArr, range) {
  if (ogArr.length >= range) {
    if (outputArr.length === 0) outputArr = new Array(Math.floor(range / 2)).fill(null);
    let sum = 0;
    for (let i = ogArr.length - range; i < ogArr.length; i++) {
      sum += ogArr[i];
    }
    outputArr.push(sum / range);
  }
  return outputArr;
}

function normalizeArr(arr) {
  let lastNullIndex = arr.lastIndexOf(null);
  let nulls = arr.slice(0, lastNullIndex + 1);
  let modArr = arr.slice(lastNullIndex + 1);
  let min = Math.min(...modArr);
  let zeroed = modArr.map(x => x - min)
  console.log(zeroed);
  let max = Math.max(...zeroed);
  if (max === 0) return zeroed;
  let output = nulls.concat(zeroed.map(x => x / max));
  return output;
}

function initializeQuantChart(chart) {
  chart.ogData = JSON.parse(JSON.stringify(chart.data));
  chart.avgData = JSON.parse(JSON.stringify(chart.data));
  chart.normData = JSON.parse(JSON.stringify(chart.data));
  chart.normavgData = JSON.parse(JSON.stringify(chart.data));
  chart.current = 'og';
  chart.addValue = (metricIndex, value) => {
    chart.ogData.datasets[metricIndex].data.push(value);
    chart.avgData.datasets[metricIndex].data = addToMovingAverage(chart.ogData.datasets[metricIndex].data, chart.avgData.datasets[metricIndex].data, 5);
    chart.normData.datasets[metricIndex].data = normalizeArr(chart.ogData.datasets[metricIndex].data);
    chart.normavgData.datasets[metricIndex].data = normalizeArr(chart.avgData.datasets[metricIndex].data);
  }
  chart.refresh = () => {
    chart.data = chart[chart.current + 'Data'];
    chart.update();
  }
}

function convertChartDataToCSV(args) {
  let result, columnDelimiter, lineDelimiter, labels, data;

  data = args.data.data || null;
  if (data == null || !data.length) {
    return null;
  }

  labels = args.labels || null;

  columnDelimiter = args.columnDelimiter || ',';
  lineDelimiter = args.lineDelimiter || '\n';

  if (labels !== null && labels.length) {
    result = '' + columnDelimiter;
    result += labels.join(columnDelimiter);
    result += lineDelimiter;
  }
  result += args.data.label.toString();

  for (let i = 0; i < data.length; i++) {
    result += columnDelimiter;
    let val = data[i];
    if (args.callback) val = args.callback(val);
    result += val;
  }
  result += lineDelimiter;

  return result;
}

function downloadCSV(args) {
  let data, filename, link;
  let csv = "";
  let chart = args.chart;
  let labels = chart.data.labels;
  let callback = (x) => x;
  if (chart.options && chart.options.scales && chart.options.scales.y && chart.options.scales.y.ticks && chart.options.scales.y.ticks.callback) {
    callback = chart.options.scales.y.ticks.callback
  }
  for (var i = 0; i < chart.data.datasets.length; i++) {
    csv += convertChartDataToCSV({
      data: chart.data.datasets[i],
      labels: labels,
      callback: callback
    });
    labels = null;
  }
  if (csv == null) return;
  console.log(csv);

  filename = args.filename || 'chart-data.csv';
  if (!csv.match(/^data:text\/csv/i)) {
    csv = 'data:text/csv;charset=utf-8,' + csv;
  }

  // not sure if anything below this comment works
  data = encodeURI(csv);
  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
}
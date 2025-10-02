
async function getAudioBufferFromURL(audioURL, webAudioCtx) {
  const response = await fetch(audioURL);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await webAudioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

async function getAudioBufferFromFile(audioFile, webAudioCtx) {
  const arrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = await webAudioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

function audioBufferToMonoSignal(buffer) {
  if (buffer.numberOfChannels === 1) {
    return buffer.getChannelData(0);
  }
  if (buffer.numberOfChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    return left.map((v, i) => (v + right[i]) / 2);
  }
  throw new Error('unexpected number of channels');
}

function downsampleAudioBuffer(sourceBuffer, targetRate) {
  // adapted from https://github.com/julesyoungberg/soundboy/blob/main/worker/loadSoundFile.ts#L25
  const ctx = new OfflineAudioContext(1, sourceBuffer.duration * targetRate, targetRate);
  // create mono input buffer
  const buffer = ctx.createBuffer(1, sourceBuffer.length, sourceBuffer.sampleRate);
  buffer.copyToChannel(audioBufferToMonoSignal(sourceBuffer), 0);
  // connect the buffer to the context
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  // resolve when the source buffer has been rendered to a downsampled buffer
  return new Promise((resolve) => {
    ctx.oncomplete = (e) => {
      const rendered = e.renderedBuffer;
      const samples = rendered.getChannelData(0);
      resolve(samples);
    };
    ctx.startRendering();
    source.start(0);
  });
}

function sliceAudioSignal(signal, begin, end, rate, callback) {
  begin = begin * rate / 1000;
  end = end * rate / 1000;

  let target = new Float32Array(end - begin);
  for (let i = 0; i < end - begin; i++) {
    target[i] = signal[begin + i];
  }
  callback(target);
}

function sliceAudioBuffer(buffer, begin, end, callback) {
  if (!(this instanceof sliceAudioBuffer)) {
    return new sliceAudioBuffer(buffer, begin, end, callback);
  }

  var error = null;

  var duration = buffer.duration;
  var channels = buffer.numberOfChannels;
  var rate = buffer.sampleRate;

  if (typeof end === 'function') {
    callback = end;
    end = duration;
  }

  // milliseconds to seconds
  begin = begin / 1000;
  end = end / 1000;

  if (begin < 0) {
    error = new RangeError('begin time must be greater than 0');
  }

  if (end > duration) {
    error = new RangeError('end time must be less than or equal to ' + duration);
  }

  if (typeof callback !== 'function') {
    error = new TypeError('callback must be a function');
  }

  var startOffset = rate * begin;
  var endOffset = rate * end;
  var frameCount = endOffset - startOffset;
  var newArrayBuffer;

  try {
    newArrayBuffer = audioCtx.createBuffer(channels, endOffset - startOffset, rate);
    var anotherArray = new Float32Array(frameCount);
    var offset = 0;

    for (var channel = 0; channel < channels; channel++) {
      buffer.copyFromChannel(anotherArray, channel, startOffset);
      newArrayBuffer.copyToChannel(anotherArray, channel, offset);
    }
  } catch (e) {
    error = e;
  }

  callback(error, newArrayBuffer);
}
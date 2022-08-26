const animatedElement = $('.building__animation__inner');
const imagePrefix = 'WEB_Tower_150frames_V2_';
const totalFrames = 120;
const frameInterval = 42;
var imagePath = '_content/home/JPEG_Sequence_150Frames_V2';
var svgs = Array.from($('.building__animation__svg'));

// bad spot for it but just getting it in there
Array.from(document.getElementsByClassName('cls-1')).forEach(elem => {
  elem.addEventListener('click', () => {
    alert(elem.id);
  })
})
Array.from(document.getElementsByClassName('cls-2')).forEach(elem => {
  elem.addEventListener('click', () => {
    alert(elem.id);
  })
})
Array.from(document.getElementsByClassName('cls-3')).forEach(elem => {
  elem.addEventListener('click', () => {
    alert(elem.id);
  })
})

// var mobileImagePath = '_content/home/JPEG_Sequence_150Frames_V2_Mobile';
var frameNumber = 0;
var destinationStep = 0;
var framesPerSection = 30;
var canPlayAnimation = true;
var loadingBarWidth = 0;
var minimumLoadTime = 3200;
var allImagesLoaded = false;
var canCloseLoadingWindow = false;

// Function to facilitate working with file names with triple digit ending numbers
function zeroPad(number) {
  return ('00' + number).slice(-3);
}

// if (window.matchMedia("(max-width: 640px)").matches) {
//   imagePath = mobileImagePath;
// }

for (var i = 1; i < totalFrames + 1; i++) {
  $('body').append(`<img class="preload-image" id="preload-image-${zeroPad(i)}" src="${imagePath}/${imagePrefix}${zeroPad(i)}.jpg" alt="Empire State Building Animation Frame ${i}" style="opacity: 0; height: 0;">`);
}

function animationInterval(ms, signal, callback) {
  const start = document.timeline.currentTime;

  function frame(time) {
    if (signal.aborted) return;
    callback(time);
    scheduleFrame(time);
  }

  function scheduleFrame(time) {
    const elapsed = time - start;
    const roundedElapsed = Math.round(elapsed / ms) * ms;
    const targetNext = start + roundedElapsed + ms;
    const delay = targetNext - performance.now();
    setTimeout(() => requestAnimationFrame(frame), delay);
  }

  scheduleFrame(start);
}

function playAnimation(destination, direction) {
  destinationStep = destination * framesPerSection;
  // console.log(destinationStep);
  // Use variable to lock animation during motion to avoid bugs
  if (canPlayAnimation) {
    canPlayAnimation = false;

    svgs.forEach(svg => {
      svg.style.display = '';
    })
    
    const controller = new AbortController();

    // Create an animation callback every second:
    animationInterval(frameInterval, controller.signal, time => {
      if(direction === "up") {
        frameNumber--;
      }
      else {
        frameNumber++;
      }
      if ( (frameNumber > totalFrames) || (frameNumber < 0) ) {
        frameNumber = 0;
      }
      animatedElement.attr('src', imagePath + `/${imagePrefix}${zeroPad(frameNumber)}.jpg`);
      // console.log(frameNumber);
      if (frameNumber == destinationStep) {
        controller.abort();
        canPlayAnimation = true;

        svgs.forEach(svg => {
          if(svg.id === "building__svg__" + frameNumber) {
            svg.style.display = 'block';
          }
        })
      }

    });

  }
}

window.addEventListener('sectionMove', function(e) {
  // console.log(e.detail.destination);
  // e.preventDefault();
  playAnimation(e.detail.destination, e.detail.direction);
});

function trackImageLoading() {
  var imageList = document.querySelectorAll('.preload-image');
  var imagesLoaded = 0;
  var percentage = 100 / imageList.length;
  // console.log(percentage);
  imageList.forEach(function(image) {
    image.addEventListener('load', function() {
      loadingBarWidth += percentage;
      // console.log(loadingBarWidth);
      $('.loading .bar .fill').css('width', (loadingBarWidth + "%"));

      if (Math.round(loadingBarWidth) >= 100) {
        allImagesLoaded = true;
      }
    });
  });

  setTimeout(function() {
    if (loadingBarWidth < 1) {
      // console.log('Starting placeholder load');
      $('.loading .bar .fill').addClass('pseudo-load');
    }
  }, 3000);
}

$(document).ready(function() {

  trackImageLoading();

  // $('.loading .bar .fill').addClass('pseudo-load');

  setTimeout(function() {

    var checkLoadInterval = setInterval(function (){
      // console.log('checking');
      if (allImagesLoaded) {
        clearInterval(checkLoadInterval);
        // Create custom event for when building finishes loading
        const buildingLoadCompleteEvent = new Event('buildingLoadComplete');
        // Fire custom event
        window.dispatchEvent(buildingLoadCompleteEvent);

        $('.loading').addClass('load-complete');
        $('body').removeClass('preload');
      }
    }, 50);

  }, minimumLoadTime);

  // Fallback removal of load screen after 10 seconds if all else fails
  setTimeout(function() {

    // Create custom event for when building finishes loading
    const buildingLoadCompleteEvent = new Event('buildingLoadComplete');
    // Fire custom event
    window.dispatchEvent(buildingLoadCompleteEvent);

    $('.loading').addClass('load-complete');
    $('body').removeClass('preload');

  }, 10000);

});

$(window).on('load', function() {

});

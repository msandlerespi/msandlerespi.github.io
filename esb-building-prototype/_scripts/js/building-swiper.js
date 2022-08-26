var previousSwiperIndex = 0;
var movementDirection = "down";
var canMoveSections = true;

// Set canMoveSections false when any animation begins
window.addEventListener('cameraMovementNotComplete', function () {
  console.log('Animation starting, preventing movement');
  canMoveSections = false;
});

// Wait for any camera animations to finish, then allow section scrolling once more
window.addEventListener('cameraMovementComplete', function () {
  console.log('Animation ending, allowing movement');
  canMoveSections = true;
});

var mySwiper = new Swiper ('.swiper-container', {
  // Optional parameters
  effect: 'fade',
  fadeEffect: {
    crossFade: true
  },
  slidesPerView: 1,
  centeredSlides: true,
  spaceBetween: 60,
  loop: false,
  speed: 1000,
  allowTouchMove: false,
  initialSlide: 0,
  autoHeight: true,

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  on: {
    activeIndexChange: function() {
      // If animations aren't complete, prevent section movement
      if (!canMoveSections) {
        return false;
      }

      if (mySwiper.activeIndex > previousSwiperIndex) {
        movementDirection = "down";
      }
      else {
        movementDirection = "up";
      }
      
      function triggerMove(destination, direction) {
        // console.log('onLeave triggered, going to ' + destination.index);
        // Create custom event for moving sections
        const sectionMoveEvent = new CustomEvent('sectionMove', { detail: { destination: mySwiper.activeIndex, direction: direction } });
        // Fire custom event
        window.dispatchEvent(sectionMoveEvent);
      }

      triggerMove(mySwiper.activeIndex, movementDirection);
      previousSwiperIndex = mySwiper.activeIndex;
    },
  },
});
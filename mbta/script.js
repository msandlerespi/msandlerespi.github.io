import { CountUp } from './countup.min.js';
import { Odometer } from './odometer.min.js';
document.addEventListener("DOMContentLoaded", () => {
  // zoomable map functionality
  const zoomist = new Zoomist('.zoomist-container', {
    maxScale: 4,
    bounds: true,
    zoomer: true
  });

  // check functionality
  let clickables = Array.from(document.querySelectorAll('.clickable .stops circle'));
  clickables.forEach(element => {
    element.addEventListener('click', () => {
      element.classList.toggle('checked');
    });
  });

  // calculate functionality
  let calculate = document.querySelector('.calculate');
  calculate.addEventListener('click', () => {
    moveTrains();
    saveSelection();
  });

  function moveTrains() {
    moveTrain('total');
    moveTrain('red');
    moveTrain('orange');
    moveTrain('green');
    moveTrain('blue');
    moveTrain('silver');
  }
  function moveTrain(color) {
    let elem = document.querySelector(`.stats-${color} .progress-bar span`);
    if (color === 'total') color = false;
    let visited = document.querySelectorAll(`.clickable .stops circle${color ? '.' + color : ''}.checked`).length;
    let total = document.querySelectorAll(`.clickable .stops circle${color ? '.' + color : ''}`).length;
    let percent = 100 * (visited / total);
    let currentPercent = elem.style.width ? parseFloat(elem.style.width) : 0;
    let duration = Math.min(Math.max((Math.abs(currentPercent - percent) / 10), 1), 5);

    elem.style.transitionDuration = duration + 's';
    elem.style.width = percent + '%';

    let counter = elem.parentNode.nextElementSibling.querySelector('span');
    let currentCount = counter.dataset.count ? counter.dataset.count : 0;
    counter.dataset.count = visited;
    let countUp = new CountUp(counter, visited, { startVal: currentCount, duration: duration, plugin: new Odometer({ duration: duration }) });
    countUp.start();
    if (!color) {
      let percentElem = document.querySelector('.percent span');
      let percentCountUp = new CountUp(percentElem, percent, { startVal: parseFloat(percentElem.innerHTML), decimalPlaces: 2, duration: duration + 1 });
      percentCountUp.start();
    }
  }

  // storing cookies of user selection
  function saveSelection() {
    let indices = [];
    clickables.forEach((element, index) => {
      if (element.classList.contains('checked')) {
        indices.push(index);
      }
    });

    let date = new Date();
    date.setFullYear(date.getFullYear() + 1);

    document.cookie = `indices=${indices.join(',')};expires=${date.toUTCString()} `;
  }
  function retrieveSelection() {
    let name = "indices=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        let indices = c.substring(name.length, c.length);
        indices = indices.split(',');
        indices.forEach(index => {
          clickables[index].classList.add('checked');
        })
      }
    }
  }
  retrieveSelection();
  setTimeout(() => { moveTrains() }, 700);
});

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}
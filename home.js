let drags = ['programmer', 'designer', 'game dev', 'hobbyist', 'musician'];
document.addEventListener('DOMContentLoaded', () => {

    drags.forEach(drag => {
        let elem = document.createElement('div');
        let wrapper = document.getElementById('wrapper');
        elem.innerHTML = drag;
        elem.classList = 'drag';
        let top = Math.random() > .5 ? Math.floor(Math.random() * (wrapper.offsetHeight / 2 - 150)) : Math.floor(Math.random() * (wrapper.offsetHeight / 2 - 150)) + (wrapper.offsetHeight / 2 + 50);
        elem.style.top = top + 'px';
        elem.style.left = Math.floor(Math.random() * (wrapper.offsetWidth - 400)) + 200 + 'px';
        wrapper.append(elem);
        dragElement(elem);
    });
});

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    let drop = document.getElementById('drop');
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
        drop.style.backgroundColor = '#eee';
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
        if (mouseOver(e, drop)) {
            drop.style.width = elmnt.offsetWidth + 'px';
        }
    }

    function closeDragElement(e) {
        // stop moving when mouse button is released:
        e = e || window.event;
        document.onmouseup = null;
        document.onmousemove = null;
        if (mouseOver(e, drop)) {
            drop.classList = 'dropped';
            drop.innerHTML = elmnt.innerHTML;
            elmnt.style.display = 'none';
            document.body.style.opacity = '0%';
            setTimeout(() => { window.location = `projects/${elmnt.innerHTML}.html`; }, 500);
        } else {
            drop.style.backgroundColor = "transparent";
        }
    }

    function mouseOver(e, elem) {
        let bb = elem.getBoundingClientRect();
        return (e.clientX > bb.left && e.clientX < bb.left + bb.width && e.clientY > bb.top && e.clientY < bb.top + bb.height);
    }
}
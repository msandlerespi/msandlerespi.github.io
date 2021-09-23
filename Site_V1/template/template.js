document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.style.opacity = '100%';
        resetBG();
    }, 1);
});

function resetBG() {
    let bg = document.getElementById('background');
    bg.height = '10px';
    let h = document.body.scrollHeight;
    if (h > window.innerHeight) h += 10;
    else h = window.innerHeight;
    bg.style.height = h + 'px';
}
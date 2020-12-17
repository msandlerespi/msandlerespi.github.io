document.addEventListener('DOMContentLoaded', () => {
    let imageGrid = document.getElementById('image-grid');
    for (let i = 1; i <= 2; ++i) {
        let newImage = document.createElement('img');
        newImage.src = `designImages/DI${i}.png`;
        newImage.style.width = '48%';
        imageGrid.append(newImage);
        newImage.style.margin = '1%';
    }
});
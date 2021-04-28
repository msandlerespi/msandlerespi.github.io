document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("open").onclick = () => {
        document.getElementById("box").classList = "opened";
        setTimeout(() => { 
            let video = document.getElementById("video");
            video.classList = "opened";
            video.width = window.innerWidth/1.5;
            video.height = window.innerHeight/1.6;
            document.getElementById("exit").classList += " opened";
        }, 1000);
        setTimeout(() => { document.getElementById("video").src += "?autoplay=1"; }, 1300);
    }
    document.getElementById("exit").onclick = () => {
        let video = document.getElementById("video");
        video.width = 0;
        video.height = 0;
        video.src = "https://www.youtube.com/embed/tgbNymZ7vqY";
        video.classList = "";
        document.getElementById("exit").classList = "fas fa-times";
        setTimeout(() => { document.getElementById("box").classList = ""; }, 300);
        
        
    }
});
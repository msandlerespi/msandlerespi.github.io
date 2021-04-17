document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("open").onclick = () => {
        document.getElementById("box").classList = "opened";
        setTimeout(() => { 
            document.getElementById("video").classList = "opened";
            document.getElementById("exit").classList += " opened";
        }, 1000);
        setTimeout(() => { document.getElementById("video").src += "?autoplay=1"; }, 1300);
    }
    document.getElementById("exit").onclick = () => {
        document.getElementById("video").src = "https://www.youtube.com/embed/tgbNymZ7vqY";
        document.getElementById("video").classList = "";
        document.getElementById("exit").classList = "fas fa-times";
        setTimeout(() => { document.getElementById("box").classList = ""; }, 300);
        
        
    }
});
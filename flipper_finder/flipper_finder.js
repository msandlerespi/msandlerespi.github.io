
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("go").onclick = () => {
        let zipcode = document.getElementById("zipcode").value;
        fetch(`https://realtor.p.rapidapi.com/properties/v2/list-sold?offset=0&limit=500&postal_code=${zipcode}&prop_type=single_family%2C%20multi_family&sort=sold_date`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-key": "74418fdb18mshf567414d0f20e5ep18b44fjsnbd0d0e8e60e0",
                "x-rapidapi-host": "realtor.p.rapidapi.com"
            }
        })
        .then(response => response.json())
        .then(result => {
            let flippers = [];
            let year = parseInt(new Date().getFullYear());
            let max = 1;
            function search(i) {
                if(i >= max || i >= result.properties.length) {
                    finished();
                } else {
                    let property = result.properties[i];
                    if(Math.abs(year - property.year_built) > 2 && parseInt(property.price) >= 100000) {
                        fetch(`https://realtor.p.rapidapi.com/properties/v2/detail?property_id=${property.property_id}`, {
                            "method": "GET",
                            "headers": {
                                "x-rapidapi-key": "74418fdb18mshf567414d0f20e5ep18b44fjsnbd0d0e8e60e0",
                                "x-rapidapi-host": "realtor.p.rapidapi.com"
                            }
                        })
                        .then(response => response.json())
                        .then(result => {
                            let propDetails = result.properties[0];
                            let history = propDetails.property_history;
                            console.log(history);
                            let recentSale = history[0];
                            for(let j = 1; j < history.length; ++j) {
                                let sale = history[j];
                                if(sale.event_name === "Sold") {
                                    console.log('check');
                                    if(parseInt(recentSale.date.substring(0, 4)) - parseInt(sale.date.substring(0, 4)) <= 4 && recentSale.price - sale.price > 100000 ) {
                                        console.log("flip added!");
                                        console.log(property.agents[0].photo);
                                        flippers.push({website: property.rdc_web_url, seller: property.agents[0].name, sellerImage: property.agents[0].photo.href});
                                    }
                                    break;
                                }
                            }
                            search(i + 1);
                        })
                        .catch(err => {
                            console.error(err);
                            search(i + 1);
                        });    
                    } else {
                        ++max;
                        search(i + 1);
                    }
                }
            }
            function finished() {
                console.log("done!");
                console.log(flippers);
                document.getElementById("search").style.display = "none";
                let results = document.getElementById("results");
                results.style.display = "block";
                flippers.forEach(flipper => {
                    let flipperPage = document.createElement("div");
                    flipperPage.classList = "flipper-page";
                    let link = document.createElement("a");
                    link.classList = "flipper-link";
                    link.innerHTML = "Property sold";
                    link.href = flipper.website;
                    let seller = document.createElement("h1");
                    seller.classList = "flipper-name";
                    seller.innerHTML = flipper.seller;
                    if(flipper.sellerImage) {
                        let image = document.createElement("img");
                        image.classList = "flipper-image";
                        image.src = flipper.sellerImage;
                        image.width = "100";
                        image.height = "100";
                        flipperPage.append(image);
                    }
                    let desc = document.createElement("div");
                    desc.classList = "flipper-desc";
                    desc.append(seller);
                    desc.append(link);
                    flipperPage.append(desc);
                    results.append(flipperPage);
                });
            }
            search(0);
            // result.properties.forEach(property => {
            //     fetch(`https://realtor.p.rapidapi.com/properties/v2/detail?property_id=${property.property_id}`, {
            //         "method": "GET",
            //         "headers": {
            //             "x-rapidapi-key": "74418fdb18mshf567414d0f20e5ep18b44fjsnbd0d0e8e60e0",
            //             "x-rapidapi-host": "realtor.p.rapidapi.com"
            //         }
            //     })
            //     .then(response => response.json())
            //     .then(result => {
            //         console.log(result.property_history)
            //     })
            //     .catch(err => {
            //         console.error(err);
            //     });
            // });
        })
        .catch(err => {
            console.error(err);
        });
    }
});

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
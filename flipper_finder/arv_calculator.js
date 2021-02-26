document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("go").onclick = () => {
        console.log('hi!');
        let address = document.getElementById("street-address").value;
        let street = address.substring(address.indexOf(" "));
        let city = document.getElementById("city").value;
        let state = document.getElementById("state").value;
        console.log('hi!');
        fetch(`https://realtor.p.rapidapi.com/properties/v2/list-sold?city=${city}&offset=0&state_code=${state}&limit=200&prop_type=single_family%2C%20multi_family&sort=sold_date`, 
        {
            "method": "GET",
            "headers": {
                "x-rapidapi-key": "74418fdb18mshf567414d0f20e5ep18b44fjsnbd0d0e8e60e0",
                "x-rapidapi-host": "realtor.p.rapidapi.com"
            }
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            let j = 1;
            // for(let i = 0; i < j; ++i) {
            //     let property = result.properties[i];
            //     fetch(`https://realtor.p.rapidapi.com/properties/v2/detail?property_id=${property.property_id}`, {
            //         "method": "GET",
            //         "headers": {
            //             "x-rapidapi-key": "74418fdb18mshf567414d0f20e5ep18b44fjsnbd0d0e8e60e0",
            //             "x-rapidapi-host": "realtor.p.rapidapi.com"
            //         }
            //     })
            //     .then(response => response.json())
            //     .then(result => {
            //         console.log(result);
            //     })
            //     .catch(err => {
            //         console.error(err);
            //     });
            // }
        })
        .catch(err => {
            console.error(err);
        });

    }
});

/*
future ideas (in order of most to least doable): 
- flipper finder using sold_history
- ml rehab calculator
- flip finder using craigslist api?
*/
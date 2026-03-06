import { UPSRatingService } from "./courier/ups/rating-service.js";
import type { RateRequest } from "./courier/common/types.js";

async function gettingCredentials() {
    console.log("getting your credentials from env...");

    const upsManager = new UPSRatingService();

    const customerOrder : RateRequest = {
        origin : {
            streetLines : ['23 3rd Bleeker Street'],
            city : 'New York',
            state : 'NY',
            postalCode : '10001',
            countryCode : 'US'
        },

        destination : {
            streetLines : ['nalapani delhi road'],
            city : 'New Delhi',
            state : 'DL',
            postalCode : '110015',
            countryCode : 'IN'
        },

        packages : [
            {
                weight : 5,
                weightUnit : 'LBS',
                length : 10,
                width : 10,
                height : 6,
                dimensionsUnit : 'IN'
            },
        ],
    };

    try {
        console.log("fetching rates from UPS...");

        const quota = await upsManager.getRates(customerOrder);

        console.log('\n Successfully fetched rates from UPS!');

        quota.forEach(rate => {
            console.log(`${rate.serviceName} : $${rate.totalPrice} ${rate.currency}`)
        });
        } catch (error : any) {
        console.error("Error fetching rates from UPS:", error);
        console.error(`Status Code: ${error.statusCode}`);
        console.error(`Message : ${error.message}`);
    }
}

gettingCredentials();
export const mockOAuthSuccess = {
    access_token : 'fake_anurag',
    expires_in : '14400'
};

export const mockRateSuccess = {
    RateResponse : {
        RatedShipment : [
            {
                Service : {
                    Code : '03',
                    Description : 'UPS Ground'
                },

                TotalCharges : {
                    CurrencyCode : 'USD',
                    MonetaryValue : '12.50'
                },
            },
            {
                Service : {
                    Code : '01',
                    Description : 'UPS Next Day Air',
                },

                TotalCharges : {
                    CurrencyCode : 'USD',
                    MonetaryValue : '50.00'
                }
            }
        ]
    }
}

export const mockRateError400 = {
    response : {
        errors : [
            {
                code: '110002',
                message : 'Invalid ShipTo Address',
            }
        ]
    }
}

export const mockRateError401 = {
    response : {
        errors : [
            {
                code : '250004',
                message : 'Invalid Authentication',
            },
        ],
    },
};

export const mockRateError429  = {
    response : {
        errors : [
            {
                code : '999999',
                message: 'Quota Limit Exceeded'
            }
        ]
    }
}
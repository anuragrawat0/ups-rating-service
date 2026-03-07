import axios from 'axios';
import { UPSRatingService } from '../../courier/ups/rating-service.js';
import { mockOAuthSuccess, mockRateError401, mockRateSuccess } from '../response/ups-response.js';
import type { RateRequest } from '../../courier/common/types.js';


jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UPS Rating Service Integration Tests', ()=> {
    let service : UPSRatingService;

    beforeEach(()=> {
        jest.clearAllMocks();
        service = new UPSRatingService();
    });

    const validOrder : RateRequest = {
    origin: { streetLines: ['123 Main St'], city: 'NY', state: 'NY', postalCode: '10001', countryCode: 'US' },
    destination: { streetLines: ['456 Market St'], city: 'LA', state: 'CA', postalCode: '90001', countryCode: 'US' },
    packages: [
      { weight: 5, weightUnit: 'LBS', length: 10, width: 10, height: 10, dimensionsUnit: 'IN' }
    ]
  } 

  it('should succesfully get a shipping rate', async()=> {
    mockedAxios.post        
        .mockResolvedValueOnce({ data: mockOAuthSuccess })
        .mockResolvedValueOnce({ data: mockRateSuccess });

    const quota = await service.getRates(validOrder);

    expect(quota.length).toBe(2);
    expect(quota[0]?.serviceName).toBe('UPS Service 03');
    expect(quota[0]?.totalPrice).toBe(12.50);
  });

  it('should build the correct request payload for UPS', async()=> {
     mockedAxios.post
        .mockResolvedValueOnce({ data: mockOAuthSuccess })
        .mockResolvedValueOnce({ data: mockRateSuccess });

    await service.getRates(validOrder);

    const ratingCall = mockedAxios.post.mock.calls[1]!;
    const headers = ratingCall[2]?.headers;
    const body = ratingCall[1] as any;

    expect(headers?.Authorization).toBe(`Bearer ${
        mockOAuthSuccess.access_token}`);

    expect(body.RateRequest.Shipment.ShipTo.PostalCode).toBe('90001');
  });

  it('should reuse the cached token for subsequent requests', async()=> {
    mockedAxios.post
        .mockResolvedValueOnce({ data: mockOAuthSuccess })
        .mockResolvedValueOnce({ data: mockRateSuccess })
        .mockResolvedValueOnce({ data: mockRateSuccess });

    await service.getRates(validOrder);
    await service.getRates(validOrder);

    const tokenClls = mockedAxios.post.mock.calls.filter(call => call[0].includes('oauth'));

    expect(tokenClls.length).toBe(1);

  });

  it('should throw a clean error if the UPS password is wrong', async()=> {
    mockedAxios.post.mockRejectedValue({
        response : {
            status : 401,
            data : mockRateError401,
        }
    });


    await expect(service.getRates(validOrder)).rejects.toMatchObject({
        statusCode: 401,
        message: 'UPS rate request failed'
    });
  });

  it('should catch missing data before even asking UPS', async ()=>{
    const badOrder = {
        origin : { city : 'KC'}
    } as any;

    await expect(service.getRates(badOrder)).rejects.toMatchObject({
        statusCode: 400
    });
  })

  it('should hanle UPS server errors succesfully', async()=>{
    mockedAxios.post
        .mockResolvedValueOnce({ data: mockOAuthSuccess })
        .mockRejectedValueOnce({
            response : {
                status : 500,
                data : 'Internal Server Error'
            }
        });
    await expect(service.getRates(validOrder)).rejects.toMatchObject({
        statusCode: 500
    });
});
   
  it('should safely abort if the network connection drops', async() => {
    mockedAxios.post
        .mockResolvedValueOnce({ data: mockOAuthSuccess })
        .mockRejectedValueOnce({ code: 'ECONNABORTED' });

    await expect(service.getRates(validOrder)).rejects.toMatchObject({
        statusCode : 408
        });
    })
})
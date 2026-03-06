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
})
import type { Courier } from '../common/interface.js'
import { type RateRequest, type RateQuota, RateRequestSchema } from '../common/types.js'
import { CarrierError } from '../../errors/error.js'
import { UPSClient } from './http-client.js'
import { UPSMapper } from './converter.js'
import { appConfig } from '../../config/env.js'

export class UPSRatingService implements Courier {
    public name = 'UPS';
    private client : UPSClient;

    constructor() {
        this.client = new UPSClient();
    }
    async getRates(request: RateRequest): Promise<RateQuota[]> {

      try {
        RateRequestSchema.parse(request);
      }catch(zodError:any){
        throw new CarrierError(zodError.message, 400, zodError.errors);
      }

      const upsPayload = UPSMapper.mapRateRequest(
        request,
        appConfig.UPS_ACCOUNT_NUMBER || '123456'
      );

      const upsResponse = await this.client.getRates(upsPayload);

      const cleanQuotas = UPSMapper.mapRateResponse(upsResponse);
      
      return cleanQuotas;
    }
}
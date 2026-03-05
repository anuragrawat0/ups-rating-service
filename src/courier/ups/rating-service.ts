import { ZodError } from 'zod'
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
      }catch(error : unknown){
        if (error instanceof ZodError){
            throw new CarrierError(error.message, 400, error.issues);
        }
        throw error;
      }

     if (!appConfig.UPS_ACCOUNT_NUMBER){
        throw new CarrierError('UPS_ACCOUNT_NUMBER is not configured', 500);
     }
      const upsPayload = UPSMapper.mapRateRequest(request, appConfig.UPS_ACCOUNT_NUMBER);

      try {
        const upsResponse = await this.client.getRates(upsPayload);
        return UPSMapper.mapRateResponse(upsResponse);
      } catch (error: any) {
        const statusCode = error?.statusCode ?? error?.response?.status ?? 502;
        const details = error?.response?.data ?? error?.message;
        throw new CarrierError('UPS rate request failed', statusCode, details);
      }

    }
}
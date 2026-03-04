import axios from 'axios';
import { OAuthClient } from '../../auth/oauth-client.js';
import { appConfig } from '../../config/env.js';
import { CarrierError } from '../../errors/error.js'; 
import type { UPSRateRequest, UPSRateResponse } from './types.js';

export class UPSClient {
    private oauth : OAuthClient;

    constructor(){
        const securityUrl = appConfig.UPS_BASE_URL.replace('/api', '') 
        + '/security/v1/oauth/token';

        this.oauth = new OAuthClient(
            appConfig.UPS_CLIENT_ID,
            appConfig.UPS_CLIENT_SECRET,
            securityUrl,
            appConfig.UPS_ACCOUNT_NUMBER
        );
    }

    async getRates(payload : UPSRateRequest) : Promise<UPSRateResponse> {

        const token = await this.oauth.getAccessToken();

        const url = `${appConfig.UPS_BASE_URL}/rating/${appConfig.UPS_API_VERSION}/Shop`

        try {
            const response = await axios.post<UPSRateResponse>(
                url,
                payload,
                {
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'transId': 'cybership-req-123',       // Required by UPS docs
                        'transactionSrc': 'cybership-testing'
                    },
                    timeout: appConfig.HTTP_TIMEOUT
                }
            );
            return response.data;
        } catch (error : any) {
            const status = error.response?.status || 500;

            const upErrorMessage = error.response?.data?.response?.errors?.[0]?.message || error.message;

            if (error.code === 'ECONNABORTED') {

                throw new CarrierError('Request timed out', 408);
        }
        throw new CarrierError(upErrorMessage, status, error.response?.data);
    }
  }
}
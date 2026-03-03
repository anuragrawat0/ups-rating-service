import axios from 'axios';
import { CarrierError } from '../errors/error.js';

export class OAuthClient {
  private cachedToken: string | null = null;
  private expiresAt: number = 0;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private tokenUrl: string,
    private merchantId?: string
  ) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    if (this.cachedToken && this.expiresAt > now + 60000) {
      return this.cachedToken;
    }

    return this.fetchNewToken();
  }

  private async fetchNewToken(): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (this.merchantId) {
      headers['x-merchant-id'] = this.merchantId;
    }
    try {
      const response = await axios.post(
        this.tokenUrl,
        'grant_type=client_credentials',
        { 
          headers,
          auth: {
            username: this.clientId,
            password: this.clientSecret
          }
        }
      );

      this.cachedToken = response.data.access_token;
      
      const lifespanInSeconds = Number(response.data.expires_in);
      this.expiresAt = Date.now() + (lifespanInSeconds * 1000);

      return this.cachedToken!;
    } catch (error: any) {
      const status = error.response?.status || 401;
      throw new CarrierError('Failed to authenticate with UPS', status, error.message);
    }
  }
}
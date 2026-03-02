export class CarrierError extends Error {
  public type: string;
  public isRetryable: boolean;

  constructor(
    message: string, 
    public statusCode: number = 500, 
    public details?: any 
  ) {
    super(message);
    this.name = 'CarrierError';

    if (statusCode === 401 || statusCode === 403) {
      this.type = 'AUTH';
      this.isRetryable = false;
    } else if (statusCode === 400) {
      this.type = 'VALIDATION';
      this.isRetryable = false;
    } else if (statusCode === 429) {
      this.type = 'RATE_LIMIT';
      this.isRetryable = true;
    } else if (statusCode >= 500) {
      this.type = 'SERVER_ERROR';
      this.isRetryable = true;
    } else {
      this.type = 'NETWORK_OR_UNKNOWN';
      this.isRetryable = false; 
    }
  }
}
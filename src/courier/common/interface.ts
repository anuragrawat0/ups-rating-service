import type { RateRequest, RateQuota } from "./types.js";

export interface Courier { 
    name : string;
    getRates(request: RateRequest): Promise<RateQuota[]>;
}

export interface CourierService extends Courier {
    purchaseLabel(request : RateRequest, selectedRate: RateQuota) : Promise<String>;
}
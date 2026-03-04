export interface UPSRateRequest {
  RateRequest: {
    Request: {
      TransactionReference: {
        CustomerContext: string;
      };
    };
    Shipment: {
      Shipper: UPSShipper;
      ShipTo: UPSAddress;
      ShipFrom: UPSAddress;
      PaymentDetails: UPSPaymentDetails;
      Service: UPSService;
      NumOfPieces: string;
      Package: UPSPackage | UPSPackage[]; 
    };
  };
}

export interface UPSShipper {
  Name: string;
  ShipperNumber: string; 
  Address: UPSAddress;
}

export interface UPSAddress {
  AddressLine: string[]; // UPS expects an array of strings for the street
  City: string;
  StateProvinceCode: string;
  PostalCode: string;
  CountryCode: string;
}

export interface UPSPaymentDetails {
  ShipmentCharge: Array<{
    Type: string; // Usually '01' for Transportation
    BillShipper: { AccountNumber: string };
  }>;
}

export interface UPSService {
  Code: string; // e.g., '03' for Ground
  Description?: string;
}

export interface UPSPackage {
  PackagingType: {
    Code: string; 
    Description?: string;
  };
  Dimensions: {
    UnitOfMeasurement: { Code: string };
    Length: string;
    Width: string;
    Height: string;
  };
  PackageWeight: {
    UnitOfMeasurement: { Code: string }; // 'LBS' or 'KGS'
    Weight: string;
  };
}


export interface UPSRateResponse {
  RateResponse: {
    RatedShipment: UPSRatedShipment | UPSRatedShipment[];
  };
}

export interface UPSRatedShipment {
  Service: {
    Code: string;
    Description?: string;
  };
  TotalCharges?: {
    CurrencyCode: string;
    MonetaryValue: string;
  };
  RatedShipmentDetails?: Array<{
    TotalCharges: {
      CurrencyCode: string;
      MonetaryValue: string;
    }
  }>;
}
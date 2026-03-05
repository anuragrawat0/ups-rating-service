import type { RateRequest, RateQuota, Address, Package } from '../common/types.js';
import type { UPSRateRequest, UPSAddress, UPSPackage, UPSRateResponse, UPSRatedShipment } from './types.js';

export class UPSMapper {
  
  // 1. Translate the Address
  static mapAddress(address: Address): UPSAddress {
    return {
      AddressLine: address.streetLines,
      City: address.city,
      StateProvinceCode: address.state,
      PostalCode: address.postalCode,
      CountryCode: address.countryCode,
    };
  }

  // 2. Translate the Package
  static mapPackage(pkg: Package): UPSPackage {
    return {
      PackagingType: { Code: '02' }, 
      Dimensions: {
        UnitOfMeasurement: { Code: pkg.dimensionsUnit },
        Length: pkg.length.toString(),
        Width: pkg.width.toString(),
        Height: pkg.height.toString(),
      },
      PackageWeight: {
        UnitOfMeasurement: { Code: pkg.weightUnit },
        Weight: pkg.weight.toString(),
      },
    };
  }

  // 3. Build the final UPS Outbound Payload
  static mapRateRequest(request: RateRequest, accountNumber: string): UPSRateRequest {
    return {
      RateRequest: {
        Request: {
          TransactionReference: { CustomerContext: 'cybership-req' }
        },
        Shipment: {
          Shipper: {
            Name: 'Cybership User',
            ShipperNumber: accountNumber,
            Address: this.mapAddress(request.origin),
          },
          ShipTo: this.mapAddress(request.destination),
          ShipFrom: this.mapAddress(request.origin), 
          PaymentDetails: {
            ShipmentCharge: [{
              Type: '01', 
              BillShipper: { AccountNumber: accountNumber }
            }]
          },
          Service: {
            Code: request.serviceLevel || '03', 
          },
          NumOfPieces: request.packages.length.toString(),
          Package: request.packages.map(p => this.mapPackage(p)),
        }
      }
    };
  }

  static mapRateResponse(response: UPSRateResponse): RateQuota[] {
    const shipments = response.RateResponse.RatedShipment;
    
    // ups sometimes returns one object sometimes an array we force it to be an array
    const shipmentArray = Array.isArray(shipments) ? shipments : [shipments];

    return shipmentArray.map((shipment: UPSRatedShipment) => {
      const charges = shipment.TotalCharges || shipment.RatedShipmentDetails?.[0]?.TotalCharges;
      
      return {
        carrier: 'UPS',
        serviceName: `UPS Service ${shipment.Service.Code}`,
        totalPrice: parseFloat(charges?.MonetaryValue || '0'),
        currency: charges?.CurrencyCode || 'USD',
      };
    });
  }
}
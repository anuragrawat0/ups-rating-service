import {z} from "zod";

export const AddressSchema = z.object({
    streetLines : z.array(z.string()),
    city : z.string(),
    state : z.string(),
    postalCode : z.string(),
    countryCode : z.string().length(2),
})

export const PackageSchema = z.object({
  weight: z.number().positive(),
  weightUnit: z.enum(['LBS', 'KGS']),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  dimensionsUnit: z.enum(['IN', 'CM']),
});

export const RateRequestSchema = z.object({
  origin: AddressSchema,
  destination: AddressSchema,
  packages: z.array(PackageSchema).min(1),
  serviceLevel: z.string().optional(),
});

export const RateQuotaSchema = z.object({
    carrier : z.string(),
    serviceName : z.string(),
    totalPrice : z.number(),
    currency : z.string()
})

export type Address = z.infer<typeof AddressSchema>;
export type Package = z.infer<typeof PackageSchema>;
export type RateRequest = z.infer<typeof RateRequestSchema>;
export type RateQuota = z.infer<typeof RateQuotaSchema>;

import { config } from "dotenv";
import { z } from "zod";

config(); 

const envSchema = z.object({
   UPS_CLIENT_ID : z.string().min(1, "UPS_CLIENT_ID is required"),
   UPS_CLIENT_SECRET : z.string().min(1, "UPS_CLIENT_SECRET is required"),
   UPS_BASE_URL : z.url().default('https://wwwcie.ups.com/api'),
    UPS_ACCOUNT_NUMBER: z.string().length(6).optional(),
   UPS_API_VERSION : z.coerce.string().default('v1'),
   HTTP_TIMEOUT : z.coerce.number().default(30000),
})

const parsed = envSchema.safeParse(process.env);

if (!parsed.success){
    console.error("Environment variable validation failed:", z.treeifyError(parsed.error));
    process.exit(1);
}

export const appConfig = parsed.data;
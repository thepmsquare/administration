import { z } from "zod";

const SquareConfigZ = z.strictObject({
  administrationBLBaseURL: z.string(),
  commonBLBaseURL: z.string(),
  supportEmail: z.string(),
  resetPasswordOTPLength: z.number(),
  emailVerificationOTPLength: z.number(),
});

type SquareConfig = z.infer<typeof SquareConfigZ>;

export default SquareConfig;

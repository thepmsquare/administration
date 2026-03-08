import { z } from "zod";

const SquareConfigZ = z.strictObject({
  administrationBLBaseURL: z.string(),
  commonBLBaseURL: z.string(),
  supportEmail: z.string(),
});

type SquareConfig = z.infer<typeof SquareConfigZ>;

export default SquareConfig;

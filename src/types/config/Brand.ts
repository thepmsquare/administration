import { z } from "zod";

const BrandConfigZ = z.strictObject({
  appName: z.string(),
});

type BrandConfig = z.infer<typeof BrandConfigZ>;

export default BrandConfig;

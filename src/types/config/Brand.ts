import { z } from "zod";

const BrandConfigZ = z.strictObject({});

type BrandConfig = z.infer<typeof BrandConfigZ>;

export default BrandConfig;

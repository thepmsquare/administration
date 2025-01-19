import { z } from "zod";

const LocalStorageKeysConfigZ = z.strictObject({
  theme: z.string(),
});

type LocalStorageKeysConfig = z.infer<typeof LocalStorageKeysConfigZ>;

export default LocalStorageKeysConfig;

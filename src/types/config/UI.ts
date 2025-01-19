import { z } from "zod";

const UIConfigZ = z.strictObject({
  defaultThemeState: z.enum(["dark", "light"]),
});

type UIConfig = z.infer<typeof UIConfigZ>;

export default UIConfig;

import { z } from "zod";

import { UserZ } from "../Common";

const RegisterStateZ = z.object({
  user: UserZ,
});

type RegisterState = z.infer<typeof RegisterStateZ>;

export { RegisterStateZ, RegisterState };

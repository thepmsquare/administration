import { z } from "zod";

import { UserZ } from "../Common";

const LoginStateZ = z.object({
  user: UserZ,
});

type LoginState = z.infer<typeof LoginStateZ>;

export { LoginStateZ, LoginState };

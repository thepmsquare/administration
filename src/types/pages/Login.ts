import { z } from "zod";

const LoginStateZ = z.object({});

type LoginState = z.infer<typeof LoginStateZ>;

export { LoginStateZ, LoginState };

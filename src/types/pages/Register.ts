import { z } from "zod";

const RegisterStateZ = z.object({});

type RegisterState = z.infer<typeof RegisterStateZ>;

export { RegisterStateZ, RegisterState };

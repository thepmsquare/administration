import { z } from "zod";

const ForgotPasswordStateZ = z.object({
  username: z.string().nullable(),
});

type ForgotPasswordState = z.infer<typeof ForgotPasswordStateZ>;

export { ForgotPasswordStateZ, ForgotPasswordState };

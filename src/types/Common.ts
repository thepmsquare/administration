import { z } from "zod";

const UserZ = z.object({
  user_id: z.string(),
  username: z.string(),
  access_token: z.string(),
});

type User = z.infer<typeof UserZ>;

export { UserZ, User };

import { z } from "zod";

import { UserZ } from "../Common";

const ProfileStateZ = z.object({
  user: UserZ,
});

type ProfileState = z.infer<typeof ProfileStateZ>;

export { ProfileStateZ, ProfileState };

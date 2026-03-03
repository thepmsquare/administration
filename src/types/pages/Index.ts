import { z } from "zod";

import { UserZ } from "../Common";

const IndexStateZ = z.object({
  user: UserZ.optional(),
});

type IndexState = z.infer<typeof IndexStateZ>;

export { IndexStateZ, IndexState };

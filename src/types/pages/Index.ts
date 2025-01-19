import { z } from "zod";

import { UserZ } from "../Common";

const IndexStateZ = z.object({
  user: UserZ,
});

type IndexState = z.infer<typeof IndexStateZ>;

export { IndexStateZ, IndexState };

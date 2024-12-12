import { AuthenticationAdministrationBL } from "squareadministration";

import brandConfig from "../config/brand";

let authenticationAdministrationBL = new AuthenticationAdministrationBL(
  brandConfig.administrationBLBaseURL
);
export { authenticationAdministrationBL };

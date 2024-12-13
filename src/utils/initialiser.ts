import { AuthenticationAdministrationBL } from "squareadministration";

import squareConfig from "../config/square";

let authenticationAdministrationBL = new AuthenticationAdministrationBL(
  squareConfig.administrationBLBaseURL
);
export { authenticationAdministrationBL };

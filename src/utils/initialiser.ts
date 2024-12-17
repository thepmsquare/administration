import { AuthenticationAdministrationBL } from "squareadministration";
import { AuthenticationCommonBL } from "squarecommonblhelper";

import squareConfig from "../config/square";

let authenticationAdministrationBL = new AuthenticationAdministrationBL(
  squareConfig.administrationBLBaseURL
);
let authenticationCommonBL = new AuthenticationCommonBL(
  squareConfig.commonBLBaseURL
);
export { authenticationAdministrationBL, authenticationCommonBL };

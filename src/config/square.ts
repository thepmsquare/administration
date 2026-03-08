import SquareConfig from "../types/config/Square";

const squareConfig: SquareConfig = {
  administrationBLBaseURL:
    process.env.GATSBY_ADMINISTRATION_BL_BASE_URL ||
    "https://raspi.thepmsquare.com:10111",
  commonBLBaseURL:
    process.env.GATSBY_COMMON_BL_BASE_URL ||
    "https://raspi.thepmsquare.com:10110",
  supportEmail:
    process.env.GATSBY_SUPPORT_EMAIL || "thepmsquare@gmail.com",
};
export default squareConfig;

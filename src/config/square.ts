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
  resetPasswordOTPLength: process.env.GATSBY_RESET_PASSWORD_OTP_LENGTH
    ? parseInt(process.env.GATSBY_RESET_PASSWORD_OTP_LENGTH)
    : 6,
  emailVerificationOTPLength: process.env.GATSBY_EMAIL_VERIFICATION_OTP_LENGTH
    ? parseInt(process.env.GATSBY_EMAIL_VERIFICATION_OTP_LENGTH)
    : 6,
};
export default squareConfig;

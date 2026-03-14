import BrandConfig from "../types/config/Brand";

const brandConfig: BrandConfig = {
  appName: process.env.GATSBY_APP_NAME || "administration",
  primaryFont: "Outfit Variable, sans-serif",
  accentFont: "'Fraunces Variable', serif",
};
export default brandConfig;

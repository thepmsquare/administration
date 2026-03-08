import UIConfig from "../types/config/UI";

const uiConfig: UIConfig = {
  defaultThemeState:
    (process.env.GATSBY_DEFAULT_THEME_STATE as "dark" | "light") || "dark",
};
export default uiConfig;

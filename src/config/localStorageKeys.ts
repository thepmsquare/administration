import LocalStorageKeysConfig from "../types/config/LocalStorageKeys";

const localStorageKeysConfig: LocalStorageKeysConfig = {
  theme: process.env.GATSBY_LOCAL_STORAGE_THEME_KEY || "administration-theme",
};
export default localStorageKeysConfig;

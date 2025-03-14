import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "../stylesheets/common.css";
import "../stylesheets/components/page.css";

import * as React from "react";
import { ThemeToggle } from "squarecomponents";

import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider
} from "@mui/material/styles";

import localStorageKeysConfig from "../config/localStorageKeys";
import uiConfig from "../config/ui";

const isBrowser = typeof window !== "undefined";
type Props = { children: React.ReactNode };

const Page: React.FC<Props> = ({ children }) => {
  // get stuff from local storage
  let localStorageTheme;
  if (isBrowser) {
    localStorageTheme = window.localStorage.getItem(
      localStorageKeysConfig.theme
    );
  } else {
    localStorageTheme = null;
  }
  let defaultThemeState: "dark" | "light";
  if (localStorageTheme !== null) {
    defaultThemeState = localStorageTheme === "dark" ? "dark" : "light";
  } else {
    defaultThemeState = uiConfig.defaultThemeState;
    if (isBrowser) {
      window.localStorage.setItem(
        localStorageKeysConfig.theme,
        uiConfig.defaultThemeState
      );
    }
  }

  // state
  const [themeState, changeThemeState] = React.useState(defaultThemeState);

  // functions
  const customChangeThemeState = (newThemeState: "dark" | "light") => {
    changeThemeState(newThemeState);
    if (isBrowser) {
      window.localStorage.setItem(localStorageKeysConfig.theme, newThemeState);
    }
  };

  // misc
  const currentTheme = createTheme({
    typography: {
      fontFamily: "Fraunces Variable",
      h1: {
        fontFamily: "Outfit Variable",
      },
      h2: {
        fontFamily: "Outfit Variable",
      },
      h3: {
        fontFamily: "Outfit Variable",
      },
      h4: {
        fontFamily: "Outfit Variable",
      },
      h5: {
        fontFamily: "Outfit Variable",
      },
      h6: {
        fontFamily: "Outfit Variable",
      },
      button: {
        fontFamily: "Outfit Variable",
      },
    },
    palette: {
      mode: themeState,
    },
  });

  return (
    <React.StrictMode>
      <ThemeProvider theme={currentTheme}>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <div className="parent">{children}</div>

          <div className="theme-toggle-container">
            <ThemeToggle
              variant="contained"
              fullwidth
              themeState={themeState}
              customChangeThemeState={customChangeThemeState}
            />
          </div>
        </StyledEngineProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default Page;

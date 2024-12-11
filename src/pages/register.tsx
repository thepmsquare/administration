import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "../stylesheets/common.css";
import "../stylesheets/register.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import ThemeToggle from "squarecomponents/components/ThemeToggle";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Paper } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";

import localStorageKeysConfig from "../config/localStorageKeys";
import uiConfig from "../config/ui";

const isBrowser = typeof window !== "undefined";

export const Head: HeadFC = () => <title>thePmSquare | administration</title>;

const RegisterPage: React.FC<PageProps> = () => {
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
      window.localStorage.setItem("theme", uiConfig.defaultThemeState);
    }
  }
  // state
  const [themeState, changeThemeState] = React.useState(defaultThemeState);
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  // functions

  const customChangeThemeState = (newThemeState: "dark" | "light") => {
    changeThemeState(newThemeState);
    if (isBrowser) {
      window.localStorage.setItem("theme", newThemeState);
    }
  };
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
    <ThemeProvider theme={currentTheme}>
      <StyledEngineProvider injectFirst>
        <CssBaseline />
        <Paper square>
          <h1>Register</h1>
          <Link to="/">
            <Button>Home</Button>
          </Link>
          <Button
            onClick={() => {
              changeSnackbarState({
                isOpen: true,
                message: "test",
                severity: "error",
              });
            }}
          >
            Open snackbar
          </Button>
          <ThemeToggle
            themeState={themeState}
            customChangeThemeState={customChangeThemeState}
          />
          <CustomSnackbar
            snackbarState={snackbarState}
            changeSnackbarState={changeSnackbarState}
          />
        </Paper>
      </StyledEngineProvider>
    </ThemeProvider>
  );
};

export default RegisterPage;

import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "../stylesheets/common.css";
import "../stylesheets/register.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput } from "squarecomponents";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import ThemeToggle from "squarecomponents/components/ThemeToggle";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Paper, TextField } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";

import localStorageKeysConfig from "../config/localStorageKeys";
import uiConfig from "../config/ui";
import { authenticationAdministrationBL } from "../utils/initialiser";

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
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");
  const [confirmPassword, changeConfirmPassword] = React.useState<string>("");
  const [adminPassword, changeAdminPassword] = React.useState<string>("");

  // functions
  const customChangeThemeState = (newThemeState: "dark" | "light") => {
    changeThemeState(newThemeState);
    if (isBrowser) {
      window.localStorage.setItem("theme", newThemeState);
    }
  };
  const handleRegister: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        throw new Error("password and confirm password fields do not match.");
      }
      let response = await authenticationAdministrationBL.registerUsernameV0(
        username,
        password,
        adminPassword
      );
      changeSnackbarState({
        isOpen: true,
        message: response["message"] ? response["message"] : "",
        severity: "success",
      });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
        severity: "error",
      });
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
    <ThemeProvider theme={currentTheme}>
      <StyledEngineProvider injectFirst>
        <CssBaseline />
        <main className="register-main">
          <Paper className="register-content">
            <h1>register</h1>
            <form className="register-form" onSubmit={handleRegister}>
              <TextField
                value={username}
                onChange={(e) => changeUsername(e.target.value)}
                label="username"
                variant="outlined"
                required
              />
              <PasswordInput
                value={password}
                onChange={(e) => changePassword(e.target.value)}
                uniqueIdForARIA="register-password"
                label="password"
                variant="outlined"
                others={{ required: true }}
              />
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => changeConfirmPassword(e.target.value)}
                uniqueIdForARIA="confirm-register-password"
                label="confirm password"
                variant="outlined"
                others={{ required: true }}
              />
              <PasswordInput
                value={adminPassword}
                onChange={(e) => changeAdminPassword(e.target.value)}
                uniqueIdForARIA="register-admin-password"
                label="admin password"
                variant="outlined"
                others={{ required: true }}
              />
              <div className="register-form-action">
                <Button color="inherit">
                  <Link to="/">cancel </Link>
                </Button>
                <Button type="submit" variant="contained">
                  submit
                </Button>
              </div>
            </form>
            <ThemeToggle
              themeState={themeState}
              customChangeThemeState={customChangeThemeState}
            />
          </Paper>

          <CustomSnackbar
            snackbarState={snackbarState}
            changeSnackbarState={changeSnackbarState}
          />
        </main>
      </StyledEngineProvider>
    </ThemeProvider>
  );
};

export default RegisterPage;

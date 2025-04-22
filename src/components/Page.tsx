import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "../stylesheets/common.css";
import "../stylesheets/components/page.css";

import { createMaterialYouTheme } from "mui-create-material-you-theme";
import * as React from "react";
import { CustomSnackbar } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { CircularProgress, Paper } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";

import localStorageKeysConfig from "../config/localStorageKeys";
import uiConfig from "../config/ui";
import { ThemeState, User } from "../types/Common";
import CustomAppBar from "./CustomAppBar";

const isBrowser = typeof window !== "undefined";
type Props = {
  children: React.ReactNode;
  className?: string;
  user: User | undefined;
  nullifyPageStateFunction: () => void | undefined;
  changeSnackbarState: React.Dispatch<
    React.SetStateAction<CustomSnackbarStateType>
  >;
  snackbarState: CustomSnackbarStateType;
  isLoading?: boolean;
};

const Page: React.FC<Props> = ({
  children,
  className,
  user,
  nullifyPageStateFunction,
  changeSnackbarState,
  snackbarState,
  isLoading = false,
}) => {
  // get stuff from local storage
  let localStorageTheme;
  if (isBrowser) {
    localStorageTheme = window.localStorage.getItem(
      localStorageKeysConfig.theme
    );
  } else {
    localStorageTheme = null;
  }
  let defaultThemeState: ThemeState;
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
  const customChangeThemeState = (newThemeState: ThemeState) => {
    console.log(themeState);
    console.log(newThemeState);
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
  console.log("render: ", themeState);
  console.log("render defaultThemeState: ", defaultThemeState);
  const materialYouLight = createMaterialYouTheme(themeState);
  return (
    <React.StrictMode>
      <ThemeProvider theme={materialYouLight}>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <CustomAppBar
            user={user}
            nullifyPageStateFunction={nullifyPageStateFunction}
            changeSnackbarState={changeSnackbarState}
            themeState={themeState}
            customChangeThemeState={customChangeThemeState}
          />
          {isLoading ? (
            <div className="loading-screen">
              <CircularProgress />
            </div>
          ) : (
            <>
              <Paper className={`parent ${className}`} square>
                {children}
              </Paper>
              <div className="theme-toggle-container"></div>
              <CustomSnackbar
                snackbarState={snackbarState}
                changeSnackbarState={changeSnackbarState}
              />
            </>
          )}
        </StyledEngineProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default Page;

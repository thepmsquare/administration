import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "../stylesheets/common.css";
import "../stylesheets/components/page.css";

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
import { authenticationCommonBL } from "../utils/initialiser";
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
  const defaultThemeState = React.useMemo<ThemeState>(() => {
    if (!isBrowser) return uiConfig.defaultThemeState;
    const storedTheme = window.localStorage.getItem(
      localStorageKeysConfig.theme
    );
    if (storedTheme !== null) return storedTheme === "dark" ? "dark" : "light";
    window.localStorage.setItem(
      localStorageKeysConfig.theme,
      uiConfig.defaultThemeState
    );
    return uiConfig.defaultThemeState;
  }, []);

  const [themeState, changeThemeState] = React.useState(defaultThemeState);
  const [userProfilePhotoURL, setUserProfilePhotoURL] = React.useState<
    string | null
  >(null);
  const [isUserProfilePhotoLoading, setIsUserProfilePhotoLoading] =
    React.useState<boolean>(false);

  const customChangeThemeState = (newThemeState: ThemeState) => {
    changeThemeState(newThemeState);
    if (isBrowser) {
      window.localStorage.setItem(localStorageKeysConfig.theme, newThemeState);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const getUserProfilePhoto = async () => {
      if (!user) return;
      try {
        setIsUserProfilePhotoLoading(true);
        const userDetailsResponse =
          await authenticationCommonBL.getUserProfilePhotoV0(user.access_token);
        if (
          isMounted &&
          userDetailsResponse instanceof Blob &&
          userDetailsResponse.size > 0
        ) {
          setUserProfilePhotoURL(URL.createObjectURL(userDetailsResponse));
        }
      } catch (error) {
        if (isMounted) {
          changeSnackbarState({
            isOpen: true,
            message: (error as any).message,
            severity: "error",
          });
        }
      } finally {
        if (isMounted) setIsUserProfilePhotoLoading(false);
      }
    };
    getUserProfilePhoto();
    return () => {
      isMounted = false;
    };
  }, [user, changeSnackbarState]);
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
        <CustomAppBar
          user={user}
          nullifyPageStateFunction={nullifyPageStateFunction}
          changeSnackbarState={changeSnackbarState}
          themeState={themeState}
          customChangeThemeState={customChangeThemeState}
          isUserProfilePhotoLoading={isUserProfilePhotoLoading}
          userProfilePhotoURL={userProfilePhotoURL}
        />
        {isLoading ? (
          <div className="loading-screen">
            <CircularProgress />
          </div>
        ) : (
          <>
            <Paper
              className={className ? `parent ${className}` : "parent"}
              square
            >
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
  );
};

export default Page;

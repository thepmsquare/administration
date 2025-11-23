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
  externalUserProfilePhotoURL?: string | null;
  isExternalUserProfilePhotoLoading?: boolean;
};

const getInitialThemeState = (): ThemeState => {
  if (!isBrowser) return uiConfig.defaultThemeState;
  const storedTheme = window.localStorage.getItem(localStorageKeysConfig.theme);
  if (storedTheme !== null) return storedTheme === "dark" ? "dark" : "light";
  window.localStorage.setItem(
    localStorageKeysConfig.theme,
    uiConfig.defaultThemeState
  );
  return uiConfig.defaultThemeState;
};

const Page: React.FC<Props> = ({
  children,
  className,
  user,
  nullifyPageStateFunction,
  changeSnackbarState,
  snackbarState,
  isLoading = false,
  externalUserProfilePhotoURL,
  isExternalUserProfilePhotoLoading,
}) => {
  const [themeState, changeThemeState] = React.useState(getInitialThemeState);
  const [internalUserProfilePhotoURL, setInternalUserProfilePhotoURL] =
    React.useState<string | null>(null);
  const [
    isInternalUserProfilePhotoLoading,
    setIsInternalUserProfilePhotoLoading,
  ] = React.useState<boolean>(false);

  const isControlled = externalUserProfilePhotoURL !== undefined;
  const userProfilePhotoURL = isControlled
    ? externalUserProfilePhotoURL
    : internalUserProfilePhotoURL;
  const isUserProfilePhotoLoading = isControlled
    ? !!isExternalUserProfilePhotoLoading
    : isInternalUserProfilePhotoLoading;

  const customChangeThemeState = React.useCallback(
    (newThemeState: ThemeState) => {
      changeThemeState(newThemeState);
      if (isBrowser) {
        window.localStorage.setItem(
          localStorageKeysConfig.theme,
          newThemeState
        );
      }
    },
    []
  );

  React.useEffect(() => {
    if (isControlled) {
      return;
    }

    const abortController = new AbortController();

    const internalUserProfilePhotoURLRef = React.useRef<string | null>(null);

    const getUserProfilePhoto = async () => {
      if (!user) {
        setInternalUserProfilePhotoURL(null);
        internalUserProfilePhotoURLRef.current = null;
        return;
      }

      try {
        setIsInternalUserProfilePhotoLoading(true);
        const userDetailsResponse =
          await authenticationCommonBL.getUserProfilePhotoV0(user.access_token);

        if (abortController.signal.aborted) return;

        if (
          userDetailsResponse instanceof Blob &&
          userDetailsResponse.size > 0
        ) {
          const url = URL.createObjectURL(userDetailsResponse);
          setInternalUserProfilePhotoURL(url);
          internalUserProfilePhotoURLRef.current = url;
        } else {
          setInternalUserProfilePhotoURL(null);
          internalUserProfilePhotoURLRef.current = null;
        }
      } catch (error) {
        if (abortController.signal.aborted) return;

        const errorMessage =
          error instanceof Error
            ? error.message
            : "failed to load profile photo";
        changeSnackbarState({
          isOpen: true,
          message: errorMessage,
          severity: "error",
        });
        setInternalUserProfilePhotoURL(null);
        internalUserProfilePhotoURLRef.current = null;
      } finally {
        if (!abortController.signal.aborted) {
          setIsInternalUserProfilePhotoLoading(false);
        }
      }
    };

    getUserProfilePhoto();

    return () => {
      abortController.abort();
      // Cleanup blob URL to prevent memory leak
      if (internalUserProfilePhotoURLRef.current) {
        URL.revokeObjectURL(internalUserProfilePhotoURLRef.current);
        internalUserProfilePhotoURLRef.current = null;
      }
    };
  }, [user, changeSnackbarState, isControlled]);

  const currentTheme = React.useMemo(
    () =>
      createTheme({
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
      }),
    [themeState]
  );

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

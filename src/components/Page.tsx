import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "../stylesheets/common.css";
import "../stylesheets/components/page.css";

import * as React from "react";
import { CustomSnackbar } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Box, CircularProgress, Paper } from "@mui/material";
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
import OfflineScreen from "./OfflineScreen";
import ServerDownScreen from "./ServerDownScreen";
import squareConfig from "../config/square";
import brandConfig from "../config/brand";
import { ServerCheckContext } from "../context/serverCheck";
import { isNetworkError } from "../utils/networkError";

async function pingServer(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

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

  // Use the theme set by the blocking script if available
  if ((window as any).__theme) {
    return (window as any).__theme;
  }

  const storedTheme = window.localStorage.getItem(localStorageKeysConfig.theme);
  if (storedTheme !== null) return storedTheme === "dark" ? "dark" : "light";

  // Check system preference if no stored theme
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

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
  const [isOnline, setIsOnline] = React.useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [serverOk, setServerOk] = React.useState<boolean>(true);
  const [internalUserProfilePhotoURL, setInternalUserProfilePhotoURL] =
    React.useState<string | null>(null);
  const [
    isInternalUserProfilePhotoLoading,
    setIsInternalUserProfilePhotoLoading,
  ] = React.useState<boolean>(false);

  const internalUserProfilePhotoURLRef = React.useRef<string | null>(null);

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
          newThemeState,
        );
        document.documentElement.setAttribute("data-theme", newThemeState);
      }
    },
    [],
  );

  // Sync theme across tabs
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === localStorageKeysConfig.theme && e.newValue) {
        changeThemeState(e.newValue as ThemeState);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Internet connectivity
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Server connectivity
  const checkServers = React.useCallback(async () => {
    if (!navigator.onLine) {
      setServerOk(false);
      return;
    }
    const results = await Promise.all([
      pingServer(squareConfig.administrationBLBaseURL),
      pingServer(squareConfig.commonBLBaseURL),
    ]);
    setServerOk(results.every(Boolean));
  }, []);

  React.useEffect(() => {
    checkServers();
  }, [checkServers]);

  React.useEffect(() => {
    if (isControlled) {
      return;
    }

    const abortController = new AbortController();

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

        if (isNetworkError(error)) {
          checkServers();
        } else {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "failed to load profile photo";
          changeSnackbarState({
            isOpen: true,
            message: errorMessage,
            severity: "error",
          });
        }
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
          fontFamily: brandConfig.primaryFont,

          h1: {
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
          },

          h2: {
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.2,
          },

          h3: {
            fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
            fontWeight: 700,
            lineHeight: 1.2,
          },

          h4: {
            fontSize: "clamp(1.5rem, 4vw, 1.75rem)",
            fontWeight: 600,
            lineHeight: 1.3,
          },

          h5: {
            fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
            fontWeight: 600,
            lineHeight: 1.4,
          },

          h6: {
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            fontWeight: 500,
            lineHeight: 1.4,
          },

          body1: {
            fontSize: "clamp(1rem, 1.2vw, 1.125rem)",
            lineHeight: 1.6,
            fontWeight: 400,
          },

          body2: {
            fontSize: "0.875rem",
            lineHeight: 1.5,
            fontWeight: 400,
          },

          button: {
            textTransform: "none",
            fontWeight: 500,
            letterSpacing: "0.02em",
          },
          caption: {
            fontSize: "0.75rem",
            lineHeight: 1.2,
            fontWeight: 400,
          },
          overline: {
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            fontWeight: 700,
            lineHeight: 1.2,
          },
        },
        components: {
          MuiPaper: {
            defaultProps: {
              elevation: 0,
            },
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                borderRadius: 0,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
        },
        palette: {
          mode: themeState,
        },
      }),
    [themeState],
  );

  return (
    <ServerCheckContext.Provider value={checkServers}>
      <ThemeProvider theme={currentTheme}>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <Box
            className="main-container"
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100dvh",
              "--accent-font": brandConfig.accentFont,
            }}
          >
            <CustomAppBar
              user={user}
              nullifyPageStateFunction={nullifyPageStateFunction}
              changeSnackbarState={changeSnackbarState}
              themeState={themeState}
              customChangeThemeState={customChangeThemeState}
              isUserProfilePhotoLoading={isUserProfilePhotoLoading}
              userProfilePhotoURL={userProfilePhotoURL}
            />
            {!isOnline ? (
              <OfflineScreen />
            ) : !serverOk ? (
              <ServerDownScreen onRetry={checkServers} />
            ) : isLoading ? (
              <Box
                className="loading-screen"
                aria-busy="true"
                aria-live="polite"
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Paper
                  className={className ? `parent ${className}` : "parent"}
                  square
                  role="main"
                >
                  {children}
                </Paper>
                <CustomSnackbar
                  snackbarState={snackbarState}
                  changeSnackbarState={changeSnackbarState}
                />
              </>
            )}
          </Box>
        </StyledEngineProvider>
      </ThemeProvider>
    </ServerCheckContext.Provider>
  );
};

export default Page;

import "../stylesheets/login.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput, UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, CircularProgress, Paper, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";
import { useAuth } from "../utils/auth";
import { useServerCheck } from "../context/serverCheck";
import { isNetworkError } from "../utils/networkError";
import squareConfig from "../config/square";

export const Head: HeadFC = () => <title>{brandConfig.appName} | login</title>;

const LoginPage: React.FC<PageProps> = () => {
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const triggerServerCheck = useServerCheck();
  const { isLoading } = useAuth(null, { redirectIfLoggedIn: "/" }, triggerServerCheck);
  const [isGoogleVisible, setIsGoogleVisible] = React.useState<boolean>(false);
  const [isSubmitting, changeIsSubmitting] = React.useState<boolean>(false);
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");
  const googleButtonRef = React.useRef<HTMLDivElement>(null);

  // functions
  const handleGoogleLogin = React.useCallback(
    async (response: any) => {
      if (isSubmitting) return;
      changeIsSubmitting(true);
      try {
        const blResponse = await authenticationAdministrationBL.registerLoginGoogleV0(
          response.credential
        );

        const indexState = IndexStateZ.parse({
          user: {
            ...blResponse["data"]["main"],
          },
        });

        await navigate("/", { state: indexState });
      } catch (error) {
        if (isNetworkError(error)) {
          triggerServerCheck();
        } else {
          changeSnackbarState({
            isOpen: true,
            message: (error as Error).message,
            severity: "error",
          });
        }
      } finally {
        changeIsSubmitting(false);
      }
    },
    [isSubmitting, triggerServerCheck]
  );

  React.useEffect(() => {
    const renderGoogleButton = () => {
      const google = (window as any).google;
      const theme = document.documentElement.getAttribute("data-theme") || "light";
      if (!squareConfig.googleClientID) {
        console.warn("[GSI_DEBUG]: google client id is missing from configuration.");
        return;
      }
      if (google && googleButtonRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: squareConfig.googleClientID,
            callback: handleGoogleLogin,
          });
          google.accounts.id.renderButton(googleButtonRef.current, {
            theme: theme === "dark" ? "filled_black" : "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
          setIsGoogleVisible(true);
        } catch (error) {
          console.error("[GSI_DEBUG]: failed to initialize or render google button:", error);
        }
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      console.error("[GSI_DEBUG]: failed to load google identity services script. check your internet connection or adblocker.");
    };
    document.body.appendChild(script);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          renderGoogleButton();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      observer.disconnect();
    };
  }, [handleGoogleLogin]);

  const handleLogin: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    changeIsSubmitting(true);
    try {
      const response = await authenticationAdministrationBL.loginUsernameV0(
        username,
        password,
      );

      const indexState = IndexStateZ.parse({
        user: {
          ...response["data"]["main"],
          username,
        },
      });

      await navigate("/", { state: indexState });
      changePassword("");
    } catch (error) {
      changePassword("");
      if (isNetworkError(error)) {
        triggerServerCheck();
      } else {
        changeSnackbarState({
          isOpen: true,
          message: (error as Error).message,
          severity: "error",
        });
      }
    } finally {
      changeIsSubmitting(false);
    }
  };

  const navigateToForgotPassword = React.useCallback(async () => {
    await navigate(`/forgotPassword?username=${username}`);
  }, [username]);

  // render
  return (
    <Page
      user={undefined}
      nullifyPageStateFunction={() => {}}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="login-page"
      isLoading={isLoading}
    >
      <Paper className="login-card" elevation={3}>
        <Typography variant="h4" component="h1" className="login-title">
          login
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          log in to your existing account
        </Typography>
        <form
          className="common-form"
          onSubmit={handleLogin}
          aria-label="login form"
        >
          <UsernameInput
            value={username}
            onChange={(e) => changeUsername(e.target.value)}
            label="username"
            uniqueIdForARIA="login-username"
            variant="outlined"
            autocomplete="username"
            others={{
              required: true,
              disabled: isSubmitting,
            }}
          />
          <PasswordInput
            value={password}
            onChange={(e) => changePassword(e.target.value)}
            uniqueIdForARIA="login-password"
            label="password"
            variant="outlined"
            autoComplete="current-password"
            others={{
              required: true,
              disabled: isSubmitting,
            }}
          />

          <Link
            to="/forgotPassword"
            className="forgot-password-link auth-link"
            onClick={(e) => {
              if (username) {
                e.preventDefault();
                navigateToForgotPassword();
              }
            }}
          >
            forgot password?
          </Link>

          <div className="login-form-action">
            <Button
              color="inherit"
              disabled={isSubmitting}
              onClick={() => navigate("/")}
            >
              cancel
            </Button>
            <Button
              type="submit"
              variant={"contained" as any}
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {isSubmitting ? "logging in..." : "log in"}
            </Button>
          </div>
        </form>
        {isGoogleVisible && (
          <div className="google-login-container">
            <div className="divider">
              <span>or</span>
            </div>
            <div ref={googleButtonRef} className="google-button"></div>
          </div>
        )}

        <div className="auth-link-container">
          <Typography variant="body2" color="text.secondary">
            don't have an account?{" "}
            <Link to="/register" className="auth-link">
              create an account
            </Link>
          </Typography>
        </div>
      </Paper>
    </Page>
  );
};

export default LoginPage;

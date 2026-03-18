import "../stylesheets/register.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput, UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Alert, Button, CircularProgress, Paper, Typography } from "@mui/material";

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

export const Head: HeadFC = () => (
  <title>{brandConfig.appName} | register</title>
);

const RegisterPage: React.FC<PageProps> = () => {
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const triggerServerCheck = useServerCheck();
  const { isLoading } = useAuth(null, { redirectIfLoggedIn: "/" }, triggerServerCheck);
  const [isSubmitting, changeIsSubmitting] = React.useState<boolean>(false);
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");
  const [confirmPassword, changeConfirmPassword] = React.useState<string>("");
  const [adminPassword, changeAdminPassword] = React.useState<string>("");
  const googleButtonRef = React.useRef<HTMLDivElement>(null);

  // functions
  const handleGoogleRegister = React.useCallback(
    async (response: any) => {
      if (isSubmitting) return;
      changeIsSubmitting(true);
      try {
        const blResponse = await authenticationAdministrationBL.registerLoginGoogleV0(
          response.credential
        );

        const indexPageState = IndexStateZ.parse({
          user: {
            ...blResponse["data"]["main"],
          },
        });
        await navigate("/", { state: indexPageState });
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
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const google = (window as any).google;
      if (google && googleButtonRef.current) {
        google.accounts.id.initialize({
          client_id: squareConfig.googleClientID,
          callback: handleGoogleRegister,
        });
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [handleGoogleRegister]);

  const handleRegister: React.FormEventHandler = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    changeIsSubmitting(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("password and confirm password fields do not match.");
      }
      const response = await authenticationAdministrationBL.registerUsernameV0(
        username,
        password,
        adminPassword
      );

      const indexPageState = IndexStateZ.parse({
        user: {
          username: response.data.main.username,
          user_id: response.data.main.user_id,
          access_token: response.data.main.access_token,
        },
      });
      await navigate("/", { state: indexPageState });
      changePassword("");
      changeConfirmPassword("");
      changeAdminPassword("");
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
  };

  // misc

  // misc

  return (
    <Page
      user={undefined}
      nullifyPageStateFunction={() => {}}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="register-page"
      isLoading={isLoading}
    >
      <Paper className="register-card" elevation={3}>
        <Typography variant="h4" component="h1" className="register-title">
          register
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          create a new account
        </Typography>
        <form
          className="common-form"
          onSubmit={handleRegister}
          aria-label="registration form"
        >
          <UsernameInput
            value={username}
            onChange={(e) => changeUsername(e.target.value)}
            label="username"
            uniqueIdForARIA="register-username"
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
            uniqueIdForARIA="register-password"
            label="password"
            variant="outlined"
            autoComplete="new-password"
            others={{
              required: true,
              disabled: isSubmitting,
            }}
          />
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => changeConfirmPassword(e.target.value)}
            uniqueIdForARIA="confirm-register-password"
            label="confirm password"
            variant="outlined"
            autoComplete="new-password"
            others={{
              required: true,
              disabled: isSubmitting,
              error: confirmPassword.length > 0 && password !== confirmPassword,
            }}
          />
          <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
            note: the admin password is a restricted key intended only for
            authorized square services administrators. if you do not have this
            password, please refrain from creating an account here.
          </Alert>
          <PasswordInput
            value={adminPassword}
            onChange={(e) => changeAdminPassword(e.target.value)}
            uniqueIdForARIA="register-admin-password"
            label="admin password"
            variant="outlined"
            autoComplete="current-password"
            others={{
              required: true,
              disabled: isSubmitting,
            }}
          />
          <div className="register-form-action">
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
              {isSubmitting ? "registering..." : "create account"}
            </Button>
          </div>
        </form>
        <div className="google-register-container">
          <div className="divider">
            <span>or</span>
          </div>
          <div ref={googleButtonRef} className="google-button"></div>
        </div>

        <div className="auth-link-container">
          <Typography variant="body2" color="text.secondary">
            already have an account?{" "}
            <Link to="/login" className="auth-link">
              log in to your existing account
            </Link>
          </Typography>
        </div>
      </Paper>
    </Page>
  );
};

export default RegisterPage;

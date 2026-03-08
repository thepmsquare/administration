import "../stylesheets/login.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput, UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";
import { useAuth } from "../utils/auth";

export const Head: HeadFC = () => <title>{brandConfig.appName} | login</title>;

const LoginPage: React.FC<PageProps> = () => {
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const { isLoading } = useAuth(null, { redirectIfLoggedIn: "/" });
  const [isSubmitting, changeIsSubmitting] = React.useState<boolean>(false);
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");

  // functions
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
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
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
      <Typography variant="h4" component="h1">
        login
      </Typography>
      <form className="common-form" onSubmit={handleLogin}>
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
          others={{
            required: true,
            autoComplete: "current-password",
            disabled: isSubmitting,
          }}
        />
        <Button
          color="inherit"
          onClick={navigateToForgotPassword}
          disabled={isSubmitting}
        >
          forgot password?
        </Button>

        <div className="login-form-action">
          <Button color="inherit" disabled={isSubmitting}>
            <Link to="/">cancel</Link>
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "logging in..." : "submit"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default LoginPage;

import "../stylesheets/login.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput, UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { ForgotPasswordStateZ } from "../types/pages/ForgotPassword";
import { IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";

export const Head: HeadFC = () => <title>{brandConfig.appName} | login</title>;

const LoginPage: React.FC<PageProps> = () => {
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const [isLoading, changeIsLoading] = React.useState<boolean>(true);
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");

  // functions
  const handleLogin: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticationAdministrationBL.loginUsernameV0(
        username,
        password
      );

      const indexState = IndexStateZ.parse({
        user: {
          ...response["data"]["main"],
          username,
        },
      });

      await navigate("/", { state: indexState });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const checkForAccessToken = async () => {
    try {
      const accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      const accessToken = accessTokenResponse.data.main.access_token;

      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        accessToken
      );
      const username = userDetailsResponse.data.main.username;
      const user_id = userDetailsResponse.data.main.user_id;

      // Validate before navigating
      const indexState = IndexStateZ.parse({
        user: {
          user_id,
          username,
          access_token: accessToken,
        },
      });

      await navigate("/", { state: indexState });
    } catch {
      // User not logged in OR validation failed
      console.log("user not logged in or invalid response.");
    } finally {
      changeIsLoading(false);
    }
  };

  const navigateToForgotPassword = async () => {
    const forgotPasswordState = ForgotPasswordStateZ.parse({
      user: {
        username,
      },
    });
    await navigate("/forgotPassword", { state: forgotPasswordState });
  };

  // useEffect
  React.useEffect(() => {
    checkForAccessToken();
  }, []);

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
          others={{ required: true }}
        />
        <PasswordInput
          value={password}
          onChange={(e) => changePassword(e.target.value)}
          uniqueIdForARIA="login-password"
          label="password"
          variant="outlined"
          others={{ required: true }}
        />
        <Button color="inherit" onClick={navigateToForgotPassword}>
          forgot password?
        </Button>

        <div className="login-form-action">
          <Button color="inherit">
            <Link to="/">cancel</Link>
          </Button>
          <Button type="submit" variant="contained">
            submit
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default LoginPage;

import "../stylesheets/login.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput, UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { LoginState, LoginStateZ } from "../types/pages/Login";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";

export const Head: HeadFC = () => <title>{brandConfig.appName} | login</title>;

const LoginPage: React.FC<PageProps> = (props) => {
  const { location } = props;
  let state: LoginState | null = null;
  try {
    state = LoginStateZ.parse(location.state);
  } catch (e) {
    state = null;
    console.log("error parsing page state: ", e);
  }
  // state
  const [pageState, setPageState] = React.useState<LoginState | null>(state);
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

      await navigate("/", {
        state: { user: { ...response["data"]["main"], username } },
      });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const checkForAccessToken = async () => {
    if (pageState) {
      changeIsLoading(false);
      await navigate("/", { state: pageState });
    }
    try {
      const accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      const accessToken = accessTokenResponse.data.main.access_token;
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        accessToken
      );
      const username = userDetailsResponse.data.main.username;
      const user_id = userDetailsResponse.data.main.user_id;
      const newState = {
        user: { user_id, username, access_token: accessToken },
      };
      changeIsLoading(false);
      setPageState(newState);
    } catch (e) {
      console.log("user not logged in.", e);
      changeIsLoading(false);
    }
  };

  const nullifyPageState = () => {
    setPageState(null);
  };
  const navigateToForgotPassword = async () => {
    await navigate("/forgotPassword", { state: { username } });
  };
  // useEffect
  React.useEffect(() => {
    checkForAccessToken();
  }, []);
  React.useEffect(() => {
    if (pageState) {
      navigate("/", { state: pageState });
    }
  }, [pageState]);
  // misc

  return (
    <Page
      user={pageState?.user}
      nullifyPageStateFunction={nullifyPageState}
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

import "../stylesheets/login.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, TextField, Typography } from "@mui/material";

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
  }
  // state
  const [pageState, setPageState] = React.useState<LoginState | null>(state);
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");

  // functions

  const handleLogin: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      let response = await authenticationAdministrationBL.loginUsernameV0(
        username,
        password
      );

      await navigate("/", {
        state: { user: { ...response["data"]["main"], username } },
      });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
        severity: "error",
      });
    }
  };

  const checkForAccessToken = async () => {
    if (pageState) {
      await navigate("/", { state: pageState });
    }
    try {
      let accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      let accessToken = accessTokenResponse.data.main.access_token;
      let userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        accessToken
      );
      let username =
        userDetailsResponse.data.main.profile.user_profile_username;
      let user_id = userDetailsResponse.data.main.user_id;
      let newState = { user: { user_id, username, access_token: accessToken } };
      setPageState(newState);
    } catch (e) {
      console.log("user not logged in.");
    }
  };

  const nullifyPageState = () => {
    setPageState(null);
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
      className="register-page"
    >
      <Typography variant="h4" component="h1">
        login
      </Typography>
      <form className="common-form" onSubmit={handleLogin}>
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
          uniqueIdForARIA="login-password"
          label="password"
          variant="outlined"
          others={{ required: true }}
        />

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

import "../stylesheets/register.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, TextField, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { RegisterState, RegisterStateZ } from "../types/pages/Register";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";

export const Head: HeadFC = () => (
  <title>{brandConfig.appName} | register</title>
);

const RegisterPage: React.FC<PageProps> = (props) => {
  const { location } = props;
  let state: RegisterState | null = null;
  try {
    state = RegisterStateZ.parse(location.state);
  } catch (e) {
    state = null;
  }

  // state
  const [pageState, setPageState] = React.useState<RegisterState | null>(state);
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const [isLoading, changeIsLoading] = React.useState<boolean>(true);
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");
  const [confirmPassword, changeConfirmPassword] = React.useState<string>("");
  const [adminPassword, changeAdminPassword] = React.useState<string>("");

  // functions

  const handleRegister: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        throw new Error("password and confirm password fields do not match.");
      }
      let response = await authenticationAdministrationBL.registerUsernameV0(
        username,
        password,
        adminPassword
      );

      await navigate("/", { state: { user: response["data"]["main"] } });
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
      changeIsLoading(false);
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
      changeIsLoading(false);
      setPageState(newState);
    } catch (e) {
      console.log("user not logged in.");
      changeIsLoading(false);
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
      isLoading={isLoading}
    >
      <Typography variant="h4" component="h1">
        register
      </Typography>
      <form className="common-form" onSubmit={handleRegister}>
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
          uniqueIdForARIA="register-password"
          label="password"
          variant="outlined"
          others={{ required: true }}
        />
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => changeConfirmPassword(e.target.value)}
          uniqueIdForARIA="confirm-register-password"
          label="confirm password"
          variant="outlined"
          others={{ required: true }}
        />
        <PasswordInput
          value={adminPassword}
          onChange={(e) => changeAdminPassword(e.target.value)}
          uniqueIdForARIA="register-admin-password"
          label="admin password"
          variant="outlined"
          others={{ required: true }}
        />
        <div className="register-form-action">
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

export default RegisterPage;

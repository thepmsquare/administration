import "../stylesheets/forgotPassword.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { GetUserRecoveryMethodsV0ResponseZ } from "squarecommonblhelper";
import { UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";

import { Button, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import {
  ForgotPasswordState,
  ForgotPasswordStateZ,
} from "../types/pages/ForgotPassword";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";

export const Head: HeadFC = () => (
  <title>{brandConfig.appName} | forgot password</title>
);

const ForgotPasswordPage: React.FC<PageProps> = (props) => {
  const { location } = props;
  let state: ForgotPasswordState | null = null;
  try {
    state = ForgotPasswordStateZ.parse(location.state);
  } catch (e) {
    state = null;
  }
  // state
  const [pageState, setPageState] = React.useState<ForgotPasswordState | null>(
    state
  );
  const [username, setUsername] = React.useState<string>(
    state && state.username ? state.username : ""
  );
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const [isLoading, changeIsLoading] = React.useState<boolean>(true);
  const [recoveryMethods, setRecoveryMethods] = React.useState<z.infer<
    typeof GetUserRecoveryMethodsV0ResponseZ.shape.data.shape.main
  > | null>(null);
  // functions
  const getRecoveryMethods = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let recoveryMethodsResponse =
        await authenticationCommonBL.getUserRecoveryMethodsV0(username);
      changeSnackbarState({
        isOpen: true,
        message: "recovery methods fetched successfully.",
        severity: "success",
      });
      setRecoveryMethods(recoveryMethodsResponse.data.main);
    } catch (e) {
      changeSnackbarState({
        isOpen: true,
        message: (e as any).message,
        severity: "error",
      });
    }
  };
  const checkForAccessToken = async () => {
    try {
      let accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      let accessToken = accessTokenResponse.data.main.access_token;
      let userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        accessToken
      );
      let username = userDetailsResponse.data.main.username;
      let user_id = userDetailsResponse.data.main.user_id;
      let newState = { user: { user_id, username, access_token: accessToken } };
      changeIsLoading(false);
      await navigate("/", { state: newState });
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

  // misc

  return (
    <Page
      user={undefined}
      nullifyPageStateFunction={nullifyPageState}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="register-page"
      isLoading={isLoading}
    >
      <Typography variant="h4" component="h1">
        forgot password
      </Typography>
      <form className="common-form" onSubmit={getRecoveryMethods}>
        <UsernameInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="username"
          uniqueIdForARIA="forgot-password-username-input"
          variant="outlined"
        />
        <Button type="submit" variant="contained">
          confirm
        </Button>
      </form>

      <Button color="inherit">
        <Link to="/login">cancel</Link>
      </Button>
      <Typography
        variant="body1"
        component="div"
        className="recovery-methods"
      ></Typography>
      {recoveryMethods && (
        <div>
          <Typography variant="h6" component="h2">
            recovery methods:
          </Typography>
          {recoveryMethods &&
            Object.entries(recoveryMethods).map(([key, value], index) => (
              <Typography key={index} variant="body1" component="div">
                {key}: {String(value)}
              </Typography>
            ))}
        </div>
      )}
    </Page>
  );
};

export default ForgotPasswordPage;

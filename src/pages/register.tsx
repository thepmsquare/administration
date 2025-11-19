import "../stylesheets/register.css";

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
  const [isLoading, changeIsLoading] = React.useState<boolean>(true);
  const [isSubmitting, changeIsSubmitting] = React.useState<boolean>(false);
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");
  const [confirmPassword, changeConfirmPassword] = React.useState<string>("");
  const [adminPassword, changeAdminPassword] = React.useState<string>("");

  // functions

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
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    } finally {
      changeIsSubmitting(false);
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

  // useEffect
  React.useEffect(() => {
    checkForAccessToken();
  }, []);

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
      <Typography variant="h4" component="h1">
        register
      </Typography>
      <form className="common-form" onSubmit={handleRegister}>
        <UsernameInput
          value={username}
          onChange={(e) => changeUsername(e.target.value)}
          label="username"
          uniqueIdForARIA="register-username"
          variant="outlined"
          others={{ required: true, disabled: isSubmitting }}
        />
        <PasswordInput
          value={password}
          onChange={(e) => changePassword(e.target.value)}
          uniqueIdForARIA="register-password"
          label="password"
          variant="outlined"
          others={{ required: true, disabled: isSubmitting }}
        />
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => changeConfirmPassword(e.target.value)}
          uniqueIdForARIA="confirm-register-password"
          label="confirm password"
          variant="outlined"
          others={{
            required: true,
            disabled: isSubmitting,
            error: confirmPassword.length > 0 && password !== confirmPassword,
          }}
        />
        <PasswordInput
          value={adminPassword}
          onChange={(e) => changeAdminPassword(e.target.value)}
          uniqueIdForARIA="register-admin-password"
          label="admin password"
          variant="outlined"
          others={{ required: true, disabled: isSubmitting }}
        />
        <div className="register-form-action">
          <Button color="inherit" disabled={isSubmitting}>
            <Link to="/">cancel</Link>
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "submitting..." : "submit"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default RegisterPage;

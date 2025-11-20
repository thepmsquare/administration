import "../stylesheets/forgotPassword.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { GetUserRecoveryMethodsV0ResponseZ } from "squarecommonblhelper";
import { UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";

import { Button, CircularProgress, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import {
  ForgotPasswordState,
  ForgotPasswordStateZ,
} from "../types/pages/ForgotPassword";
import { IndexStateZ } from "../types/pages/Index";
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
  } catch {
    state = null;
  }

  // state
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
  const [isFetchingRecovery, setIsFetchingRecovery] =
    React.useState<boolean>(false);
  const [recoveryMethods, setRecoveryMethods] = React.useState<z.infer<
    typeof GetUserRecoveryMethodsV0ResponseZ.shape.data.shape.main
  > | null>(null);

  // Ref to track component mount status
  const isMountedRef = React.useRef<boolean>(true);

  // Functions
  const getRecoveryMethods = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsFetchingRecovery(true);
    try {
      const recoveryMethodsResponse =
        await authenticationCommonBL.getUserRecoveryMethodsV0(username);

      if (isMountedRef.current) {
        changeSnackbarState({
          isOpen: true,
          message: "recovery methods fetched successfully.",
          severity: "success",
        });
        setRecoveryMethods(recoveryMethodsResponse.data.main);
      }
    } catch (e) {
      if (isMountedRef.current) {
        changeSnackbarState({
          isOpen: true,
          message: (e as Error).message,
          severity: "error",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsFetchingRecovery(false);
      }
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
      const newState = IndexStateZ.parse({
        user: { user_id, username, access_token: accessToken },
      });

      if (isMountedRef.current) {
        changeIsLoading(false);
        await navigate("/", { state: newState });
      }
    } catch {
      console.log("user not logged in:");
      if (isMountedRef.current) {
        changeIsLoading(false);
      }
    }
  };

  // useEffect
  React.useEffect(() => {
    checkForAccessToken();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <Page
      user={undefined}
      nullifyPageStateFunction={() => {}}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="forgot-password-page"
      isLoading={isLoading}
    >
      <Typography variant="h4" component="h1">
        forgot password
      </Typography>

      <form
        className="common-form"
        onSubmit={getRecoveryMethods}
        aria-label="Password recovery form"
      >
        <UsernameInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Username"
          uniqueIdForARIA="forgot-password-username-input"
          variant="outlined"
          others={{ required: true, disabled: isFetchingRecovery }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isFetchingRecovery || !username.trim()}
        >
          {isFetchingRecovery ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Loading...
            </>
          ) : (
            "confirm"
          )}
        </Button>
      </form>

      <Button color="inherit" disabled={isFetchingRecovery}>
        <Link to="/login">cancel</Link>
      </Button>

      {recoveryMethods && (
        <div
          className="recovery-methods-container"
          role="region"
          aria-label="Available recovery methods"
        >
          <Typography variant="h6" component="h2">
            recovery methods:
          </Typography>
          {Object.entries(recoveryMethods).map(([key, value], index) => (
            <Typography key={index} variant="body1" component="div">
              <strong>{key}:</strong> {String(value)}
            </Typography>
          ))}
        </div>
      )}
    </Page>
  );
};

export default ForgotPasswordPage;

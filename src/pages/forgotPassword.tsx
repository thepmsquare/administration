import "../stylesheets/forgotPassword.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import {
  GetUserRecoveryMethodsV0ResponseZ,
  RecoveryMethodEnum
} from "squarecommonblhelper";
import { PasswordInput, UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";

import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography
} from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import {
  ForgotPasswordState,
  ForgotPasswordStateZ
} from "../types/pages/ForgotPassword";
import { IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL
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
    state ? state.username : "",
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
  const [selectedMethod, setSelectedMethod] =
    React.useState<RecoveryMethodEnum | null>(null);

  const [emailResetPasswordCodeInput, setEmailResetPasswordCodeInput] =
    React.useState<string>("");
  const [emailResetNewPassword, setEmailResetNewPassword] =
    React.useState<string>("");
  const [emailResetLogoutOtherSessions, setEmailResetLogoutOtherSessions] =
    React.useState<boolean>(false);
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
      const userDetailsResponse =
        await authenticationCommonBL.getUserDetailsV0(accessToken);
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

  const handleClearRecoveryMethods = () => {
    setRecoveryMethods(null);
    setSelectedMethod(null);
    setUsername("");
    setEmailResetPasswordCodeInput("");
    setEmailResetNewPassword("");
    setEmailResetLogoutOtherSessions(false);
  };

  const handleSendPasswordResetEmail = async () => {
    try {
      await authenticationCommonBL.sendResetPasswordEmailV0(username);
      if (isMountedRef.current) {
        changeSnackbarState({
          isOpen: true,
          message: "password reset email sent successfully.",
          severity: "success",
        });
      }
    } catch (e) {
      if (isMountedRef.current) {
        changeSnackbarState({
          isOpen: true,
          message: (e as Error).message,
          severity: "error",
        });
      }
    }
  };

  const handleEmailRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const recoveryMethodsResponse =
        await authenticationAdministrationBL.resetPasswordAndLoginUsingResetEmailCodeV0(
          emailResetPasswordCodeInput,
          username,
          emailResetNewPassword,
          emailResetLogoutOtherSessions,
        );

      // redirect to homepage
      const indexState = IndexStateZ.parse({
        user: {
          user_id: recoveryMethodsResponse.data.main.user_id,
          username: username,
          access_token: recoveryMethodsResponse.data.main.access_token,
        },
      });

      await navigate("/", { state: indexState });
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
          others={{
            required: true,
            disabled: isFetchingRecovery || recoveryMethods !== null,
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={
            isFetchingRecovery || !username.trim() || recoveryMethods !== null
          }
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
        <Button
          color="inherit"
          disabled={isFetchingRecovery}
          onClick={handleClearRecoveryMethods}
        >
          clear
        </Button>
        <Button color="inherit" disabled={isFetchingRecovery}>
          <Link to="/login">cancel</Link>
        </Button>
      </form>

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
            <div key={index}>
              <Typography variant="body1">
                <strong>{key}:</strong> {String(value)}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  console.log(`Selected method: ${key}, value: ${value}`);
                  setSelectedMethod(key as RecoveryMethodEnum);
                }}
                disabled={isFetchingRecovery || !value}
                sx={{ mt: 1 }}
              >
                Use this method
              </Button>
            </div>
          ))}
          {selectedMethod === "EMAIL" && (
            <>
              <Typography sx={{ mt: 2 }}>
                You selected: {selectedMethod}
              </Typography>
              <Button onClick={handleSendPasswordResetEmail}>
                send code on email
              </Button>
              <form
                onSubmit={handleEmailRecoverySubmit}
                className="common-form"
              >
                <TextField
                  label="code"
                  value={emailResetPasswordCodeInput}
                  onChange={(e) => {
                    setEmailResetPasswordCodeInput(e.target.value);
                  }}
                />
                <PasswordInput
                  value={emailResetNewPassword}
                  onChange={(e) => {
                    setEmailResetNewPassword(e.target.value);
                  }}
                  label="new password"
                  uniqueIdForARIA="new password"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={emailResetLogoutOtherSessions}
                      onChange={() => {
                        setEmailResetLogoutOtherSessions(
                          !emailResetLogoutOtherSessions,
                        );
                      }}
                    />
                  }
                  label="logout other sessions"
                />

                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </form>
            </>
          )}
          {selectedMethod === "BACKUP_CODE" && (
            <Typography sx={{ mt: 2 }}>
              You selected: {selectedMethod}
            </Typography>
          )}
        </div>
      )}
    </Page>
  );
};

export default ForgotPasswordPage;

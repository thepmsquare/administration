import "../stylesheets/forgotPassword.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Box, Paper, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
} from "../utils/initialiser";
import { useAuth } from "../utils/auth";
import { useServerCheck } from "../context/serverCheck";
import { isNetworkError } from "../utils/networkError";

import EmailRecoveryPanel from "../components/forgotPassword/EmailRecoveryPanel";

export const Head: HeadFC = () => (
  <title>{brandConfig.appName} | recover password</title>
);

const PasswordRecoveryPage: React.FC<PageProps> = (props) => {
  const { location } = props;

  const params = new URLSearchParams(location.search);
  const code = params.get("code") || "";
  const username = params.get("username") || "";

  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const triggerServerCheck = useServerCheck();
  const { isLoading } = useAuth(null, { redirectIfLoggedIn: "/" }, triggerServerCheck);
  const [isResetting, setIsResetting] = React.useState<boolean>(false);
  const [newPassword, setNewPassword] = React.useState<string>("");
  const [logoutOtherSessions, setLogoutOtherSessions] =
    React.useState<boolean>(false);

  // functions
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !code) {
      changeSnackbarState({
        isOpen: true,
        message: "invalid recovery link. please request a new one.",
        severity: "error",
      });
      return;
    }
    setIsResetting(true);
    try {
      const response =
        await authenticationAdministrationBL.resetPasswordAndLoginUsingResetEmailCodeV0(
          code,
          username,
          newPassword,
          logoutOtherSessions,
        );
      const indexState = IndexStateZ.parse({
        user: {
          user_id: response.data.main.user_id,
          username: username,
          access_token: response.data.main.access_token,
        },
      });
      await navigate("/", { state: indexState! });
    } catch (e) {
      if (isNetworkError(e)) {
        triggerServerCheck();
      } else {
        changeSnackbarState({
          isOpen: true,
          message: (e as Error).message,
          severity: "error",
        });
      }
    } finally {
      setIsResetting(false);
    }
  };

  if (!username || !code) {
    return (
      <Page
        user={undefined}
        nullifyPageStateFunction={() => {}}
        snackbarState={snackbarState}
        changeSnackbarState={changeSnackbarState}
        className="forgot-password-page"
        isLoading={isLoading}
      >
        <div className="fp-outer" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Paper className="fp-card" elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" color="error" gutterBottom>
              invalid link
            </Typography>
            <Typography variant="body1" color="text.secondary">
              the recovery link is invalid or expired. please request a new one.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <button 
                onClick={() => navigate("/forgotPassword")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary-main)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "inherit"
                }}
              >
                go back to forgot password
              </button>
            </Box>
          </Paper>
        </div>
      </Page>
    );
  }

  return (
    <Page
      user={undefined}
      nullifyPageStateFunction={() => {}}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="forgot-password-page"
      isLoading={isLoading}
    >
      <div className="fp-outer" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper className="fp-card" elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" className="fp-title" align="center" gutterBottom>
            recover password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            you are resetting the password for <strong>{username}</strong>
          </Typography>

          <EmailRecoveryPanel
            isFetchingRecovery={isResetting}
            isSendingEmail={false}
            isInCooldown={false}
            remainingCooldown={0}
            expiresAt={null}
            codeInput={code}
            newPassword={newPassword}
            logoutOtherSessions={logoutOtherSessions}
            onSendEmail={() => {}}
            onCodeChange={() => {}}
            onNewPasswordChange={(e) => setNewPassword(e.target.value)}
            onLogoutToggle={() => setLogoutOtherSessions(!logoutOtherSessions)}
            onSubmit={handleResetSubmit}
            formatTime={() => ""}
            isDirectReset={true}
          />
        </Paper>
      </div>
    </Page>
  );
};

export default PasswordRecoveryPage;

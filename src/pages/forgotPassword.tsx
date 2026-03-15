import "../stylesheets/forgotPassword.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import {
  GetUserRecoveryMethodsV0ResponseZ,
  RecoveryMethodEnum,
} from "squarecommonblhelper";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";

import { Alert, Box, Divider, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";
import squareConfig from "../config/square";
import { useAuth } from "../utils/auth";
import { useServerCheck } from "../context/serverCheck";
import { isNetworkError } from "../utils/networkError";

import UsernameStep from "../components/forgotPassword/UsernameStep";
import LockedUsernameRow from "../components/forgotPassword/LockedUsernameRow";
import EmailRecoveryPanel from "../components/forgotPassword/EmailRecoveryPanel";
import BackupCodeRecoveryPanel from "../components/forgotPassword/BackupCodeRecoveryPanel";
import { Paper } from "@mui/material";

export const Head: HeadFC = () => (
  <title>{brandConfig.appName} | forgot password</title>
);

const ForgotPasswordPage: React.FC<PageProps> = (props) => {
  const { location } = props;

  const params = new URLSearchParams(location.search);
  const stateUsername = params.get("username");

  // ── state ─────────────────────────────────────────────────────────────────
  const [username, setUsername] = React.useState<string>(
    stateUsername ? stateUsername : "",
  );
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const triggerServerCheck = useServerCheck();
  const { isLoading } = useAuth(null, { redirectIfLoggedIn: "/" }, triggerServerCheck);
  const [isFetchingRecovery, setIsFetchingRecovery] =
    React.useState<boolean>(false);
  const [recoveryMethods, setRecoveryMethods] = React.useState<z.infer<
    typeof GetUserRecoveryMethodsV0ResponseZ.shape.data.shape.main
  > | null>(null);
  const [backupCodeDetails, setBackupCodeDetails] = React.useState<z.infer<
    typeof GetUserRecoveryMethodsV0ResponseZ.shape.data.shape.backup_code_details
  > | null>(null);

  const [emailResetPasswordCodeInput, setEmailResetPasswordCodeInput] =
    React.useState<string>("");
  const [emailResetNewPassword, setEmailResetNewPassword] =
    React.useState<string>("");
  const [emailResetLogoutOtherSessions, setEmailResetLogoutOtherSessions] =
    React.useState<boolean>(false);

  // ── cooldown ──────────────────────────────────────────────────────────────
  const [cooldownResetAt, setCooldownResetAt] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);
  const [remainingCooldown, setRemainingCooldown] = React.useState<number>(0);
  const [isSendingEmail, setIsSendingEmail] = React.useState<boolean>(false);

  // ── backup code ───────────────────────────────────────────────────────────
  const [backupCodeResetPasswordCodeInput, setBackupCodeResetPasswordCodeInput] =
    React.useState<string>("");
  const [backupCodeResetNewPassword, setBackupCodeResetNewPassword] =
    React.useState<string>("");
  const [backupCodeResetLogoutOtherSessions, setBackupCodeResetLogoutOtherSessions] =
    React.useState<boolean>(false);

  const [lookupError, setLookupError] = React.useState<string | null>(null);
  const isMountedRef = React.useRef<boolean>(true);

  // ── helpers ───────────────────────────────────────────────────────────────
  const calculateRemainingCooldown = (cooldownResetAt: string): number => {
    const cooldownTime = new Date(cooldownResetAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((cooldownTime - now) / 1000));
    return remaining;
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  const isInCooldown = !!(cooldownResetAt && remainingCooldown > 0);

  // ── functions ─────────────────────────────────────────────────────────────
  const getRecoveryMethods = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsFetchingRecovery(true);
    try {
      const recoveryMethodsResponse =
        await authenticationCommonBL.getUserRecoveryMethodsV0(username);
      navigate(`/forgotPassword?username=${username}`, { replace: true });
      if (isMountedRef.current) {
        setLookupError(null);
        changeSnackbarState({
          isOpen: true,
          message: "recovery methods fetched successfully.",
          severity: "success",
        });
        setRecoveryMethods(recoveryMethodsResponse.data.main);
        setBackupCodeDetails(recoveryMethodsResponse.data.backup_code_details);
        if (recoveryMethodsResponse.data.email_recovery_details) {
          setCooldownResetAt(recoveryMethodsResponse.data.email_recovery_details.cooldown_reset_at);
          setExpiresAt(recoveryMethodsResponse.data.email_recovery_details.expires_at);
          setRemainingCooldown(calculateRemainingCooldown(recoveryMethodsResponse.data.email_recovery_details.cooldown_reset_at));
        }
      }
    } catch (e) {
      if (isMountedRef.current) {
        if (isNetworkError(e)) {
          triggerServerCheck();
        } else {
          const msg = (e as Error).message;
          setLookupError(msg);
          changeSnackbarState({ isOpen: true, message: msg, severity: "error" });
        }
      }
    } finally {
      if (isMountedRef.current) setIsFetchingRecovery(false);
    }
  };

  const handleClearRecoveryMethods = () => {
    setRecoveryMethods(null);
    setUsername("");
    setLookupError(null);
    setEmailResetPasswordCodeInput("");
    setEmailResetNewPassword("");
    setEmailResetLogoutOtherSessions(false);
    setCooldownResetAt(null);
    setExpiresAt(null);
    setRemainingCooldown(0);
    setBackupCodeResetPasswordCodeInput("");
    setBackupCodeResetNewPassword("");
    setBackupCodeResetLogoutOtherSessions(false);
    setBackupCodeDetails(null);
    navigate("/forgotPassword", { replace: true });
  };

  const handleSendPasswordResetEmail = async () => {
    if (cooldownResetAt) {
      const remaining = calculateRemainingCooldown(cooldownResetAt);
      if (remaining > 0) {
        changeSnackbarState({
          isOpen: true,
          message: `Please wait ${formatTime(remaining)} before requesting another code.`,
          severity: "warning",
        });
        return;
      }
    }
    setIsSendingEmail(true);
    try {
      const response = await authenticationCommonBL.sendResetPasswordEmailV0(username);
      if (isMountedRef.current && response.data) {
        setCooldownResetAt(response.data.cooldown_reset_at);
        setExpiresAt(response.data.expires_at);
        setRemainingCooldown(calculateRemainingCooldown(response.data.cooldown_reset_at));
        changeSnackbarState({
          isOpen: true,
          message: "Password reset email sent successfully. Check your inbox.",
          severity: "success",
        });
      }
    } catch (e) {
      if (isMountedRef.current) {
        if (isNetworkError(e)) {
          triggerServerCheck();
        } else {
          changeSnackbarState({ isOpen: true, message: (e as Error).message, severity: "error" });
        }
      }
    } finally {
      if (isMountedRef.current) setIsSendingEmail(false);
    }
  };

  const handleEmailRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFetchingRecovery(true);
    try {
      const recoveryMethodsResponse =
        await authenticationAdministrationBL.resetPasswordAndLoginUsingResetEmailCodeV0(
          emailResetPasswordCodeInput,
          username,
          emailResetNewPassword,
          emailResetLogoutOtherSessions,
        );
      const indexState = IndexStateZ.parse({
        user: {
          user_id: recoveryMethodsResponse.data.main.user_id,
          username: username,
          access_token: recoveryMethodsResponse.data.main.access_token,
        },
      });
      await navigate("/", { state: indexState! });
      setEmailResetNewPassword("");
      setEmailResetPasswordCodeInput("");
    } catch (e) {
      if (isMountedRef.current) {
        if (isNetworkError(e)) {
          triggerServerCheck();
        } else {
          changeSnackbarState({ isOpen: true, message: (e as Error).message, severity: "error" });
        }
      }
    } finally {
      if (isMountedRef.current) setIsFetchingRecovery(false);
    }
  };

  const handleBackupCodesRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFetchingRecovery(true);
    try {
      const recoveryMethodsResponse =
        await authenticationAdministrationBL.resetPasswordAndLoginUsingBackupCodeV0(
          backupCodeResetPasswordCodeInput,
          username,
          backupCodeResetNewPassword,
          backupCodeResetLogoutOtherSessions,
        );
      const indexState = IndexStateZ.parse({
        user: {
          user_id: recoveryMethodsResponse.data.main.user_id,
          username: username,
          access_token: recoveryMethodsResponse.data.main.access_token,
        },
      });
      await navigate("/", { state: indexState! });
      setBackupCodeResetNewPassword("");
      setBackupCodeResetPasswordCodeInput("");
    } catch (e) {
      if (isMountedRef.current) {
        if (isNetworkError(e)) {
          triggerServerCheck();
        } else {
          changeSnackbarState({ isOpen: true, message: (e as Error).message, severity: "error" });
        }
      }
    } finally {
      if (isMountedRef.current) setIsFetchingRecovery(false);
    }
  };

  // ── effects ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!cooldownResetAt) return;
    const interval = setInterval(() => {
      const remaining = calculateRemainingCooldown(cooldownResetAt);
      setRemainingCooldown(remaining);
      if (remaining <= 0) { setCooldownResetAt(null); clearInterval(interval); }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownResetAt]);

  React.useEffect(() => {
    if (stateUsername) getRecoveryMethods();
    return () => { isMountedRef.current = false; };
  }, []);

  // ── derived ───────────────────────────────────────────────────────────────
  const hasEmailRecovery = recoveryMethods?.EMAIL === true;
  const hasBackupCodeRecovery = recoveryMethods?.BACKUP_CODE === true;
  const hasAnyRecoveryMethod = hasEmailRecovery || hasBackupCodeRecovery;
  const methodsWereFetched = recoveryMethods !== null;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <Page
      user={undefined}
      nullifyPageStateFunction={() => {}}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="forgot-password-page"
      isLoading={isLoading}
    >
      <div className="fp-outer">
        <Paper className="fp-card" elevation={3}>
          <Typography variant="h5" component="h1" className="fp-title">
            forgot password
          </Typography>

          {!methodsWereFetched ? (
            <UsernameStep
              username={username}
              isFetchingRecovery={isFetchingRecovery}
              lookupError={lookupError}
              onUsernameChange={setUsername}
              onSubmit={getRecoveryMethods}
              onClearLookupError={() => setLookupError(null)}
            />
          ) : (
            <LockedUsernameRow
              username={username}
              onClear={handleClearRecoveryMethods}
            />
          )}

          {methodsWereFetched && (
            <>
              <Divider sx={{ my: 2 }} />

              {!hasAnyRecoveryMethod ? (
                <Alert severity="warning" className="fp-no-methods-alert">
                  <Typography variant="body1" fontWeight={500}>
                    no recovery methods active
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    This account has no active recovery methods set up. Please
                    contact support at{" "}
                    <a
                      href={`mailto:${squareConfig.supportEmail}`}
                      style={{ color: "inherit", fontWeight: 700 }}
                    >
                      {squareConfig.supportEmail}
                    </a>
                    .
                  </Typography>
                </Alert>
              ) : (
                <div className="fp-methods-list">
                  {hasEmailRecovery && (
                    <EmailRecoveryPanel
                      isFetchingRecovery={isFetchingRecovery}
                      isSendingEmail={isSendingEmail}
                      isInCooldown={isInCooldown}
                      remainingCooldown={remainingCooldown}
                      expiresAt={expiresAt}
                      codeInput={emailResetPasswordCodeInput}
                      newPassword={emailResetNewPassword}
                      logoutOtherSessions={emailResetLogoutOtherSessions}
                      onSendEmail={handleSendPasswordResetEmail}
                      onCodeChange={setEmailResetPasswordCodeInput}
                      onNewPasswordChange={(e) => setEmailResetNewPassword(e.target.value)}
                      onLogoutToggle={() => setEmailResetLogoutOtherSessions(!emailResetLogoutOtherSessions)}
                      onSubmit={handleEmailRecoverySubmit}
                      formatTime={formatTime}
                    />
                  )}

                  {hasBackupCodeRecovery && (
                    <BackupCodeRecoveryPanel
                      isFetchingRecovery={isFetchingRecovery}
                      backupCodeDetails={backupCodeDetails}
                      codeInput={backupCodeResetPasswordCodeInput}
                      newPassword={backupCodeResetNewPassword}
                      logoutOtherSessions={backupCodeResetLogoutOtherSessions}
                      onCodeChange={(e) => setBackupCodeResetPasswordCodeInput(e.target.value)}
                      onNewPasswordChange={(e) => setBackupCodeResetNewPassword(e.target.value)}
                      onLogoutToggle={() => setBackupCodeResetLogoutOtherSessions(!backupCodeResetLogoutOtherSessions)}
                      onSubmit={handleBackupCodesRecoverySubmit}
                    />
                  )}
                </div>
              )}

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  remembered your password?{" "}
                  <Link to="/login" className="fp-link">
                    sign in
                  </Link>
                </Typography>
              </Box>
            </>
          )}

          {!methodsWereFetched && (
            <Box sx={{ mt: 1, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                remembered your password?{" "}
                <Link to="/login" className="fp-link">
                  sign in
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </div>
    </Page>
  );
};

export default ForgotPasswordPage;

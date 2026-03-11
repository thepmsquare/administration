import "../stylesheets/forgotPassword.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import {
  GetUserRecoveryMethodsV0ResponseZ,
  RecoveryMethodEnum,
} from "squarecommonblhelper";
import { PasswordInput, UsernameInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import EditIcon from "@mui/icons-material/Edit";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";
import squareConfig from "../config/square";
import { useAuth } from "../utils/auth";

export const Head: HeadFC = () => (
  <title>{brandConfig.appName} | forgot password</title>
);

const ForgotPasswordPage: React.FC<PageProps> = (props) => {
  const { location } = props;

  const params = new URLSearchParams(location.search);
  const stateUsername = params.get("username");

  // state
  const [username, setUsername] = React.useState<string>(
    stateUsername ? stateUsername : "",
  );
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const { isLoading } = useAuth(null, { redirectIfLoggedIn: "/" });
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

  // Cooldown state
  const [cooldownResetAt, setCooldownResetAt] = React.useState<string | null>(
    null,
  );
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);
  const [remainingCooldown, setRemainingCooldown] = React.useState<number>(0);
  const [isSendingEmail, setIsSendingEmail] = React.useState<boolean>(false);
  // backup code state
  const [
    backupCodeResetPasswordCodeInput,
    setBackupCodeResetPasswordCodeInput,
  ] = React.useState<string>("");
  const [backupCodeResetNewPassword, setBackupCodeResetNewPassword] =
    React.useState<string>("");
  const [
    backupCodeResetLogoutOtherSessions,
    setBackupCodeResetLogoutOtherSessions,
  ] = React.useState<boolean>(false);

  // Persistent error state for account lookup failure
  const [lookupError, setLookupError] = React.useState<string | null>(null);

  // Ref to track component mount status
  const isMountedRef = React.useRef<boolean>(true);

  // Functions
  const getRecoveryMethods = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setIsFetchingRecovery(true);

    try {
      const recoveryMethodsResponse =
        await authenticationCommonBL.getUserRecoveryMethodsV0(username);
      navigate(`/forgotPassword?username=${username}`, {
        replace: true,
      });
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
          setCooldownResetAt(
            recoveryMethodsResponse.data.email_recovery_details
              .cooldown_reset_at,
          );
          setExpiresAt(
            recoveryMethodsResponse.data.email_recovery_details.expires_at,
          );
          const remaining = calculateRemainingCooldown(
            recoveryMethodsResponse.data.email_recovery_details
              .cooldown_reset_at,
          );
          setRemainingCooldown(remaining);
        }
      }
    } catch (e) {
      if (isMountedRef.current) {
        const msg = (e as Error).message;
        setLookupError(msg);
        changeSnackbarState({
          isOpen: true,
          message: msg,
          severity: "error",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsFetchingRecovery(false);
      }
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
    // clear URL param without reload
    navigate("/forgotPassword", { replace: true });
  };

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

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const handleSendPasswordResetEmail = async () => {
    // Check if still in cooldown
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
      const response =
        await authenticationCommonBL.sendResetPasswordEmailV0(username);

      if (isMountedRef.current && response.data) {
        // Store cooldown and expiration times
        setCooldownResetAt(response.data.cooldown_reset_at);
        setExpiresAt(response.data.expires_at);

        // Calculate initial remaining time
        const remaining = calculateRemainingCooldown(
          response.data.cooldown_reset_at,
        );
        setRemainingCooldown(remaining);

        changeSnackbarState({
          isOpen: true,
          message: "Password reset email sent successfully. Check your inbox.",
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
    } finally {
      if (isMountedRef.current) {
        setIsSendingEmail(false);
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

      await navigate("/", { state: indexState! });
      setEmailResetNewPassword("");
      setEmailResetPasswordCodeInput("");
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

  const handleBackupCodesRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const recoveryMethodsResponse =
        await authenticationAdministrationBL.resetPasswordAndLoginUsingBackupCodeV0(
          backupCodeResetPasswordCodeInput,
          username,
          backupCodeResetNewPassword,
          backupCodeResetLogoutOtherSessions,
        );

      // redirect to homepage
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

  // useEffect for cooldown countdown
  React.useEffect(() => {
    if (!cooldownResetAt) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingCooldown(cooldownResetAt);
      setRemainingCooldown(remaining);

      // Clear cooldown when time is up
      if (remaining <= 0) {
        setCooldownResetAt(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownResetAt]);

  // useEffect
  React.useEffect(() => {
    if (stateUsername) {
      getRecoveryMethods();
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isInCooldown = !!(cooldownResetAt && remainingCooldown > 0);

  // Derive available methods from recoveryMethods object
  const hasEmailRecovery = recoveryMethods?.EMAIL === true;
  const hasBackupCodeRecovery = recoveryMethods?.BACKUP_CODE === true;
  const hasAnyRecoveryMethod = hasEmailRecovery || hasBackupCodeRecovery;
  const methodsWereFetched = recoveryMethods !== null;

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
          {/* Header */}
          <Typography variant="h5" component="h1" className="fp-title">
            forgot password
          </Typography>

          {/* Step 1: Username lookup */}
          {!methodsWereFetched ? (
            <form
              className="common-form"
              onSubmit={getRecoveryMethods}
              aria-label="Password recovery form"
            >
              <UsernameInput
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (lookupError) setLookupError(null);
                }}
                label="username"
                uniqueIdForARIA="forgot-password-username-input"
                variant="outlined"
                others={{ required: true, disabled: isFetchingRecovery }}
              />

              {/* Persistent lookup error */}
              {lookupError && (
                <Alert severity="error" onClose={() => setLookupError(null)}>
                  {lookupError}
                </Alert>
              )}

              <div className="fp-form-actions">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isFetchingRecovery || !username.trim()}
                  startIcon={
                    isFetchingRecovery ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : undefined
                  }
                >
                  {isFetchingRecovery ? "looking up…" : "find account"}
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  color="inherit"
                  disabled={isFetchingRecovery}
                >
                  cancel
                </Button>
              </div>
            </form>
          ) : (
            /* Locked username row */
            <div className="fp-username-locked">
              <Typography
                variant="body2"
                color="text.secondary"
                className="fp-username-label"
              >
                account
              </Typography>
              <Typography variant="body1" className="fp-username-value">
                {username}
              </Typography>
              <Tooltip title="Change username">
                <IconButton
                  size="small"
                  onClick={handleClearRecoveryMethods}
                  aria-label="change username"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          )}

          {/* Step 2: Recovery methods */}
          {methodsWereFetched && (
            <>
              <Divider sx={{ my: 2 }} />

              {!hasAnyRecoveryMethod ? (
                /* No recovery methods available */
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
                  {/* EMAIL RECOVERY */}
                  {hasEmailRecovery && (
                    <Paper
                      variant="outlined"
                      className="fp-method-panel"
                      aria-label="Email recovery"
                    >
                      <div className="fp-method-header">
                        <EmailOutlinedIcon
                          fontSize="small"
                          color="primary"
                          aria-hidden="true"
                        />
                        <Typography variant="h6" component="h2">
                          email recovery
                        </Typography>
                      </div>

                      {/* Cooldown Alert */}
                      {isInCooldown && (
                        <Alert severity="info" sx={{ mb: 1.5 }}>
                          A reset code was recently sent. You can request
                          another in{" "}
                          <strong>{formatTime(remainingCooldown)}</strong>.
                        </Alert>
                      )}

                      {/* Expiration Alert */}
                      {expiresAt && (
                        <Alert severity="warning" sx={{ mb: 1.5 }}>
                          Your reset code expires at{" "}
                          <strong>
                            {new Date(expiresAt).toLocaleTimeString()}
                          </strong>
                          .
                        </Alert>
                      )}

                      <Button
                        onClick={handleSendPasswordResetEmail}
                        disabled={isSendingEmail || isInCooldown}
                        variant="outlined"
                        size="small"
                        startIcon={
                          isSendingEmail ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : undefined
                        }
                        sx={{ mb: 2 }}
                      >
                        {isSendingEmail
                          ? "sending…"
                          : isInCooldown
                            ? `resend in ${formatTime(remainingCooldown)}`
                            : "send reset code"}
                      </Button>

                      <form
                        onSubmit={handleEmailRecoverySubmit}
                        className="common-form"
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          reset code
                        </Typography>
                        <MuiOtpInput
                          value={emailResetPasswordCodeInput}
                          onChange={(value) => {
                            setEmailResetPasswordCodeInput(value);
                          }}
                          length={squareConfig.resetPasswordOTPLength}
                          TextFieldsProps={{
                            size: "small",
                            required: true,
                          }}
                        />
                        <PasswordInput
                          value={emailResetNewPassword}
                          onChange={(e) => {
                            setEmailResetNewPassword(e.target.value);
                          }}
                          label="new password"
                          uniqueIdForARIA="email-recovery-new-password"
                          variant="outlined"
                          fullWidth
                          others={{ required: true }}
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
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              log out other sessions
                            </Typography>
                          }
                        />
                        <Button type="submit" variant="contained">
                          reset password
                        </Button>
                      </form>
                    </Paper>
                  )}

                  {/* BACKUP CODE RECOVERY */}
                  {hasBackupCodeRecovery && (
                    <Paper
                      variant="outlined"
                      className="fp-method-panel"
                      aria-label="Backup code recovery"
                    >
                      <div className="fp-method-header">
                        <VpnKeyOutlinedIcon
                          fontSize="small"
                          color="primary"
                          aria-hidden="true"
                        />
                        <Typography variant="h6" component="h2">
                          backup code
                        </Typography>
                      </div>

                      {backupCodeDetails && backupCodeDetails.available > 0 ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <strong>{backupCodeDetails.available}</strong> of{" "}
                          <strong>{backupCodeDetails.total}</strong> codes
                          remaining · generated on{" "}
                          {new Date(
                            backupCodeDetails.generated_at,
                          ).toLocaleDateString()}
                        </Alert>
                      ) : (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          no backup codes available. please use another recovery
                          method.
                        </Alert>
                      )}

                      <form
                        onSubmit={handleBackupCodesRecoverySubmit}
                        className="common-form"
                      >
                        <TextField
                          label="backup code"
                          value={backupCodeResetPasswordCodeInput}
                          onChange={(e) => {
                            setBackupCodeResetPasswordCodeInput(e.target.value);
                          }}
                          required
                          fullWidth
                          size="small"
                          disabled={
                            !backupCodeDetails ||
                            backupCodeDetails.available === 0
                          }
                        />
                        <PasswordInput
                          value={backupCodeResetNewPassword}
                          onChange={(e) => {
                            setBackupCodeResetNewPassword(e.target.value);
                          }}
                          label="new password"
                          uniqueIdForARIA="backup-code-new-password"
                          variant="outlined"
                          fullWidth
                          others={{
                            required: true,
                            disabled:
                              !backupCodeDetails ||
                              backupCodeDetails.available === 0,
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={backupCodeResetLogoutOtherSessions}
                              onChange={() => {
                                setBackupCodeResetLogoutOtherSessions(
                                  !backupCodeResetLogoutOtherSessions,
                                );
                              }}
                              size="small"
                              disabled={
                                !backupCodeDetails ||
                                backupCodeDetails.available === 0
                              }
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              color={
                                !backupCodeDetails ||
                                backupCodeDetails.available === 0
                                  ? "text.disabled"
                                  : "text.primary"
                              }
                            >
                              log out other sessions
                            </Typography>
                          }
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={
                            !backupCodeDetails ||
                            backupCodeDetails.available === 0
                          }
                        >
                          reset password
                        </Button>
                      </form>
                    </Paper>
                  )}
                </div>
              )}

              {/* Back to login link */}
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

          {/* Back to login when pre-lookup */}
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

import * as React from "react";
import { PasswordInput } from "squarecomponents";
import { MuiOtpInput } from "mui-one-time-password-input";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import Button from "@mui/material/Button";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";
import squareConfig from "../../config/square";

type Props = {
  isFetchingRecovery: boolean;
  isSendingEmail: boolean;
  isInCooldown: boolean;
  remainingCooldown: number;
  expiresAt: string | null;
  codeInput: string;
  newPassword: string;
  logoutOtherSessions: boolean;
  onSendEmail: () => void;
  onCodeChange: (value: string) => void;
  onNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoutToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formatTime: (seconds: number) => string;
  isDirectReset?: boolean;
};

const EmailRecoveryPanel: React.FC<Props> = ({
  isFetchingRecovery,
  isSendingEmail,
  isInCooldown,
  remainingCooldown,
  expiresAt,
  codeInput,
  newPassword,
  logoutOtherSessions,
  onSendEmail,
  onCodeChange,
  onNewPasswordChange,
  onLogoutToggle,
  onSubmit,
  formatTime,
  isDirectReset = false,
}) => {
  return (
    <Paper
      variant="outlined"
      className="fp-method-panel"
      aria-label="Email recovery"
      sx={isDirectReset ? { border: "none", p: 0, bgcolor: "transparent" } : {}}
    >
      {!isDirectReset && (
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
      )}

      {isDirectReset && (
        <Alert
          severity="success"
          icon={<MarkEmailReadOutlinedIcon fontSize="inherit" />}
          sx={{
            mb: 3,
            border: "1px solid",
            borderColor: "success.light",
            "& .MuiAlert-message": {
              fontWeight: 500,
              color: "success.dark",
            },
          }}
        >
          reset code automatically applied from email
        </Alert>
      )}

      {!isDirectReset && (
        <>
          {isInCooldown && (
            <Alert severity="info" sx={{ mb: 1.5 }}>
              A reset code was recently sent. You can request another in{" "}
              <strong>{formatTime(remainingCooldown)}</strong>.
            </Alert>
          )}

          {expiresAt && (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Your reset code expires at{" "}
              <strong>{new Date(expiresAt).toLocaleTimeString()}</strong>.
            </Alert>
          )}

          <Button
            onClick={onSendEmail}
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
        </>
      )}

      <form
        onSubmit={onSubmit}
        className="common-form"
        aria-label="email recovery form"
      >
        {!isDirectReset && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              reset code
            </Typography>
            <MuiOtpInput
              value={codeInput}
              onChange={onCodeChange}
              length={squareConfig.resetPasswordOTPLength}
              gap={1}
              TextFieldsProps={{
                size: "small",
                required: true,
                disabled: isFetchingRecovery,
                autoComplete: "one-time-code",
                sx: {
                  "& .MuiInputBase-input": {
                    padding: "8px 4px",
                  },
                },
              }}
            />
          </>
        )}
        <PasswordInput
          value={newPassword}
          onChange={onNewPasswordChange}
          label="new password"
          uniqueIdForARIA="email-recovery-new-password"
          variant="outlined"
          fullWidth
          autoComplete="new-password"
          others={{
            required: true,
            disabled: isFetchingRecovery,
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={logoutOtherSessions}
              onChange={onLogoutToggle}
              size="small"
              disabled={isFetchingRecovery}
            />
          }
          label={
            <Typography variant="body2">log out other sessions</Typography>
          }
        />
        <Button
          type="submit"
          variant={"contained" as any}
          disabled={isFetchingRecovery}
          fullWidth
          startIcon={
            isFetchingRecovery ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isFetchingRecovery ? "resetting…" : "reset password"}
        </Button>
      </form>
    </Paper>
  );
};

export default EmailRecoveryPanel;

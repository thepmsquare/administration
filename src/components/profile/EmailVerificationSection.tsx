import * as React from "react";
import { z } from "zod";
import { GetUserDetailsV0ResponseZ } from "squarecommonblhelper";
import { MuiOtpInput } from "mui-one-time-password-input";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import Button from "@mui/material/Button";
import {
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import squareConfig from "../../config/square";

type UserDetails = z.infer<
  typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
>;

type Props = {
  userDetails: UserDetails | null;
  emailVerificationCode: string;
  isVerifyingEmail: boolean;
  isInCooldown: boolean;
  remainingCooldown: number;
  expiresAt: string | null;
  onEmailVerificationCodeChange: (value: string) => void;
  onSendVerificationEmail: () => void;
  onEmailVerificationSubmit: (e: React.FormEvent) => void;
  formatTime: (seconds: number) => string;
};

const EmailVerificationSection: React.FC<Props> = ({
  userDetails,
  emailVerificationCode,
  isVerifyingEmail,
  isInCooldown,
  remainingCooldown,
  expiresAt,
  onEmailVerificationCodeChange,
  onSendVerificationEmail,
  onEmailVerificationSubmit,
  formatTime,
}) => {
  if (
    !userDetails?.profile.user_profile_email ||
    userDetails?.profile.user_profile_email_verified
  ) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      className="profile-section-card"
      component="section"
      aria-labelledby="verify-email-title"
    >
      <div className="profile-section-header">
        <MarkEmailUnreadOutlinedIcon
          fontSize="small"
          color="warning"
          aria-hidden="true"
        />
        <Typography variant="h6" component="h2" id="verify-email-title">
          verify email
        </Typography>
      </div>
      <Divider />
      {userDetails.email_verification_details ? (
        <>
          {isInCooldown && (
            <Alert severity="info">
              A code was recently sent. You can request another in{" "}
              <strong>{formatTime(remainingCooldown)}</strong>.
            </Alert>
          )}
          {expiresAt && (
            <Alert severity="warning">
              Your code expires at{" "}
              <strong>
                {new Date(expiresAt).toLocaleTimeString()}
              </strong>
              .
            </Alert>
          )}
          <Button
            onClick={onSendVerificationEmail}
            disabled={isInCooldown || isVerifyingEmail}
            variant="outlined"
            size="small"
            startIcon={
              isVerifyingEmail ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isVerifyingEmail
              ? "sending…"
              : isInCooldown
                ? `resend in ${formatTime(remainingCooldown)}`
                : "resend verification email"}
          </Button>
          <form onSubmit={onEmailVerificationSubmit} className="common-form">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              verification code
            </Typography>
            <MuiOtpInput
              value={emailVerificationCode}
              onChange={onEmailVerificationCodeChange}
              length={squareConfig.emailVerificationOTPLength}
              gap={1}
              TextFieldsProps={{
                size: "small",
                required: true,
                disabled: isVerifyingEmail,
                autoComplete: "one-time-code",
                sx: {
                  "& .MuiInputBase-input": {
                    padding: "8px 4px",
                  },
                },
              }}
            />
            <div className="profile-form-actions">
              <Button
                type="submit"
                variant={"contained" as any}
                disabled={isVerifyingEmail || !emailVerificationCode}
                startIcon={
                  isVerifyingEmail ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                {isVerifyingEmail ? "verifying…" : "submit code"}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            Your email address is not yet verified. Send a verification
            code to confirm your email.
          </Typography>
          <div>
            <Button
              onClick={onSendVerificationEmail}
              variant="outlined"
              size="small"
              disabled={isVerifyingEmail}
              startIcon={
                isVerifyingEmail ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <MarkEmailUnreadOutlinedIcon fontSize="small" />
                )
              }
            >
              {isVerifyingEmail ? "sending…" : "send verification email"}
            </Button>
          </div>
        </>
      )}
    </Paper>
  );
};

export default EmailVerificationSection;

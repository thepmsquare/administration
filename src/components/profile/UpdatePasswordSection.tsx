import * as React from "react";
import { PasswordInput } from "squarecomponents";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Button, CircularProgress, Divider, Paper, Typography } from "@mui/material";

type Props = {
  username: string | undefined;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  isLoading: boolean;
  onOldPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const UpdatePasswordSection: React.FC<Props> = ({
  username,
  oldPassword,
  newPassword,
  confirmPassword,
  isLoading,
  onOldPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}) => {
  return (
    <Paper
      variant="outlined"
      className="profile-section-card"
      component="section"
      aria-labelledby="update-password-title"
    >
      <div className="profile-section-header">
        <LockOutlinedIcon
          fontSize="small"
          color="primary"
          aria-hidden="true"
        />
        <Typography variant="h6" component="h2" id="update-password-title">
          update password
        </Typography>
      </div>
      <Divider />
      <form onSubmit={onSubmit} className="common-form">
        {/* hidden username for browser password managers */}
        <input
          type="text"
          name="username"
          value={username || ""}
          autoComplete="username"
          style={{ display: "none" }}
          readOnly
        />
        <PasswordInput
          value={oldPassword}
          onChange={onOldPasswordChange}
          label="current password"
          uniqueIdForARIA="update-password-old"
          autoComplete="current-password"
          others={{
            required: true,
            disabled: isLoading,
          }}
          variant="outlined"
          fullWidth
        />
        <PasswordInput
          value={newPassword}
          onChange={onNewPasswordChange}
          label="new password"
          uniqueIdForARIA="update-password-new"
          autoComplete="new-password"
          others={{
            required: true,
            disabled: isLoading,
          }}
          variant="outlined"
          fullWidth
        />
        <PasswordInput
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          label="confirm new password"
          uniqueIdForARIA="update-password-confirm"
          autoComplete="new-password"
          others={{
            required: true,
            disabled: isLoading,
          }}
          variant="outlined"
          fullWidth
        />
        <div className="profile-form-actions">
          <Button
            color="primary"
            variant={"contained" as any}
            type="submit"
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isLoading ? "updating…" : "update password"}
          </Button>
        </div>
      </form>
    </Paper>
  );
};

export default UpdatePasswordSection;

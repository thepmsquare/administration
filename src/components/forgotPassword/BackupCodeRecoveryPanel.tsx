import * as React from "react";
import { z } from "zod";
import { GetUserRecoveryMethodsV0ResponseZ } from "squarecommonblhelper";
import { PasswordInput } from "squarecomponents";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import Button from "@mui/material/Button";
import {
  Alert,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

type BackupCodeDetails = z.infer<
  typeof GetUserRecoveryMethodsV0ResponseZ.shape.data.shape.backup_code_details
>;

type Props = {
  isFetchingRecovery: boolean;
  backupCodeDetails: BackupCodeDetails | null;
  codeInput: string;
  newPassword: string;
  logoutOtherSessions: boolean;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoutToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

const BackupCodeRecoveryPanel: React.FC<Props> = ({
  isFetchingRecovery,
  backupCodeDetails,
  codeInput,
  newPassword,
  logoutOtherSessions,
  onCodeChange,
  onNewPasswordChange,
  onLogoutToggle,
  onSubmit,
}) => {
  const isDisabled =
    isFetchingRecovery || !backupCodeDetails || backupCodeDetails.available === 0;

  return (
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
          <strong>{backupCodeDetails.total}</strong> codes remaining ·
          generated on{" "}
          {new Date(backupCodeDetails.generated_at).toLocaleDateString()}
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          no backup codes available. please use another recovery method.
        </Alert>
      )}

      <form
        onSubmit={onSubmit}
        className="common-form"
        aria-label="backup code recovery form"
      >
        <TextField
          label="backup code"
          value={codeInput}
          onChange={onCodeChange}
          required
          fullWidth
          size="small"
          autoComplete="one-time-code"
          disabled={isDisabled}
        />
        <PasswordInput
          value={newPassword}
          onChange={onNewPasswordChange}
          label="new password"
          uniqueIdForARIA="backup-code-new-password"
          variant="outlined"
          fullWidth
          autoComplete="new-password"
          others={{
            required: true,
            disabled: isDisabled,
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={logoutOtherSessions}
              onChange={onLogoutToggle}
              size="small"
              disabled={isDisabled}
            />
          }
          label={
            <Typography
              variant="body2"
              color={isDisabled ? "text.disabled" : "text.primary"}
            >
              log out other sessions
            </Typography>
          }
        />
        <Button
          type="submit"
          variant={"contained" as any}
          disabled={isDisabled}
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

export default BackupCodeRecoveryPanel;

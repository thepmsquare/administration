import * as React from "react";
import { PasswordInput } from "squarecomponents";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button, CircularProgress, Divider, Paper, Typography } from "@mui/material";
import brandConfig from "../../config/brand";

type Props = {
  removeAppPassword: string;
  deleteAccountPassword: string;
  isRemoveAppLoading: boolean;
  isDeleteAccountLoading: boolean;
  onRemoveAppPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAccountPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAppSubmit: (e: React.FormEvent) => void;
  onDeleteAccountSubmit: (e: React.FormEvent) => void;
};

const DangerZoneSection: React.FC<Props> = ({
  removeAppPassword,
  deleteAccountPassword,
  isRemoveAppLoading,
  isDeleteAccountLoading,
  onRemoveAppPasswordChange,
  onDeleteAccountPasswordChange,
  onRemoveAppSubmit,
  onDeleteAccountSubmit,
}) => {
  return (
    <Paper
      variant="outlined"
      className="profile-danger-section"
      component="section"
      aria-labelledby="danger-zone-title"
    >
      <div className="profile-section-header">
        <DeleteOutlineIcon
          fontSize="small"
          color="error"
          aria-hidden="true"
        />
        <Typography variant="h6" component="h2" color="error" id="danger-zone-title">
          danger zone
        </Typography>
      </div>
      <Divider />

      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        delete {brandConfig.appName} account
      </Typography>
      <form onSubmit={onRemoveAppSubmit} className="common-form">
        <PasswordInput
          value={removeAppPassword}
          onChange={onRemoveAppPasswordChange}
          label="password"
          uniqueIdForARIA="remove-app-password"
          others={{ required: true, disabled: isRemoveAppLoading }}
          variant="outlined"
          fullWidth
        />
        <div className="profile-form-actions">
          <Button
            color="error"
            variant="outlined"
            type="submit"
            disabled={isRemoveAppLoading}
            startIcon={
              isRemoveAppLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isRemoveAppLoading
              ? "deleting…"
              : `delete ${brandConfig.appName} account`}
          </Button>
        </div>
      </form>

      <Divider />

      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        delete account permanently
      </Typography>
      <form onSubmit={onDeleteAccountSubmit} className="common-form">
        <PasswordInput
          value={deleteAccountPassword}
          onChange={onDeleteAccountPasswordChange}
          label="password"
          uniqueIdForARIA="delete-account-password"
          others={{ required: true, disabled: isDeleteAccountLoading }}
          variant="outlined"
          fullWidth
        />
        <div className="profile-form-actions">
          <Button
            color="error"
            variant={"contained" as any}
            type="submit"
            disabled={isDeleteAccountLoading}
            startIcon={
              isDeleteAccountLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isDeleteAccountLoading ? "deleting…" : "delete account"}
          </Button>
        </div>
      </form>
    </Paper>
  );
};

export default DangerZoneSection;

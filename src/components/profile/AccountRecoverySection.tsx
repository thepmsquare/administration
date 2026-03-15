import * as React from "react";
import { z } from "zod";
import { GetUserDetailsV0ResponseZ, RecoveryMethodEnum } from "squarecommonblhelper";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";

type UserDetails = z.infer<
  typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
>;

type Props = {
  userDetails: UserDetails | null;
  isTogglingRecovery: boolean;
  isGeneratingBackupCodes: boolean;
  onRecoveryToggle: (method: RecoveryMethodEnum, isActiveCurrently: boolean) => void;
  onGenerateBackupCodes: () => void;
};

const AccountRecoverySection: React.FC<Props> = ({
  userDetails,
  isTogglingRecovery,
  isGeneratingBackupCodes,
  onRecoveryToggle,
  onGenerateBackupCodes,
}) => {
  return (
    <Paper
      variant="outlined"
      className="profile-section-card"
      component="section"
      aria-labelledby="account-recovery-title"
    >
      <div className="profile-section-header">
        <ShieldOutlinedIcon
          fontSize="small"
          color="primary"
          aria-hidden="true"
        />
        <Typography variant="h6" component="h2" id="account-recovery-title">
          account recovery
        </Typography>
      </div>
      <Divider />
      {userDetails &&
        Object.entries(userDetails.recovery_methods).map(
          ([name, isActive], index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                py: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ textTransform: "lowercase" }}
                >
                  {name.replace(/_/g, " ")}
                </Typography>
                <Chip
                  size="small"
                  label={isActive ? "active" : "inactive"}
                  color={isActive ? "success" : "default"}
                  variant="outlined"
                />
              </Box>
              <Button
                size="small"
                variant="outlined"
                color={isActive ? "error" : "primary"}
                disabled={isTogglingRecovery}
                onClick={() =>
                  onRecoveryToggle(name as RecoveryMethodEnum, isActive)
                }
                startIcon={
                  isTogglingRecovery ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                {isTogglingRecovery
                  ? "updating…"
                  : isActive
                    ? "disable"
                    : "enable"}
              </Button>
            </Box>
          ),
        )}
      {userDetails && userDetails.recovery_methods.BACKUP_CODE && (
        <>
          <Divider />
          {userDetails.backup_code_details && (
            <Alert severity="info" sx={{ mt: 0.5 }}>
              <strong>{userDetails.backup_code_details.available}</strong>{" "}
              of <strong>{userDetails.backup_code_details.total}</strong>{" "}
              codes remaining · generated on{" "}
              {new Date(
                userDetails.backup_code_details.generated_at,
              ).toLocaleDateString()}
            </Alert>
          )}
          <div>
            <Button
              variant="outlined"
              size="small"
              onClick={onGenerateBackupCodes}
              disabled={isGeneratingBackupCodes}
              startIcon={
                isGeneratingBackupCodes ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {isGeneratingBackupCodes
                ? "generating…"
                : userDetails.backup_code_details
                  ? "regenerate backup codes"
                  : "generate backup codes"}
            </Button>
          </div>
        </>
      )}
    </Paper>
  );
};

export default AccountRecoverySection;

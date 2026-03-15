import * as React from "react";
import { z } from "zod";
import { GetUserDetailsV0ResponseZ } from "squarecommonblhelper";
import { MuiTelInput } from "mui-tel-input";
import { Edit } from "@mui/icons-material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Button from "@mui/material/Button";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

type UserDetails = z.infer<
  typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
>;

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneCountryCode: string;
};

type Props = {
  userDetails: UserDetails | null;
  isEditingProfile: boolean;
  profileFormData: ProfileFormData;
  isUpdatingProfile: boolean;
  onProfileFieldChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value: string, info: { nationalNumber?: string | null; countryCallingCode?: string | null }) => void;
  onProfileFieldSave: (e: React.FormEvent) => void;
  onEditStart: () => void;
  onEditCancel: () => void;
};

const ProfileDetailsSection: React.FC<Props> = ({
  userDetails,
  isEditingProfile,
  profileFormData,
  isUpdatingProfile,
  onProfileFieldChange,
  onPhoneChange,
  onProfileFieldSave,
  onEditStart,
  onEditCancel,
}) => {
  return (
    <Paper
      variant="outlined"
      className="profile-section-card"
      component="section"
      aria-labelledby="profile-details-title"
    >
      <div className="profile-section-header">
        <AccountCircleOutlinedIcon
          fontSize="small"
          color="primary"
          aria-hidden="true"
        />
        <Typography variant="h6" component="h2" id="profile-details-title">
          profile details
        </Typography>
      </div>
      <Divider />

      {isEditingProfile ? (
        <form onSubmit={onProfileFieldSave} className="common-form">
          <TextField
            label="first name"
            variant="outlined"
            value={profileFormData.firstName}
            onChange={onProfileFieldChange("firstName")}
            fullWidth
            size="small"
            disabled={isUpdatingProfile}
          />
          <TextField
            label="last name"
            variant="outlined"
            value={profileFormData.lastName}
            onChange={onProfileFieldChange("lastName")}
            fullWidth
            size="small"
            disabled={isUpdatingProfile}
          />
          <TextField
            label="email"
            variant="outlined"
            type="email"
            value={profileFormData.email}
            onChange={onProfileFieldChange("email")}
            fullWidth
            size="small"
            disabled={isUpdatingProfile}
          />
          <MuiTelInput
            label="phone number"
            value={`${profileFormData.phoneCountryCode}${profileFormData.phoneNumber}`}
            onChange={(value, info) => onPhoneChange(value, info)}
            fullWidth
            variant="outlined"
            size="small"
            disabled={isUpdatingProfile}
          />
          <div className="profile-form-actions">
            <Button
              variant={"contained" as any}
              color="primary"
              type="submit"
              disabled={isUpdatingProfile}
              startIcon={
                isUpdatingProfile ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {isUpdatingProfile ? "saving…" : "save changes"}
            </Button>
            <Button
              variant="text"
              color="inherit"
              type="button"
              onClick={onEditCancel}
              disabled={isUpdatingProfile}
            >
              cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <div className="profile-info-row">
              <Typography variant="body2" color="text.secondary">
                name
              </Typography>
              <Typography variant="body1">
                {`${userDetails?.profile.user_profile_first_name || ""} ${
                  userDetails?.profile.user_profile_last_name || ""
                }`.trim() || "—"}
              </Typography>
            </div>
            <div className="profile-info-row">
              <Typography variant="body2" color="text.secondary">
                email
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body1">
                  {userDetails?.profile.user_profile_email || "—"}
                </Typography>
                {!!userDetails?.profile.user_profile_email && (
                  <Chip
                    size="small"
                    label={
                      userDetails?.profile.user_profile_email_verified
                        ? "verified"
                        : "not verified"
                    }
                    color={
                      userDetails?.profile.user_profile_email_verified
                        ? "success"
                        : "warning"
                    }
                    variant="outlined"
                  />
                )}
              </Box>
            </div>
            <div className="profile-info-row">
              <Typography variant="body2" color="text.secondary">
                phone
              </Typography>
              <Typography variant="body1">
                {userDetails?.profile.user_profile_phone_number
                  ? `${userDetails.profile.user_profile_phone_number_country_code}${userDetails.profile.user_profile_phone_number}`
                  : "—"}
              </Typography>
            </div>
          </Box>
          <div>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit fontSize="small" />}
              onClick={onEditStart}
            >
              edit details
            </Button>
          </div>
        </>
      )}
    </Paper>
  );
};

export default ProfileDetailsSection;

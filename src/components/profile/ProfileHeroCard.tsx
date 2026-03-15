import * as React from "react";
import Button from "@mui/material/Button";
import { Avatar, CircularProgress, IconButton, Paper, Tooltip } from "@mui/material";
import { Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

type Props = {
  username: string | undefined;
  userProfilePhotoURL: string | null;
  isUserProfilePhotoLoading: boolean;
  onOpenPhotoBackdrop: () => void;
  onTriggerFileInput: () => void;
  onRemovePhotoDialogOpen: () => void;
  onUpdateUsernameDialogOpen: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ProfileHeroCard: React.FC<Props> = ({
  username,
  userProfilePhotoURL,
  isUserProfilePhotoLoading,
  onOpenPhotoBackdrop,
  onTriggerFileInput,
  onRemovePhotoDialogOpen,
  onUpdateUsernameDialogOpen,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <Paper
      variant="outlined"
      className="profile-hero-card"
      elevation={3}
      component="section"
      aria-label="user overview"
    >
      <div className="profile-avatar-wrapper">
        {isUserProfilePhotoLoading ? (
          <Avatar className="profile-avatar-large">
            <CircularProgress size={32} />
          </Avatar>
        ) : userProfilePhotoURL ? (
          <Tooltip title="View photo">
            <Avatar
              className="profile-avatar-large"
              alt={username}
              src={userProfilePhotoURL}
              onClick={onOpenPhotoBackdrop}
              style={{ cursor: "pointer" }}
            />
          </Tooltip>
        ) : (
          <Avatar className="profile-avatar-large">
            {username?.charAt(0).toUpperCase()}
          </Avatar>
        )}
      </div>

      <div className="profile-username-row">
        <span className="MuiTypography-h6" style={{ fontWeight: 600 }}>
          {username}
        </span>
        <Tooltip title="Change username">
          <IconButton
            size="small"
            onClick={onUpdateUsernameDialogOpen}
            aria-label="change username"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      <div className="profile-photo-actions" role="group" aria-label="profile photo actions">
        <Button
          startIcon={<PhotoCameraIcon />}
          onClick={onTriggerFileInput}
          variant="outlined"
          size="small"
          aria-label="update profile photo"
        >
          update photo
        </Button>
        {userProfilePhotoURL && (
          <Button
            startIcon={<DeleteIcon />}
            onClick={onRemovePhotoDialogOpen}
            color="error"
            variant="outlined"
            size="small"
            aria-label="remove profile photo"
          >
            remove photo
          </Button>
        )}
      </div>

      <input
        type="file"
        accept="image/jpeg, image/png"
        ref={fileInputRef}
        onChange={onFileChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </Paper>
  );
};

export default ProfileHeroCard;

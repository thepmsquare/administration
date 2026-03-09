import "../stylesheets/profile.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import {
  GetUserDetailsV0ResponseZ,
  RecoveryMethodEnum,
} from "squarecommonblhelper";
import {
  AlertDialog,
  PaginatedTable,
  PasswordInput,
  UsernameInput,
} from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";
import { MuiTelInput } from "mui-tel-input";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { ProfileState, ProfileStateZ } from "../types/pages/Profile";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";
import squareConfig from "../config/square";
import { useAuth } from "../utils/auth";
import { MuiOtpInput } from "mui-one-time-password-input";

export const Head: HeadFC = () => (
  <title>{brandConfig.appName} | profile</title>
);

const ProfilePage: React.FC<PageProps> = (props) => {
  const { location } = props;
  let state: ProfileState | null = null;
  try {
    state = ProfileStateZ.parse(location.state);
  } catch {
    state = null;
  }
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const {
    user,
    isLoading,
    setUser: setAuthUser,
  } = useAuth(state?.user, { redirectIfLoggedOut: "/login" });
  const [pageState, setPageState] = React.useState<ProfileState | null>(state);
  // delete account
  const [deleteAccountPassword, setDeleteAccountPassword] =
    React.useState<string>("");
  const [isDeleteAccountLoading, setIsDeleteAccountLoading] =
    React.useState<boolean>(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    React.useState<boolean>(false);

  // remove app
  const [removeAppPassword, setRemoveAppPassword] = React.useState<string>("");
  const [isRemoveAppLoading, setIsRemoveAppLoading] =
    React.useState<boolean>(false);
  const [isRemoveAppDialogOpen, setIsRemoveAppDialogOpen] =
    React.useState<boolean>(false);
  // misc profile details
  const [isEditingProfile, setIsEditingProfile] =
    React.useState<boolean>(false);
  const [profileFormData, setProfileFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    phoneCountryCode: "",
  });
  const [emailVerificationCode, setEmailVerificationCode] =
    React.useState<string>("");
  const [cooldownResetAt, setCooldownResetAt] = React.useState<string | null>(
    null,
  );
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);
  const [remainingCooldown, setRemainingCooldown] = React.useState<number>(0);
  // recovery methods
  const [accountRecoveryBackupCodes, setAccountRecoveryBackupCodes] =
    React.useState<string[]>([]);
  const [
    isAccountRecoveryBackupCodesDialogOpen,
    setIsAccountRecoveryBackupCodesDialogOpen,
  ] = React.useState<boolean>(false);
  // update username
  const [updateUsernameNewUsername, setUpdateUsernameNewUsername] =
    React.useState<string>(state ? state.user.username : "");
  const [isUpdateUsernameLoading, setIsUpdateUsernameLoading] =
    React.useState<boolean>(false);
  const [isUpdateUsernameDialogOpen, setIsUpdateUsernameDialogOpen] =
    React.useState<boolean>(false);
  //update password
  const [updatePasswordOldPassword, setUpdatePasswordOldPassword] =
    React.useState<string>("");
  const [updatePasswordNewPassword, setUpdatePasswordNewPassword] =
    React.useState<string>("");
  const [updatePasswordConfirmPassword, setUpdatePasswordConfirmPassword] =
    React.useState<string>("");
  const [isUpdatePasswordLoading, setIsUpdatePasswordLoading] =
    React.useState<boolean>(false);
  // user details
  const [userDetails, setUserDetails] = React.useState<z.infer<
    typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
  > | null>(null);
  const [userProfilePhotoURL, setUserProfilePhotoURL] = React.useState<
    string | null
  >(null);
  const [isUserProfilePhotoLoading, setIsUserProfilePhotoLoading] =
    React.useState<boolean>(false);
  // logout apps
  const [isLogoutAppsDialogOpen, setIsLogoutAppsDialogOpen] =
    React.useState<boolean>(false);
  const [logoutAppName, setLogoutAppName] = React.useState<string | null>(null);
  // logout all
  const [isLogoutAllDialogOpen, setIsLogoutAllDialogOpen] =
    React.useState<boolean>(false);
  //profile photo update
  const [
    userProfilePhotoUpdatePreviewURL,
    setUserProfilePhotoUpdatePreviewURL,
  ] = React.useState<string | null>(null);
  const [
    openUserProfilePhotoUpdateDialog,
    setOpenUserProfilePhotoUpdateDialog,
  ] = React.useState(false);
  const [
    openUserProfilePhotoRemoveDialog,
    setOpenUserProfilePhotoRemoveDialog,
  ] = React.useState(false);
  // view profile photo
  const [isPhotoBackdropVisible, setIsPhotoBackdropVisible] =
    React.useState(false);
  // crop state
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const imgRef = React.useRef<HTMLImageElement>(null);

  // functions

  const openDeleteAccountDialog = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleteAccountDialogOpen(true);
  };

  const closeDeleteAccountDialog = () => {
    if (isDeleteAccountLoading) {
      return;
    }
    setIsDeleteAccountLoading(false);
    setIsDeleteAccountDialogOpen(false);
  };

  const deleteAccount = async () => {
    if (!pageState) {
      return;
    }
    try {
      setIsDeleteAccountLoading(true);
      await authenticationCommonBL.deleteUserV0(
        pageState.user.access_token,
        deleteAccountPassword,
      );
      setDeleteAccountPassword("");
      setAuthUser(null);
      setIsDeleteAccountLoading(false);
      navigate("/login");
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
      setIsDeleteAccountLoading(false);
      closeDeleteAccountDialog();
    }
  };

  const updateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageState) {
      return;
    }
    if (updateUsernameNewUsername === pageState.user.username) {
      changeSnackbarState({
        isOpen: true,
        message: "Username is same as current username.",
        severity: "error",
      });
      return;
    }
    try {
      setIsUpdateUsernameLoading(true);
      await authenticationCommonBL.updateUsernameV0(
        pageState.user.access_token,
        updateUsernameNewUsername,
      );
      setIsUpdateUsernameLoading(false);
      setIsUpdateUsernameDialogOpen(false);
      changeSnackbarState({
        isOpen: true,
        message: "Username updated successfully.",
        severity: "success",
      });
      const newState = {
        user: { ...pageState.user, username: updateUsernameNewUsername },
      };
      setPageState(newState);
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
      setIsUpdateUsernameLoading(false);
      setIsUpdateUsernameDialogOpen(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageState) {
      return;
    }
    if (!updatePasswordNewPassword) {
      return;
    }
    if (!updatePasswordOldPassword) {
      return;
    }
    if (!updatePasswordConfirmPassword) {
      return;
    }
    if (updatePasswordNewPassword !== updatePasswordConfirmPassword) {
      changeSnackbarState({
        isOpen: true,
        message: "confirmation of desired password failed.",
        severity: "error",
      });
      return;
    }
    if (updatePasswordNewPassword === updatePasswordOldPassword) {
      changeSnackbarState({
        isOpen: true,
        message: "desired password is same as the existing password.",
        severity: "error",
      });
      return;
    }
    try {
      setIsUpdatePasswordLoading(true);
      await authenticationAdministrationBL.updatePasswordV0(
        pageState.user.access_token,
        updatePasswordOldPassword,
        updatePasswordNewPassword,
      );
      setIsUpdatePasswordLoading(false);
      changeSnackbarState({
        isOpen: true,
        message: "password updated successfully.",
        severity: "success",
      });
      setUpdatePasswordOldPassword("");
      setUpdatePasswordNewPassword("");
      setUpdatePasswordConfirmPassword("");
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
      setIsUpdatePasswordLoading(false);
    }
  };

  const getUserDetails = async () => {
    if (!pageState) {
      return;
    }
    try {
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        pageState.user.access_token,
      );

      setUserDetails(userDetailsResponse.data.main);
      if (userDetailsResponse.data.main.email_verification_details) {
        setCooldownResetAt(
          userDetailsResponse.data.main.email_verification_details
            .cooldown_reset_at,
        );
        setExpiresAt(
          userDetailsResponse.data.main.email_verification_details.expires_at,
        );
        // Calculate initial remaining time
        const remaining = calculateRemainingCooldown(
          userDetailsResponse.data.main.email_verification_details
            .cooldown_reset_at,
        );
        setRemainingCooldown(remaining);
      }
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const getUserProfilePhoto = async () => {
    if (!pageState) {
      return;
    }
    try {
      setIsUserProfilePhotoLoading(true);
      const userDetailsResponse =
        await authenticationCommonBL.getUserProfilePhotoV0(
          pageState.user.access_token,
        );

      if (userDetailsResponse instanceof Blob && userDetailsResponse.size > 0) {
        setUserProfilePhotoURL(URL.createObjectURL(userDetailsResponse));
      }
      setIsUserProfilePhotoLoading(false);
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const logoutFromApp = async (app_name: string) => {
    if (!pageState) {
      return;
    }
    try {
      await authenticationCommonBL.logoutAppsV0(pageState.user.access_token, [
        app_name,
      ]);
      setAuthUser(null);
      setPageState(null);
      setIsLogoutAppsDialogOpen(false);
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const logoutAll = async () => {
    if (!pageState) {
      return;
    }
    try {
      await authenticationCommonBL.logoutAllV0(pageState.user.access_token);
      setAuthUser(null);
      setPageState(null);
      closeLogoutAllDialog();
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const closeLogoutAppsDialog = () => {
    setIsLogoutAppsDialogOpen(false);
  };

  const closeLogoutAllDialog = () => {
    setIsLogoutAllDialogOpen(false);
  };

  const openRemoveAppDialog = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRemoveAppDialogOpen(true);
  };

  const closeRemoveAppDialog = () => {
    if (isRemoveAppLoading) {
      return;
    }
    setIsRemoveAppLoading(false);
    setIsRemoveAppDialogOpen(false);
  };

  const removeApp = async () => {
    if (!pageState) {
      return;
    }
    try {
      setIsRemoveAppLoading(true);
      await authenticationAdministrationBL.removeAppForSelfV0(
        pageState.user.access_token,
        removeAppPassword,
      );
      setRemoveAppPassword("");
      setAuthUser(null);
      setIsRemoveAppLoading(false);
      navigate("/login");
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
      setIsRemoveAppLoading(false);
      closeRemoveAppDialog();
    }
  };

  const handleUpdateUsernameDialogOpen = () => {
    setIsUpdateUsernameDialogOpen(true);
  };

  const handleUpdateUsernameDialogClose = () => {
    setIsUpdateUsernameDialogOpen(false);
  };

  const nullifyPageState = () => {
    setAuthUser(null);
    setPageState(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Revoke any previous object URL to avoid memory leaks
      if (userProfilePhotoUpdatePreviewURL) {
        URL.revokeObjectURL(userProfilePhotoUpdatePreviewURL);
      }
      const objectUrl = URL.createObjectURL(file);
      setUserProfilePhotoUpdatePreviewURL(objectUrl);
      // Reset crop selection so it is re-computed on image load
      setCrop(undefined);
      setCompletedCrop(undefined);
      setOpenUserProfilePhotoUpdateDialog(true);
    }
    // Reset input value to allow re-selecting the same file
    if (event.target) {
      event.target.value = "";
    }
  };

  const dataURLToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], filename, { type: mime });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const confirmProfilePhotoUpdate = async () => {
    if (!pageState) return;
    if (!imgRef.current || !completedCrop || !userProfilePhotoUpdatePreviewURL)
      return;

    // Draw cropped region to an off-screen canvas
    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    // Convert canvas to blob and upload
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], "profile.jpg", {
        type: "image/jpeg",
      });
      try {
        await authenticationCommonBL.updateUserProfilePhotoV0(
          pageState.user.access_token,
          croppedFile,
        );
        const croppedDataUrl = canvas.toDataURL("image/jpeg");
        changeSnackbarState({
          isOpen: true,
          message: "profile photo updated successfully.",
          severity: "success",
        });
        setUserProfilePhotoURL(croppedDataUrl);
      } catch (error) {
        changeSnackbarState({
          isOpen: true,
          message: (error as Error).message,
          severity: "error",
        });
      } finally {
        URL.revokeObjectURL(userProfilePhotoUpdatePreviewURL);
        setUserProfilePhotoUpdatePreviewURL(null);
        setOpenUserProfilePhotoUpdateDialog(false);
      }
    }, "image/jpeg");
  };

  const cancelProfilePhotoUpdate = () => {
    setUserProfilePhotoUpdatePreviewURL(null);
    setOpenUserProfilePhotoUpdateDialog(false);
  };

  const confirmProfilePhotoRemove = async () => {
    if (!pageState) {
      return;
    }
    await authenticationCommonBL.updateUserProfilePhotoV0(
      pageState.user.access_token,
      undefined,
    );
    changeSnackbarState({
      isOpen: true,
      message: "profile photo removed successfully.",
      severity: "success",
    });
    setUserProfilePhotoURL(null);
    setUserProfilePhotoUpdatePreviewURL(null);
    setOpenUserProfilePhotoRemoveDialog(false);
  };

  const cancelProfilePhotoRemove = () => {
    setOpenUserProfilePhotoRemoveDialog(false);
  };

  const handleProfileFieldChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };
  const handleProfileFieldSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pageState) {
      return;
    }

    try {
      const response = await authenticationCommonBL.updateProfileDetailsV0(
        pageState.user.access_token,
        profileFormData.firstName || undefined,
        profileFormData.lastName || undefined,
        profileFormData.email || undefined,
        profileFormData.phoneCountryCode || undefined,
        profileFormData.phoneNumber || undefined,
      );

      if (response.data.main) {
        setUserDetails((prev) =>
          prev
            ? {
                ...prev,
                profile: response.data.main,
              }
            : null,
        );
      }

      changeSnackbarState({
        isOpen: true,
        message: "Profile updated successfully.",
        severity: "success",
      });

      getUserDetails();

      setIsEditingProfile(false);
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!pageState) {
      return;
    }
    try {
      await authenticationCommonBL.sendVerificationEmailV0(
        pageState.user.access_token,
      );
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        pageState.user.access_token,
      );

      setUserDetails(userDetailsResponse.data.main);
      if (userDetailsResponse.data.main.email_verification_details) {
        setCooldownResetAt(
          userDetailsResponse.data.main.email_verification_details
            .cooldown_reset_at,
        );
        setExpiresAt(
          userDetailsResponse.data.main.email_verification_details.expires_at,
        );
        const remaining = calculateRemainingCooldown(
          userDetailsResponse.data.main.email_verification_details
            .cooldown_reset_at,
        );
        setRemainingCooldown(remaining);
      }

      changeSnackbarState({
        isOpen: true,
        message: "verification email sent successfully.",
        severity: "success",
      });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const handleEmailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageState) {
      return;
    }
    try {
      await authenticationCommonBL.validateEmailVerificationCodeV0(
        pageState.user.access_token,
        emailVerificationCode,
      );
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        pageState.user.access_token,
      );
      setUserDetails(userDetailsResponse.data.main);
      changeSnackbarState({
        isOpen: true,
        message: "email verified successfully.",
        severity: "success",
      });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const handleAccountRecoveryToggle = async (
    method: RecoveryMethodEnum,
    isActiveCurrently: boolean,
  ) => {
    if (!pageState) {
      return;
    }
    try {
      let recoveryMethodsToRemove: RecoveryMethodEnum[] = [];
      let recoveryMethodsToAdd: RecoveryMethodEnum[] = [];
      if (isActiveCurrently) {
        recoveryMethodsToRemove = [method];
      } else {
        recoveryMethodsToAdd = [method];
      }
      await authenticationCommonBL.updateUserRecoveryMethodsV0(
        pageState.user.access_token,
        recoveryMethodsToAdd,
        recoveryMethodsToRemove,
      );
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        pageState.user.access_token,
      );
      setUserDetails(userDetailsResponse.data.main);
      changeSnackbarState({
        isOpen: true,
        message: `account recovery method ${method} toggled successfully.`,
        severity: "success",
      });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  const handleGenerateAccountRecoveryBackupCodes = async () => {
    if (!pageState) {
      return;
    }
    try {
      const response =
        await authenticationCommonBL.generateAccountBackupCodesV0(
          pageState.user.access_token,
        );
      setAccountRecoveryBackupCodes(response.data.main.backup_codes);
      setIsAccountRecoveryBackupCodesDialogOpen(true);
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };
  const handleAccountRecoveryBackupCodesCopy = async () => {
    const text = accountRecoveryBackupCodes.join("\n");
    await navigator.clipboard.writeText(text);
  };
  const handleAccountRecoveryBackupCodesDialogClose = async () => {
    if (pageState) {
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        pageState.user.access_token,
      );
      setUserDetails(userDetailsResponse.data.main);
    }
    setIsAccountRecoveryBackupCodesDialogOpen(false);
    setAccountRecoveryBackupCodes([]);
  };
  const handleAccountRecoveryBackupCodesDownload = () => {
    const text = accountRecoveryBackupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${userDetails?.username ? userDetails.username + "-" : ""}account-recovery-backup-codes.txt`;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  // useEffect

  React.useEffect(() => {
    if (user) {
      setPageState({ user });
      getUserDetails();
      getUserProfilePhoto();
    }
  }, [user]);

  React.useEffect(() => {
    return () => {
      if (userProfilePhotoURL) {
        URL.revokeObjectURL(userProfilePhotoURL);
      }
    };
  }, [userProfilePhotoURL]);

  React.useEffect(() => {
    if (!cooldownResetAt) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingCooldown(cooldownResetAt);
      setRemainingCooldown(remaining);

      if (remaining <= 0) {
        setCooldownResetAt(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownResetAt]);

  // misc
  const sessionTableData = userDetails?.sessions.map((row) => {
    return {
      "app name": row.app_name,
      "number of sessions": row.active_sessions,
      logout: (
        <Button
          color="error"
          onClick={() => {
            setIsLogoutAppsDialogOpen(true);
            setLogoutAppName(row.app_name);
          }}
        >
          logout
        </Button>
      ),
    };
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const isInCooldown = !!(cooldownResetAt && remainingCooldown > 0);

  return (
    <Page
      user={pageState?.user}
      nullifyPageStateFunction={nullifyPageState}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="profile-page"
      isLoading={isLoading}
      externalUserProfilePhotoURL={userProfilePhotoURL}
      isExternalUserProfilePhotoLoading={isUserProfilePhotoLoading}
    >
      <div className="profile-outer">
        {/* Page title */}
        <Typography variant="h4" component="h1" className="profile-title">
          profile
        </Typography>

        {/* ---- Hero card: avatar + username ---- */}
        <Paper variant="outlined" className="profile-hero-card" elevation={3}>
          <div className="profile-avatar-wrapper">
            {isUserProfilePhotoLoading ? (
              <Avatar className="profile-avatar-large">
                <CircularProgress size={32} />
              </Avatar>
            ) : userProfilePhotoURL ? (
              <Tooltip title="View photo">
                <Avatar
                  className="profile-avatar-large"
                  alt={pageState?.user.username}
                  src={userProfilePhotoURL}
                  onClick={() => setIsPhotoBackdropVisible(true)}
                />
              </Tooltip>
            ) : (
              <Avatar className="profile-avatar-large">
                {pageState?.user.username?.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </div>

          <div className="profile-username-row">
            <Typography variant="h6" component="span" fontWeight={600}>
              {pageState?.user.username}
            </Typography>
            <Tooltip title="Change username">
              <IconButton
                size="small"
                onClick={handleUpdateUsernameDialogOpen}
                aria-label="change username"
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>

          <div className="profile-photo-actions">
            <Button
              startIcon={<PhotoCameraIcon />}
              onClick={triggerFileInput}
              variant="outlined"
              size="small"
            >
              update photo
            </Button>
            {userProfilePhotoURL && (
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => setOpenUserProfilePhotoRemoveDialog(true)}
                color="error"
                variant="outlined"
                size="small"
              >
                remove photo
              </Button>
            )}
          </div>
        </Paper>

        <input
          type="file"
          accept="image/jpeg, image/png"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          aria-hidden="true"
        />

        {/* ---- Profile details section ---- */}
        <Paper variant="outlined" className="profile-section-card">
          <div className="profile-section-header">
            <AccountCircleOutlinedIcon
              fontSize="small"
              color="primary"
              aria-hidden="true"
            />
            <Typography variant="h6" component="h2">
              profile details
            </Typography>
          </div>
          <Divider />

          {isEditingProfile ? (
            <form onSubmit={handleProfileFieldSave} className="common-form">
              <TextField
                label="first name"
                variant="outlined"
                value={profileFormData.firstName}
                onChange={handleProfileFieldChange("firstName")}
                fullWidth
                size="small"
              />
              <TextField
                label="last name"
                variant="outlined"
                value={profileFormData.lastName}
                onChange={handleProfileFieldChange("lastName")}
                fullWidth
                size="small"
              />
              <TextField
                label="email"
                variant="outlined"
                type="email"
                value={profileFormData.email}
                onChange={handleProfileFieldChange("email")}
                fullWidth
                size="small"
              />
              <MuiTelInput
                label="phone number"
                value={`${profileFormData.phoneCountryCode}${profileFormData.phoneNumber}`}
                onChange={(value, info) => {
                  setProfileFormData((prev) => ({
                    ...prev,
                    phoneNumber: info.nationalNumber || "",
                    phoneCountryCode: info.countryCallingCode
                      ? `+${info.countryCallingCode}`
                      : "",
                  }));
                }}
                fullWidth
                variant="outlined"
                size="small"
              />
              <div className="profile-form-actions">
                <Button variant="contained" color="primary" type="submit">
                  save changes
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
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
                  onClick={() => {
                    setProfileFormData({
                      firstName:
                        userDetails?.profile.user_profile_first_name || "",
                      lastName:
                        userDetails?.profile.user_profile_last_name || "",
                      email: userDetails?.profile.user_profile_email || "",
                      phoneNumber:
                        userDetails?.profile.user_profile_phone_number || "",
                      phoneCountryCode:
                        userDetails?.profile
                          .user_profile_phone_number_country_code || "",
                    });
                    setIsEditingProfile(true);
                  }}
                >
                  edit details
                </Button>
              </div>
            </>
          )}
        </Paper>
        {/* ---- Email verification section (only when unverified) ---- */}
        {userDetails?.profile.user_profile_email &&
          !userDetails?.profile.user_profile_email_verified && (
            <Paper variant="outlined" className="profile-section-card">
              <div className="profile-section-header">
                <MarkEmailUnreadOutlinedIcon
                  fontSize="small"
                  color="warning"
                  aria-hidden="true"
                />
                <Typography variant="h6" component="h2">
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
                    onClick={handleSendVerificationEmail}
                    disabled={isInCooldown}
                    variant="outlined"
                    size="small"
                  >
                    {isInCooldown
                      ? `resend in ${formatTime(remainingCooldown)}`
                      : "resend verification email"}
                  </Button>
                  <form
                    onSubmit={handleEmailVerificationSubmit}
                    className="common-form"
                  >
                    <MuiOtpInput
                      value={emailVerificationCode}
                      onChange={(value) => setEmailVerificationCode(value)}
                      length={squareConfig.emailVerificationOTPLength}
                      TextFieldsProps={{
                        label: "verification code",
                        size: "small",
                        required: true,
                      }}
                    />
                    <div className="profile-form-actions">
                      <Button type="submit" variant="contained">
                        submit code
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
                      onClick={handleSendVerificationEmail}
                      variant="outlined"
                      size="small"
                      startIcon={
                        <MarkEmailUnreadOutlinedIcon fontSize="small" />
                      }
                    >
                      send verification email
                    </Button>
                  </div>
                </>
              )}
            </Paper>
          )}
        {/* ---- Account recovery section ---- */}
        <Paper variant="outlined" className="profile-section-card">
          <div className="profile-section-header">
            <ShieldOutlinedIcon
              fontSize="small"
              color="primary"
              aria-hidden="true"
            />
            <Typography variant="h6" component="h2">
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
                    onClick={() =>
                      handleAccountRecoveryToggle(
                        name as RecoveryMethodEnum,
                        isActive,
                      )
                    }
                  >
                    {isActive ? "disable" : "enable"}
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
                  onClick={handleGenerateAccountRecoveryBackupCodes}
                >
                  {userDetails.backup_code_details
                    ? "regenerate backup codes"
                    : "generate backup codes"}
                </Button>
              </div>
            </>
          )}
        </Paper>
        {/* ---- Update password section ---- */}
        <Paper variant="outlined" className="profile-section-card">
          <div className="profile-section-header">
            <LockOutlinedIcon
              fontSize="small"
              color="primary"
              aria-hidden="true"
            />
            <Typography variant="h6" component="h2">
              update password
            </Typography>
          </div>
          <Divider />
          <form onSubmit={updatePassword} className="common-form">
            <PasswordInput
              value={updatePasswordOldPassword}
              onChange={(e) => setUpdatePasswordOldPassword(e.target.value)}
              label="current password"
              uniqueIdForARIA="update-password-old"
              others={{ required: true, disabled: isUpdatePasswordLoading }}
              variant="outlined"
              fullWidth
            />
            <PasswordInput
              value={updatePasswordNewPassword}
              onChange={(e) => setUpdatePasswordNewPassword(e.target.value)}
              label="new password"
              uniqueIdForARIA="update-password-new"
              others={{ required: true, disabled: isUpdatePasswordLoading }}
              variant="outlined"
              fullWidth
            />
            <PasswordInput
              value={updatePasswordConfirmPassword}
              onChange={(e) => setUpdatePasswordConfirmPassword(e.target.value)}
              label="confirm new password"
              uniqueIdForARIA="update-password-confirm"
              others={{ required: true, disabled: isUpdatePasswordLoading }}
              variant="outlined"
              fullWidth
            />
            <div className="profile-form-actions">
              <Button
                color="primary"
                variant="contained"
                type="submit"
                disabled={isUpdatePasswordLoading}
                startIcon={
                  isUpdatePasswordLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                {isUpdatePasswordLoading ? "updating…" : "update password"}
              </Button>
            </div>
          </form>
        </Paper>

        {/* ---- Sessions section ---- */}
        <Paper variant="outlined" className="profile-sessions-card">
          <div className="profile-section-header">
            <DevicesOutlinedIcon
              fontSize="small"
              color="primary"
              aria-hidden="true"
            />
            <Typography variant="h6" component="h2">
              active sessions
            </Typography>
          </div>
          <Divider />
          <PaginatedTable
            rows={sessionTableData || []}
            tableAriaLabel="your active sessions across apps"
            currentPageNumber={1}
            handlePageChange={() => {}}
            totalRowsCount={userDetails?.sessions.length || 0}
            isLoading={userDetails ? false : true}
            pageSize={userDetails?.sessions.length || 0}
            caption="your active sessions across apps"
            hidePaginationOnSinglePage={true}
          />
          <div>
            <Button
              color="error"
              variant="outlined"
              size="small"
              onClick={() => setIsLogoutAllDialogOpen(true)}
            >
              logout from all apps
            </Button>
          </div>
        </Paper>

        {/* ---- Danger zone ---- */}
        <Paper variant="outlined" className="profile-danger-section">
          <div className="profile-section-header">
            <DeleteOutlineIcon
              fontSize="small"
              color="error"
              aria-hidden="true"
            />
            <Typography variant="h6" component="h2" color="error">
              danger zone
            </Typography>
          </div>
          <Divider />

          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            delete {brandConfig.appName} account
          </Typography>
          <form onSubmit={openRemoveAppDialog} className="common-form">
            <PasswordInput
              value={removeAppPassword}
              onChange={(e) => setRemoveAppPassword(e.target.value)}
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
          <form onSubmit={openDeleteAccountDialog} className="common-form">
            <PasswordInput
              value={deleteAccountPassword}
              onChange={(e) => setDeleteAccountPassword(e.target.value)}
              label="password"
              uniqueIdForARIA="delete-account-password"
              others={{ required: true, disabled: isDeleteAccountLoading }}
              variant="outlined"
              fullWidth
            />
            <div className="profile-form-actions">
              <Button
                color="error"
                variant="contained"
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

        <Dialog
          open={isUpdateUsernameDialogOpen}
          onClose={handleUpdateUsernameDialogClose}
          aria-labelledby="update-username-dialog"
        >
          <form onSubmit={updateUsername}>
            <DialogTitle id="alert-dialog-title">update username</DialogTitle>
            <DialogContent className="common-dialog-content">
              <UsernameInput
                value={updateUsernameNewUsername}
                onChange={(e) => setUpdateUsernameNewUsername(e.target.value)}
                label="enter new username"
                uniqueIdForARIA="update-username"
                variant="outlined"
                others={{ required: true, disabled: isUpdateUsernameLoading }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleUpdateUsernameDialogClose}
                disabled={isUpdateUsernameLoading}
                color="inherit"
              >
                cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={isUpdateUsernameLoading}
              >
                {isUpdateUsernameLoading ? <CircularProgress /> : "confirm"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        <Dialog
          open={openUserProfilePhotoUpdateDialog}
          onClose={cancelProfilePhotoUpdate}
          aria-labelledby="update-user-profile-photo-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="update-user-profile-photo-dialog-title">
            crop profile photo
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
              pt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              drag to adjust the crop area — the photo will be uploaded as a 1:1
              square.
            </Typography>
            {userProfilePhotoUpdatePreviewURL && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                keepSelection
                style={{ maxHeight: "60vh", maxWidth: "100%" }}
              >
                <img
                  ref={imgRef}
                  src={userProfilePhotoUpdatePreviewURL}
                  alt="crop preview"
                  style={{ maxWidth: "100%", display: "block" }}
                  onLoad={(e) => {
                    const { naturalWidth: width, naturalHeight: height } =
                      e.currentTarget;
                    const initialCrop = centerCrop(
                      makeAspectCrop(
                        { unit: "%", width: 80 },
                        1,
                        width,
                        height,
                      ),
                      width,
                      height,
                    );
                    setCrop(initialCrop);
                  }}
                />
              </ReactCrop>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelProfilePhotoUpdate} color="inherit">
              cancel
            </Button>
            <Button
              onClick={confirmProfilePhotoUpdate}
              color="primary"
              variant="contained"
              disabled={!completedCrop?.width || !completedCrop?.height}
            >
              crop &amp; upload
            </Button>
          </DialogActions>
        </Dialog>
        <AlertDialog
          open={isDeleteAccountDialogOpen}
          handleClose={closeDeleteAccountDialog}
          handleSuccess={deleteAccount}
          title="delete account"
          confirmButtonColor="error"
          isLoading={isDeleteAccountLoading}
        />
        <AlertDialog
          open={isLogoutAppsDialogOpen}
          handleClose={closeLogoutAppsDialog}
          handleSuccess={() => logoutFromApp(logoutAppName as string)}
          title={`log out all devices from ${logoutAppName}`}
          confirmButtonColor="error"
        />
        <AlertDialog
          open={isLogoutAllDialogOpen}
          handleClose={closeLogoutAllDialog}
          handleSuccess={logoutAll}
          title="log out all devices for all apps"
          confirmButtonColor="error"
        />
        <AlertDialog
          open={isRemoveAppDialogOpen}
          handleClose={closeRemoveAppDialog}
          handleSuccess={removeApp}
          title={`delete ${brandConfig.appName} account`}
          confirmButtonColor="error"
          isLoading={isRemoveAppLoading}
        />
        <AlertDialog
          open={openUserProfilePhotoRemoveDialog}
          handleClose={cancelProfilePhotoRemove}
          handleSuccess={confirmProfilePhotoRemove}
          title={`remove profile photo?`}
          confirmButtonColor="error"
          // isLoading={isRemoveAppLoading}
        />
        {userProfilePhotoURL && (
          <Backdrop
            sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
            open={isPhotoBackdropVisible}
            onClick={() => setIsPhotoBackdropVisible(false)}
          >
            <img
              src={userProfilePhotoURL}
              alt="Profile photo"
              style={{
                width: "85%",
                height: "85%",
                objectFit: "contain",
              }}
            />
          </Backdrop>
        )}
        <Dialog open={isAccountRecoveryBackupCodesDialogOpen}>
          <DialogTitle>account recovery backup codes</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 2 }}>
              save these backup codes in a secure place. each code can be used
              once if you forget your password.
            </Typography>

            <Grid container spacing={1}>
              {accountRecoveryBackupCodes.map((code) => (
                <Grid key={code}>
                  <Paper
                    variant="outlined"
                    sx={{
                      py: 1,
                      textAlign: "center",
                      fontFamily: "monospace",
                      fontSize: 14,
                    }}
                  >
                    {code}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAccountRecoveryBackupCodesCopy}>
              copy all
            </Button>
            <Button onClick={handleAccountRecoveryBackupCodesDownload}>
              download
            </Button>
            <Button
              onClick={handleAccountRecoveryBackupCodesDialogClose}
              variant="contained"
            >
              done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Page>
  );
};

export default ProfilePage;

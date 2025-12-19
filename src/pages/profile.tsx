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

import { Edit } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Alert,
  Avatar,
  Backdrop,
  Button,
  ButtonGroup,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { ProfileState, ProfileStateZ } from "../types/pages/Profile";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";

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
  const [pageState, setPageState] = React.useState<ProfileState | null>(state);
  const [isLoading, changeIsLoading] = React.useState<boolean>(true);
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

  // functions
  const checkForAccessToken = async () => {
    if (pageState) {
      await getUserDetails();
      getUserProfilePhoto();
      changeIsLoading(false);
      return;
    }
    try {
      const accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      const accessToken = accessTokenResponse.data.main.access_token;
      const userDetailsResponse =
        await authenticationCommonBL.getUserDetailsV0(accessToken);
      const username = userDetailsResponse.data.main.username;
      const user_id = userDetailsResponse.data.main.user_id;
      const newState = {
        user: { user_id, username, access_token: accessToken },
      };
      changeIsLoading(false);
      setPageState(newState);
    } catch {
      console.log("user not logged in.");
      changeIsLoading(false);
      navigate("/login");
    }
  };

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
    setPageState(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePhotoUpdatePreviewURL(reader.result as string);
        setOpenUserProfilePhotoUpdateDialog(true);
      };
      reader.readAsDataURL(file);
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
    if (!pageState) {
      return;
    }
    if (userProfilePhotoUpdatePreviewURL) {
      await authenticationCommonBL.updateUserProfilePhotoV0(
        pageState.user.access_token,
        dataURLToFile(userProfilePhotoUpdatePreviewURL, "profile.jpg"),
      );
      changeSnackbarState({
        isOpen: true,
        message: "profile photo updated successfully.",
        severity: "success",
      });
      setUserProfilePhotoURL(userProfilePhotoUpdatePreviewURL);
    }
    setUserProfilePhotoUpdatePreviewURL(null);
    setOpenUserProfilePhotoUpdateDialog(false);
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

      if (response.data.main[0]) {
        setUserDetails((prev) =>
          prev
            ? {
                ...prev,
                profile: response.data.main[0],
              }
            : null,
        );
      }

      changeSnackbarState({
        isOpen: true,
        message: "Profile updated successfully.",
        severity: "success",
      });

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
    checkForAccessToken();
  }, [pageState]);

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
      <Typography variant="h4" component="h1">
        profile
      </Typography>

      <div className="profile-card">
        {isUserProfilePhotoLoading ? (
          <Avatar>
            <CircularProgress />
          </Avatar>
        ) : userProfilePhotoURL ? (
          <Avatar
            alt={pageState?.user.username}
            src={userProfilePhotoURL}
            onClick={() => setIsPhotoBackdropVisible(true)}
          />
        ) : (
          <Avatar>{pageState?.user.username.charAt(0)}</Avatar>
        )}

        <ButtonGroup variant="text" aria-label="Basic button group">
          <Button onClick={handleUpdateUsernameDialogOpen}>
            {pageState?.user.username}
          </Button>
          <Button onClick={handleUpdateUsernameDialogOpen} color="inherit">
            <Edit />
          </Button>
        </ButtonGroup>
      </div>
      <input
        type="file"
        accept="image/jpeg, image/png"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <div>
        <Button
          startIcon={<PhotoCameraIcon />}
          onClick={triggerFileInput}
          color="primary"
        >
          update profile photo
        </Button>
        {userProfilePhotoURL && (
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => setOpenUserProfilePhotoRemoveDialog(true)}
            color="error"
          >
            remove profile photo
          </Button>
        )}
      </div>
      <Card
        sx={{ padding: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {isEditingProfile ? (
          <form onSubmit={handleProfileFieldSave}>
            <TextField
              label="first name"
              variant="outlined"
              value={profileFormData.firstName}
              onChange={handleProfileFieldChange("firstName")}
              fullWidth
            />
            <TextField
              label="last name"
              variant="outlined"
              value={profileFormData.lastName}
              onChange={handleProfileFieldChange("lastName")}
              fullWidth
            />
            <TextField
              label="email"
              variant="outlined"
              type="email"
              value={profileFormData.email}
              onChange={handleProfileFieldChange("email")}
              fullWidth
            />
            <TextField
              label="phone country code"
              variant="outlined"
              value={profileFormData.phoneCountryCode}
              onChange={handleProfileFieldChange("phoneCountryCode")}
              fullWidth
            />
            <TextField
              label="phone number"
              variant="outlined"
              value={profileFormData.phoneNumber}
              onChange={handleProfileFieldChange("phoneNumber")}
              fullWidth
            />
            <Button type="button" onClick={() => setIsEditingProfile(false)}>
              cancel
            </Button>
            <Button color="primary" type="submit">
              save
            </Button>
          </form>
        ) : (
          <>
            <div>
              name:{" "}
              {`${userDetails?.profile.user_profile_first_name || ""} ${
                userDetails?.profile.user_profile_last_name || ""
              }`.trim() || "empty"}
            </div>
            <div>
              email: {userDetails?.profile.user_profile_email || "empty"}
            </div>
            {!!userDetails?.profile.user_profile_email && (
              <div>
                email_verified:{" "}
                {userDetails?.profile.user_profile_email_verified ||
                  "not verified"}
              </div>
            )}
            <div>
              phone number:{" "}
              {userDetails?.profile.user_profile_phone_number
                ? `${userDetails.profile.user_profile_phone_number_country_code}${userDetails.profile.user_profile_phone_number}`
                : "empty"}
            </div>
            <Button
              onClick={() => {
                setProfileFormData({
                  firstName: userDetails?.profile.user_profile_first_name || "",
                  lastName: userDetails?.profile.user_profile_last_name || "",
                  email: userDetails?.profile.user_profile_email || "",
                  phoneNumber:
                    userDetails?.profile.user_profile_phone_number || "",
                  phoneCountryCode:
                    userDetails?.profile
                      .user_profile_phone_number_country_code || "",
                });
                setIsEditingProfile(true);
                setIsEditingProfile(true);
              }}
            >
              Edit
            </Button>
          </>
        )}
      </Card>
      {userDetails?.profile.user_profile_email &&
        !userDetails?.profile.user_profile_email_verified && (
          <>
            {userDetails.email_verification_details ? (
              <form onSubmit={handleEmailVerificationSubmit}>
                {isInCooldown && (
                  <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                    You can request another code in{" "}
                    {formatTime(remainingCooldown)}
                  </Alert>
                )}

                {expiresAt && (
                  <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                    Your code will expire at{" "}
                    {new Date(expiresAt).toLocaleTimeString()}
                  </Alert>
                )}

                <Button
                  onClick={handleSendVerificationEmail}
                  disabled={isInCooldown}
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  {isInCooldown
                    ? `wait ${formatTime(remainingCooldown)}`
                    : "resend code on email"}
                </Button>
                <TextField
                  required
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                />
                <Button type="submit">submit</Button>
              </form>
            ) : (
              <Button onClick={handleSendVerificationEmail}>
                Send verification email
              </Button>
            )}
          </>
        )}
      <Card>
        <Typography variant="h5" component="h2">
          account recovery methods
        </Typography>
        {userDetails &&
          Object.entries(userDetails.recovery_methods).map(
            ([name, isActive], index) => (
              <div key={index}>
                {name}: {isActive ? "active" : "not active"}{" "}
                <Button
                  onClick={() =>
                    handleAccountRecoveryToggle(
                      name as RecoveryMethodEnum,
                      isActive,
                    )
                  }
                >
                  toggle
                </Button>
              </div>
            ),
          )}
      </Card>
      {userDetails && userDetails.recovery_methods.BACKUP_CODE && (
        <>
          {userDetails.backup_code_details && (
            <>
              <Typography>
                {userDetails.backup_code_details.available} of{" "}
                {userDetails.backup_code_details.total} generated codes are
                available. last generated on{" "}
                {new Date(
                  userDetails.backup_code_details.generated_at,
                ).toLocaleDateString()}
              </Typography>
            </>
          )}
          <Button onClick={handleGenerateAccountRecoveryBackupCodes}>
            {userDetails.backup_code_details
              ? "regenerate account backup codes"
              : "generate account backup codes"}
          </Button>
        </>
      )}
      <Typography variant="h5" component="h2">
        update password
      </Typography>
      <form onSubmit={updatePassword} className="common-form">
        <PasswordInput
          value={updatePasswordOldPassword}
          onChange={(e) => setUpdatePasswordOldPassword(e.target.value)}
          label="enter existing password"
          uniqueIdForARIA="update-password-old"
          others={{ required: true, disabled: isUpdatePasswordLoading }}
          variant="outlined"
        />
        <PasswordInput
          value={updatePasswordNewPassword}
          onChange={(e) => setUpdatePasswordNewPassword(e.target.value)}
          label="enter desired password"
          uniqueIdForARIA="update-password-new"
          others={{ required: true, disabled: isUpdatePasswordLoading }}
          variant="outlined"
        />
        <PasswordInput
          value={updatePasswordConfirmPassword}
          onChange={(e) => setUpdatePasswordConfirmPassword(e.target.value)}
          label="confirm desired password"
          uniqueIdForARIA="update-password-confirm"
          others={{ required: true, disabled: isUpdatePasswordLoading }}
          variant="outlined"
        />
        <Button
          color="primary"
          type="submit"
          disabled={isUpdatePasswordLoading}
        >
          {isUpdatePasswordLoading ? <CircularProgress /> : "update password"}
        </Button>
      </form>

      <Typography variant="h5" component="h2">
        delete {brandConfig.appName} account
      </Typography>
      <form onSubmit={openRemoveAppDialog} className="common-form">
        <PasswordInput
          value={removeAppPassword}
          onChange={(e) => {
            setRemoveAppPassword(e.target.value);
          }}
          label="password"
          uniqueIdForARIA="remove-app-password"
          others={{ required: true, disabled: isRemoveAppLoading }}
          variant="outlined"
        />
        <Button color="error" type="submit" disabled={isRemoveAppLoading}>
          delete {brandConfig.appName} account
        </Button>
      </form>

      <Typography variant="h5" component="h2">
        delete account
      </Typography>
      <form onSubmit={openDeleteAccountDialog} className="common-form">
        <PasswordInput
          value={deleteAccountPassword}
          onChange={(e) => {
            setDeleteAccountPassword(e.target.value);
          }}
          label="password"
          uniqueIdForARIA="delete-account-password"
          others={{ required: true, disabled: isDeleteAccountLoading }}
          variant="outlined"
        />
        <Button color="error" type="submit" disabled={isDeleteAccountLoading}>
          Delete Account
        </Button>
      </form>

      <Typography variant="h5" component="h2">
        active sessions
      </Typography>
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

      <Button color="error" onClick={() => setIsLogoutAllDialogOpen(true)}>
        logout from all apps
      </Button>

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
      >
        <DialogTitle id="update-user-profile-photo-dialog-title">
          update profile photo?
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {userProfilePhotoUpdatePreviewURL && (
            <Avatar
              src={userProfilePhotoUpdatePreviewURL}
              alt="new user profile photo preview"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelProfilePhotoUpdate} color="inherit">
            cancel
          </Button>
          <Button onClick={confirmProfilePhotoUpdate} color="primary">
            confirm update
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
    </Page>
  );
};

export default ProfilePage;

import "../stylesheets/profile.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import {
  GetUserDetailsV0ResponseZ,
  RecoveryMethodEnum,
} from "squarecommonblhelper";
import {
  AlertDialog,
  UsernameInput,
} from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";
import {
  Crop,
  PixelCrop,
} from "react-image-crop";

import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { ProfileState, ProfileStateZ } from "../types/pages/Profile";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";
import { useAuth } from "../utils/auth";
import { useServerCheck } from "../context/serverCheck";
import { isNetworkError } from "../utils/networkError";

import ProfileHeroCard from "../components/profile/ProfileHeroCard";
import ProfileDetailsSection from "../components/profile/ProfileDetailsSection";
import EmailVerificationSection from "../components/profile/EmailVerificationSection";
import AccountRecoverySection from "../components/profile/AccountRecoverySection";
import UpdatePasswordSection from "../components/profile/UpdatePasswordSection";
import ActiveSessionsSection from "../components/profile/ActiveSessionsSection";
import DangerZoneSection from "../components/profile/DangerZoneSection";
import ProfilePhotoUpdateDialog from "../components/profile/ProfilePhotoUpdateDialog";
import BackupCodesDialog from "../components/profile/BackupCodesDialog";

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

  // ── auth ──────────────────────────────────────────────────────────────────
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const triggerServerCheck = useServerCheck();
  const {
    user,
    isLoading,
    setUser: setAuthUser,
  } = useAuth(state?.user, { redirectIfLoggedOut: "/login" }, triggerServerCheck);
  const [pageState, setPageState] = React.useState<ProfileState | null>(state);

  // ── delete account ────────────────────────────────────────────────────────
  const [deleteAccountPassword, setDeleteAccountPassword] =
    React.useState<string>("");
  const [isDeleteAccountLoading, setIsDeleteAccountLoading] =
    React.useState<boolean>(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    React.useState<boolean>(false);

  // ── remove app ────────────────────────────────────────────────────────────
  const [removeAppPassword, setRemoveAppPassword] = React.useState<string>("");
  const [isRemoveAppLoading, setIsRemoveAppLoading] =
    React.useState<boolean>(false);
  const [isRemoveAppDialogOpen, setIsRemoveAppDialogOpen] =
    React.useState<boolean>(false);

  // ── profile details ───────────────────────────────────────────────────────
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

  // ── account recovery ──────────────────────────────────────────────────────
  const [accountRecoveryBackupCodes, setAccountRecoveryBackupCodes] =
    React.useState<string[]>([]);
  const [
    isAccountRecoveryBackupCodesDialogOpen,
    setIsAccountRecoveryBackupCodesDialogOpen,
  ] = React.useState<boolean>(false);

  // ── update username ───────────────────────────────────────────────────────
  const [updateUsernameNewUsername, setUpdateUsernameNewUsername] =
    React.useState<string>(state ? state.user.username : "");
  const [isUpdateUsernameLoading, setIsUpdateUsernameLoading] =
    React.useState<boolean>(false);
  const [isUpdateUsernameDialogOpen, setIsUpdateUsernameDialogOpen] =
    React.useState<boolean>(false);

  // ── update password ───────────────────────────────────────────────────────
  const [updatePasswordOldPassword, setUpdatePasswordOldPassword] =
    React.useState<string>("");
  const [updatePasswordNewPassword, setUpdatePasswordNewPassword] =
    React.useState<string>("");
  const [updatePasswordConfirmPassword, setUpdatePasswordConfirmPassword] =
    React.useState<string>("");
  const [isUpdatePasswordLoading, setIsUpdatePasswordLoading] =
    React.useState<boolean>(false);

  // ── user details ──────────────────────────────────────────────────────────
  const [userDetails, setUserDetails] = React.useState<z.infer<
    typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
  > | null>(null);
  const [userProfilePhotoURL, setUserProfilePhotoURL] = React.useState<
    string | null
  >(null);
  const [isUserProfilePhotoLoading, setIsUserProfilePhotoLoading] =
    React.useState<boolean>(false);

  // ── logout apps ───────────────────────────────────────────────────────────
  const [isLogoutAppsDialogOpen, setIsLogoutAppsDialogOpen] =
    React.useState<boolean>(false);
  const [logoutAppName, setLogoutAppName] = React.useState<string | null>(null);

  // ── logout all ────────────────────────────────────────────────────────────
  const [isLogoutAllDialogOpen, setIsLogoutAllDialogOpen] =
    React.useState<boolean>(false);

  // ── profile photo update ──────────────────────────────────────────────────
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

  // ── misc loading ──────────────────────────────────────────────────────────
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState<boolean>(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = React.useState<boolean>(false);
  const [isTogglingRecovery, setIsTogglingRecovery] = React.useState<boolean>(false);
  const [isGeneratingBackupCodes, setIsGeneratingBackupCodes] = React.useState<boolean>(false);

  // ── photo backdrop ────────────────────────────────────────────────────────
  const [isPhotoBackdropVisible, setIsPhotoBackdropVisible] =
    React.useState(false);

  // ── crop state ────────────────────────────────────────────────────────────
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const imgRef = React.useRef<HTMLImageElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── helpers ───────────────────────────────────────────────────────────────
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

  const showError = (error: unknown) => {
    if (isNetworkError(error)) {
      triggerServerCheck();
    } else {
      changeSnackbarState({
        isOpen: true,
        message: (error as Error).message,
        severity: "error",
      });
    }
  };

  // ── api functions ─────────────────────────────────────────────────────────
  const openDeleteAccountDialog = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleteAccountDialogOpen(true);
  };

  const closeDeleteAccountDialog = () => {
    if (isDeleteAccountLoading) return;
    setIsDeleteAccountLoading(false);
    setIsDeleteAccountDialogOpen(false);
  };

  const deleteAccount = async () => {
    if (!pageState) return;
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
      showError(error);
      setIsDeleteAccountLoading(false);
      closeDeleteAccountDialog();
    }
  };

  const updateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageState) return;
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
      setPageState({ user: { ...pageState.user, username: updateUsernameNewUsername } });
    } catch (error) {
      showError(error);
      setIsUpdateUsernameLoading(false);
      setIsUpdateUsernameDialogOpen(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageState) return;
    if (!updatePasswordNewPassword || !updatePasswordOldPassword || !updatePasswordConfirmPassword) return;
    if (updatePasswordNewPassword !== updatePasswordConfirmPassword) {
      changeSnackbarState({ isOpen: true, message: "confirmation of desired password failed.", severity: "error" });
      return;
    }
    if (updatePasswordNewPassword === updatePasswordOldPassword) {
      changeSnackbarState({ isOpen: true, message: "desired password is same as the existing password.", severity: "error" });
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
      changeSnackbarState({ isOpen: true, message: "password updated successfully.", severity: "success" });
      setUpdatePasswordOldPassword("");
      setUpdatePasswordNewPassword("");
      setUpdatePasswordConfirmPassword("");
    } catch (error) {
      showError(error);
      setIsUpdatePasswordLoading(false);
    }
  };

  const getUserDetails = async () => {
    if (!pageState) return;
    try {
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        pageState.user.access_token,
      );
      setUserDetails(userDetailsResponse.data.main);
      if (userDetailsResponse.data.main.email_verification_details) {
        setCooldownResetAt(userDetailsResponse.data.main.email_verification_details.cooldown_reset_at);
        setExpiresAt(userDetailsResponse.data.main.email_verification_details.expires_at);
        setRemainingCooldown(calculateRemainingCooldown(userDetailsResponse.data.main.email_verification_details.cooldown_reset_at));
      }
    } catch (error) {
      showError(error);
    }
  };

  const getUserProfilePhoto = async () => {
    if (!pageState) return;
    try {
      setIsUserProfilePhotoLoading(true);
      const userDetailsResponse = await authenticationCommonBL.getUserProfilePhotoV0(
        pageState.user.access_token,
      );
      if (userDetailsResponse instanceof Blob && userDetailsResponse.size > 0) {
        setUserProfilePhotoURL(URL.createObjectURL(userDetailsResponse));
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsUserProfilePhotoLoading(false);
    }
  };

  const logoutFromApp = async (app_name: string) => {
    if (!pageState) return;
    try {
      setIsLoggingOut(true);
      await authenticationCommonBL.logoutAppsV0(pageState.user.access_token, [app_name]);
      setAuthUser(null);
      setPageState(null);
      setIsLogoutAppsDialogOpen(false);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const logoutAll = async () => {
    if (!pageState) return;
    try {
      setIsLoggingOut(true);
      await authenticationCommonBL.logoutAllV0(pageState.user.access_token);
      setAuthUser(null);
      setPageState(null);
      setIsLogoutAllDialogOpen(false);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const openRemoveAppDialog = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRemoveAppDialogOpen(true);
  };

  const closeRemoveAppDialog = () => {
    if (isRemoveAppLoading) return;
    setIsRemoveAppLoading(false);
    setIsRemoveAppDialogOpen(false);
  };

  const removeApp = async () => {
    if (!pageState) return;
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
      showError(error);
      setIsRemoveAppLoading(false);
      closeRemoveAppDialog();
    }
  };

  const nullifyPageState = () => {
    setAuthUser(null);
    setPageState(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (userProfilePhotoUpdatePreviewURL) {
        URL.revokeObjectURL(userProfilePhotoUpdatePreviewURL);
      }
      setUserProfilePhotoUpdatePreviewURL(URL.createObjectURL(file));
      setCrop(undefined);
      setCompletedCrop(undefined);
      setOpenUserProfilePhotoUpdateDialog(true);
    }
    if (event.target) event.target.value = "";
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const confirmProfilePhotoUpdate = async () => {
    if (!pageState) return;
    if (!imgRef.current || !completedCrop || !userProfilePhotoUpdatePreviewURL) return;

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

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
      try {
        setIsUserProfilePhotoLoading(true);
        await authenticationCommonBL.updateUserProfilePhotoV0(
          pageState.user.access_token,
          croppedFile,
        );
        changeSnackbarState({ isOpen: true, message: "profile photo updated successfully.", severity: "success" });
        setUserProfilePhotoURL(canvas.toDataURL("image/jpeg"));
      } catch (error) {
        showError(error);
      } finally {
        URL.revokeObjectURL(userProfilePhotoUpdatePreviewURL);
        setUserProfilePhotoUpdatePreviewURL(null);
        setOpenUserProfilePhotoUpdateDialog(false);
        setIsUserProfilePhotoLoading(false);
      }
    }, "image/jpeg");
  };

  const cancelProfilePhotoUpdate = () => {
    setUserProfilePhotoUpdatePreviewURL(null);
    setOpenUserProfilePhotoUpdateDialog(false);
  };

  const confirmProfilePhotoRemove = async () => {
    if (!pageState) return;
    try {
      setIsUserProfilePhotoLoading(true);
      await authenticationCommonBL.updateUserProfilePhotoV0(
        pageState.user.access_token,
        undefined,
      );
      changeSnackbarState({ isOpen: true, message: "profile photo removed successfully.", severity: "success" });
      setUserProfilePhotoURL(null);
      setUserProfilePhotoUpdatePreviewURL(null);
      setOpenUserProfilePhotoRemoveDialog(false);
    } catch (error) {
      showError(error);
    } finally {
      setIsUserProfilePhotoLoading(false);
    }
  };

  const handleProfileFieldChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handlePhoneChange = (_: string, info: { nationalNumber?: string | null; countryCallingCode?: string | null }) => {
    setProfileFormData((prev) => ({
      ...prev,
      phoneNumber: info.nationalNumber || "",
      phoneCountryCode: info.countryCallingCode ? `+${info.countryCallingCode}` : "",
    }));
  };

  const handleProfileFieldSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageState) return;
    try {
      setIsUpdatingProfile(true);
      const response = await authenticationCommonBL.updateProfileDetailsV0(
        pageState.user.access_token,
        profileFormData.firstName || undefined,
        profileFormData.lastName || undefined,
        profileFormData.email || undefined,
        profileFormData.phoneCountryCode || undefined,
        profileFormData.phoneNumber || undefined,
      );
      if (response.data.main) {
        setUserDetails((prev) => prev ? { ...prev, profile: response.data.main } : null);
      }
      changeSnackbarState({ isOpen: true, message: "Profile updated successfully.", severity: "success" });
      getUserDetails();
      setIsEditingProfile(false);
    } catch (error) {
      showError(error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!pageState) return;
    try {
      setIsVerifyingEmail(true);
      await authenticationCommonBL.sendVerificationEmailV0(pageState.user.access_token);
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(pageState.user.access_token);
      setUserDetails(userDetailsResponse.data.main);
      if (userDetailsResponse.data.main.email_verification_details) {
        setCooldownResetAt(userDetailsResponse.data.main.email_verification_details.cooldown_reset_at);
        setExpiresAt(userDetailsResponse.data.main.email_verification_details.expires_at);
        setRemainingCooldown(calculateRemainingCooldown(userDetailsResponse.data.main.email_verification_details.cooldown_reset_at));
      }
      changeSnackbarState({ isOpen: true, message: "verification email sent successfully.", severity: "success" });
    } catch (error) {
      showError(error);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleEmailVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageState) return;
    try {
      setIsVerifyingEmail(true);
      await authenticationCommonBL.validateEmailVerificationCodeV0(
        pageState.user.access_token,
        emailVerificationCode,
      );
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(pageState.user.access_token);
      setUserDetails(userDetailsResponse.data.main);
      changeSnackbarState({ isOpen: true, message: "email verified successfully.", severity: "success" });
    } catch (error) {
      showError(error);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleAccountRecoveryToggle = async (
    method: RecoveryMethodEnum,
    isActiveCurrently: boolean,
  ) => {
    if (!pageState) return;
    try {
      setIsTogglingRecovery(true);
      const recoveryMethodsToRemove: RecoveryMethodEnum[] = isActiveCurrently ? [method] : [];
      const recoveryMethodsToAdd: RecoveryMethodEnum[] = isActiveCurrently ? [] : [method];
      await authenticationCommonBL.updateUserRecoveryMethodsV0(
        pageState.user.access_token,
        recoveryMethodsToAdd,
        recoveryMethodsToRemove,
      );
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(pageState.user.access_token);
      setUserDetails(userDetailsResponse.data.main);
      changeSnackbarState({ isOpen: true, message: `account recovery method ${method} toggled successfully.`, severity: "success" });
    } catch (error) {
      showError(error);
    } finally {
      setIsTogglingRecovery(false);
    }
  };

  const handleGenerateAccountRecoveryBackupCodes = async () => {
    if (!pageState) return;
    try {
      setIsGeneratingBackupCodes(true);
      const response = await authenticationCommonBL.generateAccountBackupCodesV0(pageState.user.access_token);
      setAccountRecoveryBackupCodes(response.data.main.backup_codes);
      setIsAccountRecoveryBackupCodesDialogOpen(true);
    } catch (error) {
      showError(error);
    } finally {
      setIsGeneratingBackupCodes(false);
    }
  };

  const handleAccountRecoveryBackupCodesCopy = async () => {
    await navigator.clipboard.writeText(accountRecoveryBackupCodes.join("\n"));
  };

  const handleAccountRecoveryBackupCodesDialogClose = async () => {
    if (pageState) {
      const userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(pageState.user.access_token);
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
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  // ── effects ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (user) {
      setPageState({ user });
      getUserDetails();
      getUserProfilePhoto();
    }
  }, [user]);

  React.useEffect(() => {
    return () => {
      if (userProfilePhotoURL) URL.revokeObjectURL(userProfilePhotoURL);
    };
  }, [userProfilePhotoURL]);

  React.useEffect(() => {
    if (!cooldownResetAt) return;
    const interval = setInterval(() => {
      const remaining = calculateRemainingCooldown(cooldownResetAt);
      setRemainingCooldown(remaining);
      if (remaining <= 0) { setCooldownResetAt(null); clearInterval(interval); }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownResetAt]);

  // ── derived ───────────────────────────────────────────────────────────────
  const sessionTableData = userDetails?.sessions.map((row) => ({
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
  }));

  // ── render ────────────────────────────────────────────────────────────────
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
        <Typography variant="h4" component="h1" className="profile-title">
          profile
        </Typography>

        <ProfileHeroCard
          username={pageState?.user.username}
          userProfilePhotoURL={userProfilePhotoURL}
          isUserProfilePhotoLoading={isUserProfilePhotoLoading}
          onOpenPhotoBackdrop={() => setIsPhotoBackdropVisible(true)}
          onTriggerFileInput={triggerFileInput}
          onRemovePhotoDialogOpen={() => setOpenUserProfilePhotoRemoveDialog(true)}
          onUpdateUsernameDialogOpen={() => setIsUpdateUsernameDialogOpen(true)}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />

        <ProfileDetailsSection
          userDetails={userDetails}
          isEditingProfile={isEditingProfile}
          profileFormData={profileFormData}
          isUpdatingProfile={isUpdatingProfile}
          onProfileFieldChange={handleProfileFieldChange}
          onPhoneChange={handlePhoneChange}
          onProfileFieldSave={handleProfileFieldSave}
          onEditStart={() => {
            setProfileFormData({
              firstName: userDetails?.profile.user_profile_first_name || "",
              lastName: userDetails?.profile.user_profile_last_name || "",
              email: userDetails?.profile.user_profile_email || "",
              phoneNumber: userDetails?.profile.user_profile_phone_number || "",
              phoneCountryCode: userDetails?.profile.user_profile_phone_number_country_code || "",
            });
            setIsEditingProfile(true);
          }}
          onEditCancel={() => setIsEditingProfile(false)}
        />

        <EmailVerificationSection
          userDetails={userDetails}
          emailVerificationCode={emailVerificationCode}
          isVerifyingEmail={isVerifyingEmail}
          isInCooldown={isInCooldown}
          remainingCooldown={remainingCooldown}
          expiresAt={expiresAt}
          onEmailVerificationCodeChange={setEmailVerificationCode}
          onSendVerificationEmail={handleSendVerificationEmail}
          onEmailVerificationSubmit={handleEmailVerificationSubmit}
          formatTime={formatTime}
        />

        <AccountRecoverySection
          userDetails={userDetails}
          isTogglingRecovery={isTogglingRecovery}
          isGeneratingBackupCodes={isGeneratingBackupCodes}
          onRecoveryToggle={handleAccountRecoveryToggle}
          onGenerateBackupCodes={handleGenerateAccountRecoveryBackupCodes}
        />

        <UpdatePasswordSection
          username={pageState?.user.username}
          oldPassword={updatePasswordOldPassword}
          newPassword={updatePasswordNewPassword}
          confirmPassword={updatePasswordConfirmPassword}
          isLoading={isUpdatePasswordLoading}
          onOldPasswordChange={(e) => setUpdatePasswordOldPassword(e.target.value)}
          onNewPasswordChange={(e) => setUpdatePasswordNewPassword(e.target.value)}
          onConfirmPasswordChange={(e) => setUpdatePasswordConfirmPassword(e.target.value)}
          onSubmit={updatePassword}
        />

        <ActiveSessionsSection
          userDetails={userDetails}
          sessionTableData={sessionTableData}
          isLoggingOut={isLoggingOut}
          onLogoutAllDialogOpen={() => setIsLogoutAllDialogOpen(true)}
        />

        <DangerZoneSection
          removeAppPassword={removeAppPassword}
          deleteAccountPassword={deleteAccountPassword}
          isRemoveAppLoading={isRemoveAppLoading}
          isDeleteAccountLoading={isDeleteAccountLoading}
          onRemoveAppPasswordChange={(e) => setRemoveAppPassword(e.target.value)}
          onDeleteAccountPasswordChange={(e) => setDeleteAccountPassword(e.target.value)}
          onRemoveAppSubmit={openRemoveAppDialog}
          onDeleteAccountSubmit={openDeleteAccountDialog}
        />

        {/* ── Dialogs ──────────────────────────────────────────────────── */}
        <Dialog
          open={isUpdateUsernameDialogOpen}
          onClose={() => setIsUpdateUsernameDialogOpen(false)}
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
              <Button variant={"contained" as any} onClick={() => setIsUpdateUsernameDialogOpen(false)}
                disabled={isUpdateUsernameLoading}
                color="inherit"
              >
                cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={isUpdateUsernameLoading}
                startIcon={
                  isUpdateUsernameLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                {isUpdateUsernameLoading ? "confirming…" : "confirm"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <ProfilePhotoUpdateDialog
          open={openUserProfilePhotoUpdateDialog}
          previewURL={userProfilePhotoUpdatePreviewURL}
          isLoading={isUserProfilePhotoLoading}
          crop={crop}
          completedCrop={completedCrop}
          imgRef={imgRef}
          onCropChange={setCrop}
          onCropComplete={setCompletedCrop}
          onSetCrop={setCrop}
          onConfirm={confirmProfilePhotoUpdate}
          onCancel={cancelProfilePhotoUpdate}
        />

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
          handleClose={() => setIsLogoutAppsDialogOpen(false)}
          handleSuccess={() => logoutFromApp(logoutAppName as string)}
          title={`log out all devices from ${logoutAppName}`}
          confirmButtonColor="error"
          isLoading={isLoggingOut}
        />
        <AlertDialog
          open={isLogoutAllDialogOpen}
          handleClose={() => setIsLogoutAllDialogOpen(false)}
          handleSuccess={logoutAll}
          title="log out all devices for all apps"
          confirmButtonColor="error"
          isLoading={isLoggingOut}
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
          handleClose={() => setOpenUserProfilePhotoRemoveDialog(false)}
          handleSuccess={confirmProfilePhotoRemove}
          title="remove profile photo?"
          confirmButtonColor="error"
          isLoading={isUserProfilePhotoLoading}
        />

        <BackupCodesDialog
          open={isAccountRecoveryBackupCodesDialogOpen}
          backupCodes={accountRecoveryBackupCodes}
          username={userDetails?.username}
          onCopy={handleAccountRecoveryBackupCodesCopy}
          onDownload={handleAccountRecoveryBackupCodesDownload}
          onClose={handleAccountRecoveryBackupCodesDialogClose}
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
              style={{ width: "85%", height: "85%", objectFit: "contain" }}
            />
          </Backdrop>
        )}
      </div>
    </Page>
  );
};

export default ProfilePage;

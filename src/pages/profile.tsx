import "../stylesheets/profile.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import { GetUserDetailsV0ResponseZ } from "squarecommonblhelper";
import { AlertDialog, PaginatedTable, PasswordInput } from "squarecomponents";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";

import { Edit } from "@mui/icons-material";
import {
  Avatar,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  } catch (e) {
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
  // logout apps
  const [isLogoutAppsDialogOpen, setIsLogoutAppsDialogOpen] =
    React.useState<boolean>(false);
  const [logoutAppName, setLogoutAppName] = React.useState<string | null>(null);
  // logout all
  const [isLogoutAllDialogOpen, setIsLogoutAllDialogOpen] =
    React.useState<boolean>(false);

  // functions
  const checkForAccessToken = async () => {
    if (pageState) {
      await getUserDetails();
      changeIsLoading(false);
      return;
    }
    try {
      let accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      let accessToken = accessTokenResponse.data.main.access_token;
      let userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        accessToken
      );
      let username =
        userDetailsResponse.data.main.profile.user_profile_username;
      let user_id = userDetailsResponse.data.main.user_id;
      let newState = { user: { user_id, username, access_token: accessToken } };
      changeIsLoading(false);
      setPageState(newState);
    } catch (e) {
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
        deleteAccountPassword
      );
      setIsDeleteAccountLoading(false);
      navigate("/login");
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
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
        updateUsernameNewUsername
      );
      setIsUpdateUsernameLoading(false);
      setIsUpdateUsernameDialogOpen(false);
      changeSnackbarState({
        isOpen: true,
        message: "Username updated successfully.",
        severity: "success",
      });
      let newState = {
        user: { ...pageState.user, username: updateUsernameNewUsername },
      };
      setPageState(newState);
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
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
      await authenticationCommonBL.updatePasswordV0(
        pageState.user.access_token,
        updatePasswordOldPassword,
        updatePasswordNewPassword
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
        message: (error as any).message,
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
      let userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        pageState.user.access_token
      );

      setUserDetails(userDetailsResponse.data.main);
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
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
        message: (error as any).message,
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
        message: (error as any).message,
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
        removeAppPassword
      );
      setIsRemoveAppLoading(false);
      navigate("/login");
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
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

  // useEffect
  React.useEffect(() => {
    checkForAccessToken();
  }, []);

  React.useEffect(() => {
    checkForAccessToken();
  }, [pageState]);

  // misc
  let sessionTableData = userDetails?.sessions.map((row) => {
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

  return (
    <Page
      user={pageState?.user}
      nullifyPageStateFunction={nullifyPageState}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      className="profile-page"
      isLoading={isLoading}
    >
      <Typography variant="h4" component="h1">
        profile
      </Typography>

      <div className="profile-card">
        <Avatar>{pageState?.user.username.charAt(0)}</Avatar>
        <ButtonGroup variant="text" aria-label="Basic button group">
          <Button onClick={handleUpdateUsernameDialogOpen}>
            {pageState?.user.username}
          </Button>
          <Button onClick={handleUpdateUsernameDialogOpen} color="inherit">
            <Edit />
          </Button>
        </ButtonGroup>
      </div>

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
            <TextField
              value={updateUsernameNewUsername}
              onChange={(e) => setUpdateUsernameNewUsername(e.target.value)}
              disabled={isUpdateUsernameLoading}
              label="enter new username"
              required
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
    </Page>
  );
};

export default ProfilePage;

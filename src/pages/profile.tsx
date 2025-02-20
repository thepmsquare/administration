import "../stylesheets/profile.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput } from "squarecomponents";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, CircularProgress, Paper, TextField } from "@mui/material";

import AlertDialog from "../components/AlertDialog";
import CustomAppBar from "../components/CustomAppBar";
import Page from "../components/Page";
import { ProfileState, ProfileStateZ } from "../types/pages/Profile";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "../utils/initialiser";

export const Head: HeadFC = () => <title>thePmSquare | administration</title>;

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
  // delete account
  const [deleteAccountPassword, setDeleteAccountPassword] =
    React.useState<string>("");
  const [isDeleteAccountLoading, setIsDeleteAccountLoading] =
    React.useState<boolean>(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    React.useState<boolean>(false);
  // update username
  const [updateUsernameNewUsername, setUpdateUsernameNewUsername] =
    React.useState<string>(state ? state.user.username : "");
  const [isUpdateUsernameLoading, setIsUpdateUsernameLoading] =
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
  // functions

  const checkForAccessToken = async () => {
    if (state) {
      return;
    }
    try {
      let accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      let accessToken = accessTokenResponse.data.main.access_token;
      let userDetailsResponse = await authenticationCommonBL.getUserDetailsV0(
        accessToken
      );
      let username = userDetailsResponse.data.main.credentials.username;
      let user_id = userDetailsResponse.data.main.user_id;
      let newState = { user: { user_id, username, access_token: accessToken } };
      state = newState;
      navigate("/profile", { state: newState });
    } catch (e) {
      console.log("user not logged in.");
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
    if (!state) {
      return;
    }
    try {
      setIsDeleteAccountLoading(true);
      await authenticationCommonBL.deleteUserV0(
        state.user.access_token,
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
    if (!state) {
      return;
    }
    if (updateUsernameNewUsername === state.user.username) {
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
        state.user.access_token,
        updateUsernameNewUsername
      );
      setIsUpdateUsernameLoading(false);
      changeSnackbarState({
        isOpen: true,
        message: "Username updated successfully.",
        severity: "success",
      });
      let newState = {
        user: { ...state.user, username: updateUsernameNewUsername },
      };
      navigate("/profile", { state: newState });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
        severity: "error",
      });
      setIsUpdateUsernameLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) {
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
        state.user.access_token,
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
  // useEffect
  React.useEffect(() => {
    checkForAccessToken();
  }, []);

  // misc

  return (
    <Page>
      <Paper square>
        <CustomAppBar
          user={state ? state.user : null}
          changeSnackbarState={changeSnackbarState}
        />
        hi {state ? state.user.username : "user"}
        <Paper>
          <form onSubmit={updateUsername}>
            <TextField
              value={updateUsernameNewUsername}
              onChange={(e) => setUpdateUsernameNewUsername(e.target.value)}
              disabled={isUpdateUsernameLoading}
              label="Enter New Username"
              required
            />
            <Button
              color="primary"
              type="submit"
              disabled={isUpdateUsernameLoading}
            >
              {isUpdateUsernameLoading ? (
                <CircularProgress />
              ) : (
                "update username"
              )}
            </Button>
          </form>
        </Paper>
        <Paper>
          <form onSubmit={updatePassword}>
            <PasswordInput
              value={updatePasswordOldPassword}
              onChange={(e) => setUpdatePasswordOldPassword(e.target.value)}
              label="enter existing password"
              uniqueIdForARIA="update-password-old"
              others={{ required: true, disabled: isUpdatePasswordLoading }}
            />
            <PasswordInput
              value={updatePasswordNewPassword}
              onChange={(e) => setUpdatePasswordNewPassword(e.target.value)}
              label="enter desired password"
              uniqueIdForARIA="update-password-new"
              others={{ required: true, disabled: isUpdatePasswordLoading }}
            />
            <PasswordInput
              value={updatePasswordConfirmPassword}
              onChange={(e) => setUpdatePasswordConfirmPassword(e.target.value)}
              label="confirm desired password"
              uniqueIdForARIA="update-password-confirm"
              others={{ required: true, disabled: isUpdatePasswordLoading }}
            />
            <Button
              color="primary"
              type="submit"
              disabled={isUpdatePasswordLoading}
            >
              {isUpdatePasswordLoading ? (
                <CircularProgress />
              ) : (
                "update password"
              )}
            </Button>
          </form>
        </Paper>
        <Paper>
          <form onSubmit={openDeleteAccountDialog}>
            <PasswordInput
              value={deleteAccountPassword}
              onChange={(e) => {
                setDeleteAccountPassword(e.target.value);
              }}
              label="Enter Password to Delete Account"
              uniqueIdForARIA="delete-account-password"
              others={{ required: true, disabled: isDeleteAccountLoading }}
            />
            <Button
              color="error"
              type="submit"
              disabled={isDeleteAccountLoading}
            >
              Delete Account
            </Button>
          </form>
        </Paper>
        <AlertDialog
          open={isDeleteAccountDialogOpen}
          handleClose={closeDeleteAccountDialog}
          handleSuccess={deleteAccount}
          title="delete account"
          confirmButtonColor="error"
          isLoading={isDeleteAccountLoading}
        />
        <CustomSnackbar
          snackbarState={snackbarState}
          changeSnackbarState={changeSnackbarState}
        />
      </Paper>
    </Page>
  );
};

export default ProfilePage;

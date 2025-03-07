import "../stylesheets/profile.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import { GetUserDetailsV0ResponseZ } from "squarecommonblhelper";
import { PasswordInput } from "squarecomponents";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";
import { z } from "zod";

import {
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

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
  const [pageState, setPageState] = React.useState<ProfileState | null>(state);
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
  // user details
  const [userDetails, setUserDetails] = React.useState<z.infer<
    typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
  > | null>(null);
  // functions

  const checkForAccessToken = async () => {
    if (pageState) {
      await getUserDetails();
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
      setPageState(newState);
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
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
        severity: "error",
      });
    }
  };
  // useEffect
  React.useEffect(() => {
    checkForAccessToken();
  }, []);
  React.useEffect(() => {
    checkForAccessToken();
  }, [pageState]);
  // misc

  return (
    <Page>
      <Paper square>
        <CustomAppBar
          user={pageState ? pageState.user : null}
          changeSnackbarState={changeSnackbarState}
        />
        hi {pageState ? pageState.user.username : "user"}
        <TableContainer component={Paper}>
          {userDetails ? (
            <Table>
              <caption>your active sessions across apps</caption>
              <TableHead>
                <TableRow>
                  <TableCell>app id</TableCell>
                  <TableCell align="right">number of sessions</TableCell>
                  <TableCell align="right">
                    <Button color="error">logout</Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userDetails.sessions.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell component="th" scope="row">
                      {row.app_name}
                    </TableCell>
                    <TableCell align="right">{row.active_sessions}</TableCell>
                    <TableCell align="right">
                      <Button
                        color="error"
                        onClick={() => {
                          logoutFromApp(row.app_name);
                        }}
                      >
                        logout
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CircularProgress />
          )}
        </TableContainer>
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

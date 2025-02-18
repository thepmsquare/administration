import "../stylesheets/profile.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput } from "squarecomponents";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Alert, Button, Paper } from "@mui/material";

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

  const [deleteAccountPassword, setDeleteAccountPassword] =
    React.useState<string>("");
  const [isDeleteAccountLoading, setIsDeleteAccountLoading] =
    React.useState<boolean>(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
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
          <form onSubmit={openDeleteAccountDialog}>
            <PasswordInput
              value={deleteAccountPassword}
              onChange={(e) => {
                setDeleteAccountPassword(e.target.value);
              }}
              label="Enter Password to Delete Account"
              uniqueIdForARIA="delete-account-password"
              others={{ required: true }}
            />
            <Button color="error" type="submit">
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

import "../stylesheets/profile.css";

import { HeadFC, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput } from "squarecomponents";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Paper } from "@mui/material";

import CustomAppBar from "../components/CustomAppBar";
import Page from "../components/Page";
import { ProfileState, ProfileStateZ } from "../types/pages/Profile";
import {
  authenticationAdministrationBL,
  authenticationCommonBL
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

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) {
      return;
    }
    try {
      console.log(state);
      await authenticationCommonBL.deleteUserV0(
        deleteAccountPassword,
        state.user.access_token
      );
      navigate("/login");
    } catch (error) {
      console.log("error deleting account");
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

  React.useEffect(() => {}, [location.state]);

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
          <form onSubmit={deleteAccount}>
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
        <CustomSnackbar
          snackbarState={snackbarState}
          changeSnackbarState={changeSnackbarState}
        />
      </Paper>
    </Page>
  );
};

export default ProfilePage;

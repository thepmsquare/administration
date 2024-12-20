import "../stylesheets/register.css";

import { HeadFC, Link, navigate, PageProps } from "gatsby";
import * as React from "react";
import { PasswordInput } from "squarecomponents";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Paper, TextField } from "@mui/material";

import CustomAppBar from "../components/CustomAppBar";
import Page from "../components/Page";
import { authenticationAdministrationBL } from "../utils/initialiser";

export const Head: HeadFC = () => <title>thePmSquare | administration</title>;

const RegisterPage: React.FC<PageProps> = () => {
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");
  const [confirmPassword, changeConfirmPassword] = React.useState<string>("");
  const [adminPassword, changeAdminPassword] = React.useState<string>("");

  // functions

  const handleRegister: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        throw new Error("password and confirm password fields do not match.");
      }
      let response = await authenticationAdministrationBL.registerUsernameV0(
        username,
        password,
        adminPassword
      );

      await navigate("/", { state: { user: response["data"]["main"] } });
    } catch (error) {
      changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
        severity: "error",
      });
    }
  };
  // misc

  return (
    <Page>
      <CustomAppBar user={null} changeSnackbarState={changeSnackbarState} />
      <Paper className="register-main">
        <Paper className="register-content">
          <h1>register</h1>
          <form className="register-form" onSubmit={handleRegister}>
            <TextField
              value={username}
              onChange={(e) => changeUsername(e.target.value)}
              label="username"
              variant="outlined"
              required
            />
            <PasswordInput
              value={password}
              onChange={(e) => changePassword(e.target.value)}
              uniqueIdForARIA="register-password"
              label="password"
              variant="outlined"
              others={{ required: true }}
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => changeConfirmPassword(e.target.value)}
              uniqueIdForARIA="confirm-register-password"
              label="confirm password"
              variant="outlined"
              others={{ required: true }}
            />
            <PasswordInput
              value={adminPassword}
              onChange={(e) => changeAdminPassword(e.target.value)}
              uniqueIdForARIA="register-admin-password"
              label="admin password"
              variant="outlined"
              others={{ required: true }}
            />
            <div className="register-form-action">
              <Button color="inherit">
                <Link to="/">cancel</Link>
              </Button>
              <Button type="submit" variant="contained">
                submit
              </Button>
            </div>
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

export default RegisterPage;

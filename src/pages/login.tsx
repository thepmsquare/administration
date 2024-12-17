import "../stylesheets/login.css";

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

const LoginPage: React.FC<PageProps> = () => {
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const [username, changeUsername] = React.useState<string>("");
  const [password, changePassword] = React.useState<string>("");

  // functions

  const handleLogin: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      let response = await authenticationAdministrationBL.loginUsernameV0(
        username,
        password
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
      <CustomAppBar user={null} />
      <main className="login-main">
        <Paper className="login-content">
          <h1>login</h1>
          <form className="login-form" onSubmit={handleLogin}>
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
              uniqueIdForARIA="login-password"
              label="password"
              variant="outlined"
              others={{ required: true }}
            />

            <div className="login-form-action">
              <Button color="inherit">
                <Link to="/">cancel </Link>
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
      </main>
    </Page>
  );
};

export default LoginPage;

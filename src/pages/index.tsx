import "../stylesheets/index.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Paper } from "@mui/material";

import Page from "../components/Page";
import { IndexState } from "../types/pages/Index";

export const Head: HeadFC = () => <title>thePmSquare | administration</title>;

const IndexPage: React.FC<PageProps> = (props) => {
  let state = props.location.state as IndexState | null;

  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });

  return (
    <Page>
      <Paper square>
        <h1>administration</h1>
        {state ? (
          `hello ${state.user.username}`
        ) : (
          <Link to="/register">
            <Button>Register</Button>
          </Link>
        )}
        <Button
          onClick={() => {
            changeSnackbarState({
              isOpen: true,
              message: "test",
              severity: "error",
            });
          }}
        >
          Open snackbar
        </Button>

        <CustomSnackbar
          snackbarState={snackbarState}
          changeSnackbarState={changeSnackbarState}
        />
      </Paper>
    </Page>
  );
};

export default IndexPage;

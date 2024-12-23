import "../stylesheets/index.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Paper } from "@mui/material";

import CustomAppBar from "../components/CustomAppBar";
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
        <CustomAppBar
          user={state ? state.user : null}
          changeSnackbarState={changeSnackbarState}
        />
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

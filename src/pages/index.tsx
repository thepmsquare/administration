import "../stylesheets/index.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

import CustomAppBar from "../components/CustomAppBar";
import Page from "../components/Page";
import { IndexState } from "../types/pages/Index";
import { coreAdministrationBL } from "../utils/initialiser";

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
  // todo: fix the type for this
  const [greetings, changeGreetings] = React.useState<any[]>([]);
  // functions
  const getGreetings = async () => {
    if (state) {
      let response = await coreAdministrationBL.getAllGreetingsV0(
        state.user.access_token
      );
      changeGreetings(response.data.main);
      console.log(response.data.main);
    }
  };

  // useEffect
  React.useEffect(() => {
    getGreetings();
  }, []);
  return (
    <Page>
      <Paper square>
        <CustomAppBar
          user={state ? state.user : null}
          changeSnackbarState={changeSnackbarState}
        />
        {greetings && greetings.length > 0 && (
          <TableContainer component={Paper}>
            <Table aria-label="greetings table">
              <TableHead>
                <TableRow>
                  {Object.keys(greetings[0]).map((key) => (
                    <TableCell>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {greetings.map((row) => (
                  <TableRow key={row?.greeting_id}>
                    {Object.keys(row).map((key) => (
                      <TableCell>{row[key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <CustomSnackbar
          snackbarState={snackbarState}
          changeSnackbarState={changeSnackbarState}
        />
      </Paper>
    </Page>
  );
};

export default IndexPage;

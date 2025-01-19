import "../stylesheets/index.css";

import { HeadFC, PageProps } from "gatsby";
import * as React from "react";
import { GetAllGreetingsV0Response } from "squareadministration";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import {
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import CustomAppBar from "../components/CustomAppBar";
import Page from "../components/Page";
import { IndexState, IndexStateZ } from "../types/pages/Index";
import { coreAdministrationBL } from "../utils/initialiser";

export const Head: HeadFC = () => <title>thePmSquare | administration</title>;

const IndexPage: React.FC<PageProps> = (props) => {
  let state: IndexState | null = null;
  try {
    state = IndexStateZ.parse(props.location.state);
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
  const [greetings, changeGreetings] = React.useState<
    GetAllGreetingsV0Response["data"]["main"]
  >([]);
  const [greetingsCount, changeGreetingsCount] = React.useState<number>(0);
  const [pageSize, changePageSize] = React.useState<number>(10);
  const [currentPage, changeCurrentPage] = React.useState<number>(1);
  const [isLoading, changeIsLoading] = React.useState<boolean>(false);
  // functions
  const getGreetings = async () => {
    if (state) {
      changeIsLoading(true);

      let response = await coreAdministrationBL.getAllGreetingsV0(
        state.user.access_token,
        [],
        pageSize,
        (currentPage - 1) * pageSize
      );
      changeIsLoading(false);
      changeGreetings(response.data.main);
      changeGreetingsCount(response.data.total_count);
    }
  };
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    changeCurrentPage(value);
    getGreetings();
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
          <>
            {isLoading ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="greetings table">
                  <TableHead>
                    <TableRow>
                      {Object.keys(greetings[0]).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {greetings.map((row) => (
                      <TableRow key={row.greeting_id}>
                        {Object.entries(row).map(([key, value]) => (
                          <TableCell key={row.greeting_id + " " + key}>
                            {value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Pagination
              count={Math.ceil(greetingsCount / pageSize)}
              showFirstButton
              showLastButton
              page={currentPage}
              onChange={handleChangePage}
            />
          </>
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

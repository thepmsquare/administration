import "../stylesheets/index.css";

import { HeadFC, PageProps } from "gatsby";
import * as React from "react";
import { GetAllGreetingsV0Response } from "squareadministration";
import CustomSnackbar from "squarecomponents/components/CustomSnackbar";
import PaginatedTable from "squarecomponents/components/PaginatedTable";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Paper, Typography } from "@mui/material";

import CustomAppBar from "../components/CustomAppBar";
import Page from "../components/Page";
import { IndexState, IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
  coreAdministrationBL,
} from "../utils/initialiser";

export const Head: HeadFC = () => <title>thePmSquare | administration</title>;

const IndexPage: React.FC<PageProps> = (props) => {
  const { location } = props;
  let state: IndexState | null = null;
  try {
    state = IndexStateZ.parse(location.state);
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
  const [pageState, setPageState] = React.useState<IndexState | null>(state);
  const [greetings, changeGreetings] = React.useState<
    GetAllGreetingsV0Response["data"]["main"]
  >([]);
  const [greetingsCount, changeGreetingsCount] = React.useState<number>(0);
  const [pageSize, changePageSize] = React.useState<number>(10);
  const [currentPage, changeCurrentPage] = React.useState<number>(1);
  const [isLoading, changeIsLoading] = React.useState<boolean>(false);
  // functions
  const getGreetings = async () => {
    if (!pageState) {
      changeGreetings([]);
      changeGreetingsCount(0);
      return;
    }
    await getGreetingsWithState();
  };
  const getGreetingsWithState = async () => {
    if (!pageState) {
      return;
    }
    changeIsLoading(true);
    try {
      const response = await coreAdministrationBL.getAllGreetingsV0(
        pageState.user.access_token,
        [],
        pageSize,
        (currentPage - 1) * pageSize
      );
      changeGreetings(response.data.main);
      changeGreetingsCount(response.data.total_count);
    } catch (error) {
      console.error("Error fetching greetings:", error);
      changeSnackbarState({
        isOpen: true,
        message: "Failed to load greetings.",
        severity: "error",
      });
    } finally {
      changeIsLoading(false);
    }
  };
  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    value: number
  ) => {
    changeCurrentPage(value);
  };
  const checkForAccessToken = async () => {
    if (pageState) {
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
    }
  };
  // useEffect
  React.useEffect(() => {
    checkForAccessToken();
  }, []);

  React.useEffect(() => {
    getGreetings();
  }, [pageState]);

  React.useEffect(() => {
    getGreetings();
  }, [currentPage]);

  // misc
  let display_rows = greetings.map((row) => {
    return {
      date: new Date(row.greeting_datetime).toLocaleDateString(),
      time: new Date(row.greeting_datetime).toLocaleTimeString(),
      name: row.greeting_anonymous_sender_name,
      greeting: row.greeting_text,
    };
  });
  return (
    <Page
      className="index-page"
      pageState={pageState}
      setPageState={setPageState}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
    >
      <Typography variant="h4" component="h1" className="page-title">
        Greetings
      </Typography>
      <PaginatedTable
        tableAriaLabel="greetings table"
        currentPageNumber={currentPage}
        handlePageChange={handleChangePage}
        totalRowsCount={greetingsCount}
        isLoading={isLoading}
        rows={display_rows}
        pageSize={pageSize}
      />
    </Page>
  );
};

export default IndexPage;

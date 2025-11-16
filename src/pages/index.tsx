import "../stylesheets/index.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";
import { GetAllGreetingsV0Response } from "squareadministration";
import PaginatedTable from "squarecomponents/components/PaginatedTable";
import CustomSnackbarStateType from "squarecomponents/types/CustomSnackbarStateType";

import { Button, Divider, Typography } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";
import { IndexState, IndexStateZ } from "../types/pages/Index";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
  coreAdministrationBL,
} from "../utils/initialiser";

export const Head: HeadFC = () => <title>{brandConfig.appName}</title>;

const IndexPage: React.FC<PageProps> = (props) => {
  const { location } = props;
  let state: IndexState | null = null;
  try {
    state = IndexStateZ.parse(location.state);
  } catch (e) {
    state = null;
    console.log("error parsing page state: ", e);
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
  const [isLoadingGreetings, changeIsLoadingGreetings] =
    React.useState<boolean>(false);
  const [isLoading, changeIsLoading] = React.useState<boolean>(true);

  // functions
  const getGreetings = React.useCallback(async () => {
    if (!pageState) {
      changeGreetings([]);
      changeGreetingsCount(0);
      return;
    }

    changeIsLoadingGreetings(true);
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
      changeGreetings([]);
      changeGreetingsCount(0);
    } finally {
      changeIsLoadingGreetings(false);
    }
  }, [pageState, pageSize, currentPage]);

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    value: number
  ) => {
    changeCurrentPage(value);
  };

  const nullifyPageState = () => {
    setPageState(null);
  };

  // useEffect
  React.useEffect(() => {
    const checkForAccessToken = async () => {
      if (pageState) {
        changeIsLoading(false);
        return;
      }
      try {
        const accessTokenResponse =
          await authenticationAdministrationBL.generateAccessTokenV0();
        const accessToken = accessTokenResponse.data.main.access_token;
        const userDetailsResponse =
          await authenticationCommonBL.getUserDetailsV0(accessToken);
        const username = userDetailsResponse.data.main.username;
        const user_id = userDetailsResponse.data.main.user_id;
        const newState = {
          user: { user_id, username, access_token: accessToken },
        };
        changeIsLoading(false);
        setPageState(newState);
      } catch (e) {
        console.log("user not logged in. ", e);
        changeIsLoading(false);
      }
    };

    checkForAccessToken();
  }, []);

  React.useEffect(() => {
    getGreetings();
  }, [getGreetings]);

  // misc
  const display_rows = greetings.map((row) => {
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
      user={pageState?.user}
      nullifyPageStateFunction={nullifyPageState}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      isLoading={isLoading}
    >
      {pageState && pageState.user ? (
        <>
          <Typography variant="h4" component="h1" className="page-title">
            greetings
          </Typography>
          <PaginatedTable
            tableAriaLabel="greetings table"
            currentPageNumber={currentPage}
            handlePageChange={handleChangePage}
            totalRowsCount={greetingsCount}
            isLoading={isLoadingGreetings}
            rows={display_rows}
            pageSize={pageSize}
            hidePaginationOnSinglePage={true}
          />
        </>
      ) : (
        <div className="index-guest">
          <Typography variant="h4" component="h1" className="page-title">
            welcome to {brandConfig.appName}
          </Typography>
          <div className="index-guest-button-group">
            <Link to="/login">
              <Button variant="contained" size="large" fullWidth>
                login
              </Button>
            </Link>
            <Divider>or</Divider>
            <Link to="/register">
              <Button variant="contained" size="large" fullWidth>
                register
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Page>
  );
};

export default IndexPage;

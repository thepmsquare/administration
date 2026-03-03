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
import { coreAdministrationBL } from "../utils/initialiser";
import { useAuth } from "../utils/auth";

export const Head: HeadFC = () => <title>{brandConfig.appName}</title>;

const IndexPage: React.FC<PageProps> = (props) => {
  const { location } = props;
  let state: IndexState | null = null;
  if (location.state) {
    try {
      state = IndexStateZ.parse(location.state);
    } catch (e) {
      state = null;
      console.error("error parsing page state: ", e);
    }
  }

  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  const { user, isLoading, setUser: setAuthUser } = useAuth(state?.user);
  const [greetings, changeGreetings] = React.useState<
    GetAllGreetingsV0Response["data"]["main"]
  >([]);
  const [greetingsCount, changeGreetingsCount] = React.useState<number>(0);
  const [pageSize, changePageSize] = React.useState<number>(10);
  const [currentPage, changeCurrentPage] = React.useState<number>(1);
  const [isLoadingGreetings, changeIsLoadingGreetings] =
    React.useState<boolean>(false);

  // functions
  const getGreetings = React.useCallback(async () => {
    if (!user) {
      changeGreetings([]);
      changeGreetingsCount(0);
      return;
    }

    changeIsLoadingGreetings(true);
    try {
      const response = await coreAdministrationBL.getAllGreetingsV0(
        user.access_token,
        [],
        pageSize,
        (currentPage - 1) * pageSize,
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
  }, [user, pageSize, currentPage]);

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    value: number,
  ) => {
    changeCurrentPage(value + 1);
  };

  const nullifyPageState = () => {
    setAuthUser(null);
  };

  // useEffect
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
      user={user || undefined}
      nullifyPageStateFunction={nullifyPageState}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      isLoading={isLoading}
    >
      {user ? (
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

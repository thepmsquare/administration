import "../stylesheets/notFound.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";
import { CustomSnackbarStateType } from "squarecomponents";

import { Button } from "@mui/material";

import Page from "../components/Page";
import brandConfig from "../config/brand";

export const Head: HeadFC = () => (
  <title>not found | {brandConfig.appName}</title>
);
const NotFoundPage: React.FC<PageProps> = () => {
  // state
  const [snackbarState, changeSnackbarState] =
    React.useState<CustomSnackbarStateType>({
      isOpen: false,
      message: "",
      severity: "error",
    });
  // TODO: check for refresh token for navbar
  return (
    <Page
      className="not-found-page"
      user={undefined}
      nullifyPageStateFunction={() => {}}
      snackbarState={snackbarState}
      changeSnackbarState={changeSnackbarState}
      isLoading={false}
    >
      <h1>page not found</h1>
      <Link to="/">
        <Button variant="contained">Go home</Button>
      </Link>
    </Page>
  );
};

export default NotFoundPage;

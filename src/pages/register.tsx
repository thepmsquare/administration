import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "../stylesheets/common.css";
import "../stylesheets/register.css";

import { HeadFC, Link, PageProps } from "gatsby";
import * as React from "react";

import { Button, Paper } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const isBrowser = typeof window !== "undefined";

export const Head: HeadFC = () => <title>thePmSquare | administration</title>;

const RegisterPage: React.FC<PageProps> = () => {
  const theme = createTheme({
    typography: {
      fontFamily: "Fraunces Variable",
      h1: {
        fontFamily: "Outfit Variable",
      },
      h2: {
        fontFamily: "Outfit Variable",
      },
      h3: {
        fontFamily: "Outfit Variable",
      },
      h4: {
        fontFamily: "Outfit Variable",
      },
      h5: {
        fontFamily: "Outfit Variable",
      },
      h6: {
        fontFamily: "Outfit Variable",
      },
      button: {
        fontFamily: "Outfit Variable",
      },
    },
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Paper square>
        <h1>Register</h1>
        <Link to="/">
          <Button>Home</Button>
        </Link>
      </Paper>
    </ThemeProvider>
  );
};

export default RegisterPage;

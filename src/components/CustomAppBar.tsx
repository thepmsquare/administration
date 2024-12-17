import { Link } from "gatsby";
import * as React from "react";

import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { CustomAppBarProps } from "../types/components/CustomAppBar";

export default function CustomAppBar(props: CustomAppBarProps) {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/"> administration </Link>
        </Typography>
        {props.user ? (
          "Log out"
        ) : (
          <>
            <Link to="/register">
              <Button color="inherit">register</Button>
            </Link>
            <Link to="/login">
              <Button color="inherit">login</Button>
            </Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

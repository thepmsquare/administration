import { Link, navigate } from "gatsby";
import * as React from "react";

import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { IconButton } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { CustomAppBarProps } from "../types/components/CustomAppBar";
import { authenticationAdministrationBL } from "../utils/initialiser";

export default function CustomAppBar(props: CustomAppBarProps) {
  let handleLogout = async () => {
    try {
      if (!props.pageState || !props.pageState.user) {
        return;
      }
      await authenticationAdministrationBL.logoutV0();
      if (!props.setPageState) {
        return;
      }
      props.setPageState(null);
    } catch (error) {
      props.changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
        severity: "error",
      });
    }
  };
  let handleProfileNavigation = () => {
    if (!props.pageState || !props.pageState.user) {
      return;
    }
    navigate("/profile", { state: { user: props.pageState.user } });
  };
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/"> administration </Link>
        </Typography>
        {props.pageState && props.pageState.user ? (
          <>
            <IconButton color="inherit" onClick={handleProfileNavigation}>
              <AccountBoxIcon />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              log out
            </Button>
          </>
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

import { Link, navigate } from "gatsby";
import * as React from "react";
import ThemeToggleIconButton from "squarecomponents/components/ThemeToggleIconButton";

import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import brandConfig from "../config/brand";
import { CustomAppBarProps } from "../types/components/CustomAppBar";
import { authenticationAdministrationBL } from "../utils/initialiser";

export default function CustomAppBar(props: CustomAppBarProps) {
  const [nonUserMenuAnchor, setNonUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);
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
  let handleNonUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNonUserMenuAnchor(event.currentTarget);
  };
  let handleNonUserMenuClose = () => {
    setNonUserMenuAnchor(null);
  };
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Tooltip title="home">
            <Link to="/">{brandConfig.appName}</Link>
          </Tooltip>
        </Typography>

        <ThemeToggleIconButton
          color="inherit"
          themeState={props.themeState}
          customChangeThemeState={props.customChangeThemeState}
        />
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
            <Tooltip title="account options">
              <IconButton color="inherit" onClick={handleNonUserMenuOpen}>
                <AccountBoxIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu"
              anchorEl={nonUserMenuAnchor}
              open={Boolean(nonUserMenuAnchor)}
              onClose={handleNonUserMenuClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <Link to="/register">
                <MenuItem>register</MenuItem>
              </Link>
              <Link to="/login">
                <MenuItem>login</MenuItem>
              </Link>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

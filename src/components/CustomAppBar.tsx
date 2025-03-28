import { Link, navigate } from "gatsby";
import * as React from "react";
import { AlertDialog } from "squarecomponents";
import ThemeToggleIconButton from "squarecomponents/components/ThemeToggleIconButton";

import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { Avatar, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
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
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] =
    React.useState<boolean>(false);
  let handleLogout = async () => {
    try {
      if (!props.user) {
        return;
      }
      await authenticationAdministrationBL.logoutV0();
      if (!props.nullifyPageStateFunction) {
        return;
      }
      props.nullifyPageStateFunction();
    } catch (error) {
      props.changeSnackbarState({
        isOpen: true,
        message: (error as any).message,
        severity: "error",
      });
    }
  };
  let handleProfileNavigation = () => {
    if (!props.user) {
      return;
    }
    navigate("/profile", { state: { user: props.user } });
  };
  let handleNonUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNonUserMenuAnchor(event.currentTarget);
  };
  let handleNonUserMenuClose = () => {
    setNonUserMenuAnchor(null);
  };
  let handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  let handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  let handleLogoutMenuOpen = () => {
    setIsLogoutAlertOpen(true);
  };
  let handleLogoutMenuClose = () => {
    setIsLogoutAlertOpen(false);
  };
  let handleLogoutMenuSuccess = () => {
    handleLogout();
    setIsLogoutAlertOpen(false);
  };
  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: "1rem" }}>
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
        {props.user ? (
          <>
            <Tooltip title="account options">
              <IconButton onClick={handleUserMenuOpen}>
                <Avatar>{props.user.username[0]}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu-logged-in"
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem color="inherit" onClick={handleProfileNavigation}>
                profile
              </MenuItem>
              <MenuItem onClick={handleLogoutMenuOpen}>log out</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Tooltip title="account options">
              <IconButton color="inherit" onClick={handleNonUserMenuOpen}>
                <AccountBoxIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu-logged-out"
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
      <AlertDialog
        open={isLogoutAlertOpen}
        handleClose={handleLogoutMenuClose}
        title="confirm log out."
        handleSuccess={handleLogoutMenuSuccess}
        confirmButtonColor="error"
      />
    </AppBar>
  );
}

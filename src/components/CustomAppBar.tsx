import { Link, navigate } from "gatsby";
import squareLogo from "../images/square.svg";
import * as React from "react";
import { AlertDialog } from "squarecomponents";
import ThemeToggleIconButton from "squarecomponents/components/ThemeToggleIconButton";

import AccountBoxIcon from "@mui/icons-material/AccountBox";
import {
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import brandConfig from "../config/brand";
import { CustomAppBarProps } from "../types/components/CustomAppBar";
import { ProfileStateZ } from "../types/pages/Profile";
import { authenticationAdministrationBL } from "../utils/initialiser";
import { useServerCheck } from "../context/serverCheck";
import { isNetworkError } from "../utils/networkError";

export default function CustomAppBar(props: CustomAppBarProps) {
  const triggerServerCheck = useServerCheck();
  const [nonUserMenuAnchor, setNonUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] =
    React.useState<boolean>(false);
  const [isLogoutLoading, setIsLogoutLoading] = React.useState<boolean>(false);
  const handleLogout = async () => {
    try {
      if (!props.user) {
        return;
      }
      setIsLogoutLoading(true);
      await authenticationAdministrationBL.logoutV0();
      if (!props.nullifyPageStateFunction) {
        return;
      }
      props.nullifyPageStateFunction();
    } catch (error) {
      if (isNetworkError(error)) {
        triggerServerCheck();
      } else {
        props.changeSnackbarState({
          isOpen: true,
          message: (error as Error).message,
          severity: "error",
        });
      }
    } finally {
      setIsLogoutLoading(false);
    }
  };
  const handleProfileNavigation = () => {
    if (!props.user) {
      return;
    }
    const profileState = ProfileStateZ.parse({ user: props.user });
    navigate("/profile", { state: profileState });
  };
  const handleNonUserMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setNonUserMenuAnchor(event.currentTarget);
  };
  const handleNonUserMenuClose = () => {
    setNonUserMenuAnchor(null);
  };
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  const handleLogoutMenuOpen = () => {
    setIsLogoutAlertOpen(true);
  };
  const handleLogoutMenuClose = () => {
    setIsLogoutAlertOpen(false);
  };
  const handleLogoutMenuSuccess = async () => {
    await handleLogout();
    setIsLogoutAlertOpen(false);
  };
  return (
    <AppBar position="sticky" role="banner">
      <Toolbar sx={{ gap: "1rem" }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Tooltip title="home">
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              aria-label="home"
            >
              <img
                src={squareLogo}
                alt="Square logo"
                style={{ width: "1em", height: "1em", display: "block" }}
              />
              {brandConfig.appName}
            </Link>
          </Tooltip>
        </Typography>

        <ThemeToggleIconButton
          color="inherit"
          themeState={props.themeState}
          customChangeThemeState={props.customChangeThemeState}
          aria-label="toggle theme"
        />
        {props.user ? (
          <>
            <Tooltip title="account options">
              <IconButton
                onClick={handleUserMenuOpen}
                aria-label="account options"
                aria-controls={userMenuAnchor ? "basic-menu-logged-in" : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuAnchor ? "true" : undefined}
                id="user-menu-button"
              >
                {props.isUserProfilePhotoLoading ? (
                  <Avatar>
                    <CircularProgress size={24} />
                  </Avatar>
                ) : props.userProfilePhotoURL ? (
                  <Avatar
                    alt={props.user.username}
                    src={props.userProfilePhotoURL}
                  />
                ) : (
                  <Avatar>{props.user.username.charAt(0)}</Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu-logged-in"
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              slotProps={{
                list: {
                  "aria-labelledby": "user-menu-button",
                },
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
              <IconButton
                color="inherit"
                onClick={handleNonUserMenuOpen}
                aria-label="account options"
                aria-controls={
                  nonUserMenuAnchor ? "basic-menu-logged-out" : undefined
                }
                aria-haspopup="true"
                aria-expanded={nonUserMenuAnchor ? "true" : undefined}
                id="non-user-menu-button"
              >
                <AccountBoxIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu-logged-out"
              anchorEl={nonUserMenuAnchor}
              open={Boolean(nonUserMenuAnchor)}
              onClose={handleNonUserMenuClose}
              slotProps={{
                list: {
                  "aria-labelledby": "non-user-menu-button",
                },
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
        isLoading={isLogoutLoading}
      />
    </AppBar>
  );
}

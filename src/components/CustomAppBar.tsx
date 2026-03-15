import { navigate } from "gatsby";
import squareLogo from "../images/square.svg";
import * as React from "react";
import { AlertDialog } from "squarecomponents";
import ThemeToggleIconButton from "squarecomponents/components/ThemeToggleIconButton";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Tooltip } from "@mui/material";
import { Link } from "gatsby";

import brandConfig from "../config/brand";
import { CustomAppBarProps } from "../types/components/CustomAppBar";
import { ProfileStateZ } from "../types/pages/Profile";
import { authenticationAdministrationBL } from "../utils/initialiser";
import { useServerCheck } from "../context/serverCheck";
import { isNetworkError } from "../utils/networkError";
import { UserMenu, NonUserMenu } from "./appBar/AppBarMenus";

export default function CustomAppBar(props: CustomAppBarProps) {
  const triggerServerCheck = useServerCheck();
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] =
    React.useState<boolean>(false);
  const [isLogoutLoading, setIsLogoutLoading] = React.useState<boolean>(false);

  const handleLogout = async () => {
    try {
      if (!props.user) return;
      setIsLogoutLoading(true);
      await authenticationAdministrationBL.logoutV0();
      if (!props.nullifyPageStateFunction) return;
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
    if (!props.user) return;
    const profileState = ProfileStateZ.parse({ user: props.user });
    navigate("/profile", { state: profileState });
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
          <UserMenu
            user={props.user}
            userProfilePhotoURL={props.userProfilePhotoURL}
            isUserProfilePhotoLoading={props.isUserProfilePhotoLoading}
            onLogoutOpen={() => setIsLogoutAlertOpen(true)}
            onProfileNavigate={handleProfileNavigation}
          />
        ) : (
          <NonUserMenu />
        )}
      </Toolbar>
      <AlertDialog
        open={isLogoutAlertOpen}
        handleClose={() => setIsLogoutAlertOpen(false)}
        title="confirm log out."
        handleSuccess={handleLogoutMenuSuccess}
        confirmButtonColor="error"
        isLoading={isLogoutLoading}
      />
    </AppBar>
  );
}

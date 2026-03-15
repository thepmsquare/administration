import * as React from "react";
import { Link } from "gatsby";
import squareLogo from "../../images/square.svg";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import {
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { CustomAppBarProps } from "../../types/components/CustomAppBar";

type UserMenuProps = Pick<
  CustomAppBarProps,
  "user" | "userProfilePhotoURL" | "isUserProfilePhotoLoading"
> & {
  onLogoutOpen: () => void;
  onProfileNavigate: () => void;
};

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  userProfilePhotoURL,
  isUserProfilePhotoLoading,
  onLogoutOpen,
  onProfileNavigate,
}) => {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <Tooltip title="account options">
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="account options"
          aria-controls={anchor ? "basic-menu-logged-in" : undefined}
          aria-haspopup="true"
          aria-expanded={anchor ? "true" : undefined}
          id="user-menu-button"
        >
          {isUserProfilePhotoLoading ? (
            <Avatar>
              <CircularProgress size={24} />
            </Avatar>
          ) : userProfilePhotoURL ? (
            <Avatar alt={user?.username} src={userProfilePhotoURL} />
          ) : (
            <Avatar>{user?.username.charAt(0)}</Avatar>
          )}
        </IconButton>
      </Tooltip>
      <Menu
        id="basic-menu-logged-in"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { "aria-labelledby": "user-menu-button" } }}
      >
        <MenuItem
          color="inherit"
          onClick={() => {
            setAnchor(null);
            onProfileNavigate();
          }}
        >
          profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onLogoutOpen();
          }}
        >
          log out
        </MenuItem>
      </Menu>
    </>
  );
};

export const NonUserMenu: React.FC = () => {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <Tooltip title="account options">
        <IconButton
          color="inherit"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="account options"
          aria-controls={anchor ? "basic-menu-logged-out" : undefined}
          aria-haspopup="true"
          aria-expanded={anchor ? "true" : undefined}
          id="non-user-menu-button"
        >
          <AccountBoxIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="basic-menu-logged-out"
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { "aria-labelledby": "non-user-menu-button" } }}
      >
        <Link to="/register">
          <MenuItem>register</MenuItem>
        </Link>
        <Link to="/login">
          <MenuItem>login</MenuItem>
        </Link>
      </Menu>
    </>
  );
};

import GoogleIcon from "@mui/icons-material/Google";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material/SvgIcon/SvgIcon";

export type AuthProviderType = "SELF" | "GOOGLE";

export interface AuthProviderMetadata {
  type: AuthProviderType;
  label: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  color: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

export const AUTH_PROVIDERS: AuthProviderMetadata[] = [
  {
    type: "SELF",
    label: "username / password",
    icon: PersonOutlinedIcon,
    color: "primary",
  },
  {
    type: "GOOGLE",
    label: "google",
    icon: GoogleIcon,
    color: "primary",
  },
];

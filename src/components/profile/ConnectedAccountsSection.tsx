import * as React from "react";
import { GetUserDetailsV0ResponseZ } from "squarecommonblhelper";
import { z } from "zod";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

type UserDetails = z.infer<
  typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
>;

type Props = {
  userDetails: UserDetails | null;
};

const ConnectedAccountsSection: React.FC<Props> = ({ userDetails }) => {
  if (!userDetails) return null;

  const providers = userDetails.auth_providers || [];

  return (
    <Paper
      variant="outlined"
      className="profile-section-card"
      component="section"
      aria-labelledby="connected-accounts-title"
    >
      <div className="profile-section-header">
        <Typography variant="h6" component="h2" id="connected-accounts-title">
          connected accounts
        </Typography>
      </div>
      <Divider />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, py: 1 }}>
        {providers.includes("SELF") && (
          <Chip
            icon={<PersonOutlinedIcon fontSize="small" />}
            label="username / password"
            variant="outlined"
            color="primary"
          />
        )}
        {providers.includes("GOOGLE") && (
          <Chip
            icon={<GoogleIcon fontSize="small" />}
            label="google"
            variant="outlined"
            color="primary"
          />
        )}
        {providers.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            no connected accounts found.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ConnectedAccountsSection;

import * as React from "react";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import { Box, Typography } from "@mui/material";

const pulseKeyframes = `
@keyframes connectivity-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.45; transform: scale(0.88); }
}
`;

export default function OfflineScreen() {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          px: 3,
          py: 8,
          textAlign: "center",
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            animation: "connectivity-pulse 2.4s ease-in-out infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: "50%",
            backgroundColor: "action.hover",
          }}
        >
          <WifiOffIcon
            sx={{ fontSize: 52, color: "text.secondary" }}
            aria-hidden="true"
          />
        </Box>

        <Box sx={{ maxWidth: 360 }} role="alert" aria-live="assertive">
          <Typography variant="h5" fontWeight={600} gutterBottom>
            you're offline
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No internet connection detected. Please check your network and try
            again — this page will restore automatically once you're back
            online.
          </Typography>
        </Box>
      </Box>
    </>
  );
}

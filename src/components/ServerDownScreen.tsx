import * as React from "react";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, Typography } from "@mui/material";

interface ServerDownScreenProps {
  onRetry: () => void;
}

export default function ServerDownScreen({ onRetry }: ServerDownScreenProps) {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Give the caller's async ping a moment, then reset the spinner
    await onRetry();
    // Small grace period so the button doesn't flash
    setTimeout(() => setIsRetrying(false), 1200);
  };

  return (
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 96,
          height: 96,
          borderRadius: "50%",
          backgroundColor: "action.hover",
        }}
      >
        <CloudOffIcon
          sx={{ fontSize: 52, color: "text.secondary" }}
          aria-hidden="true"
        />
      </Box>

      <Box sx={{ maxWidth: 360 }} role="alert" aria-live="assertive">
        <Typography variant="h5" fontWeight={600} gutterBottom>
          servers are unreachable
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The backend services could not be reached right now. This may be
          temporary — please try again in a moment.
        </Typography>
      </Box>

      <Button
        variant="outlined"
        startIcon={
          <RefreshIcon
            sx={{
              animation: isRetrying ? "spin 0.8s linear infinite" : "none",
              "@keyframes spin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
        }
        onClick={handleRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "checking…" : "retry"}
      </Button>
    </Box>
  );
}

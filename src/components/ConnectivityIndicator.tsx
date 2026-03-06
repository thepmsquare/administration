import * as React from "react";
import { Box, Tooltip } from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import squareConfig from "../config/square";

/** How often (ms) to re-ping the servers while the tab is online. */
const PING_INTERVAL_MS = 30_000;

/**
 * Try a HEAD request to `url` with a short timeout.
 * Returns `true` when the server responds with any HTTP status.
 */
async function pingServer(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors", // avoids CORS preflight; we only care that the server answered
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

interface DotProps {
  ok: boolean;
  label: string;
}

function StatusDot({ ok, label }: DotProps) {
  return (
    <Tooltip title={label} arrow>
      <Box
        component="span"
        sx={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: ok ? "#4caf50" : "#f44336",
          boxShadow: ok
            ? "0 0 5px 1px rgba(76,175,80,0.7)"
            : "0 0 5px 1px rgba(244,67,54,0.7)",
          transition: "background-color 0.4s ease, box-shadow 0.4s ease",
          flexShrink: 0,
          cursor: "default",
        }}
      />
    </Tooltip>
  );
}

export default function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = React.useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [serverOk, setServerOk] = React.useState<boolean>(true);

  // --- Internet connectivity ---
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // --- Server connectivity ---
  React.useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkServers = async () => {
      if (!navigator.onLine) {
        setServerOk(false);
        return;
      }
      const urls = [
        squareConfig.administrationBLBaseURL,
        squareConfig.commonBLBaseURL,
      ];
      const results = await Promise.all(urls.map(pingServer));
      setServerOk(results.every(Boolean));
    };

    // Immediate check on mount, then periodic
    checkServers();
    intervalId = setInterval(checkServers, PING_INTERVAL_MS);

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, []);

  const internetLabel = isOnline ? "Internet: online" : "Internet: offline";
  const serverLabel = serverOk ? "Servers: connected" : "Servers: unreachable";

  return (
    <Tooltip
      title={
        <Box sx={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: isOnline ? "#4caf50" : "#f44336",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {internetLabel}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: serverOk ? "#4caf50" : "#f44336",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            {serverLabel}
          </Box>
        </Box>
      }
      arrow
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 6px",
          borderRadius: "12px",
          backgroundColor: "rgba(255,255,255,0.10)",
          cursor: "default",
          userSelect: "none",
        }}
      >
        {/* Network icon */}
        <Box
          component="span"
          sx={{
            display: "flex",
            alignItems: "center",
            color: isOnline && serverOk ? "#4caf50" : "#f44336",
            fontSize: "1rem",
            transition: "color 0.4s ease",
          }}
        >
          {isOnline ? (
            <WifiIcon fontSize="inherit" />
          ) : (
            <WifiOffIcon fontSize="inherit" />
          )}
        </Box>

        {/* Two status dots */}
        <StatusDot ok={isOnline} label={internetLabel} />
        <StatusDot ok={serverOk} label={serverLabel} />
      </Box>
    </Tooltip>
  );
}

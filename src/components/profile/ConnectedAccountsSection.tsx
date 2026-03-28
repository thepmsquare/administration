import * as React from "react";
import { GetUserDetailsV0ResponseZ } from "squarecommonblhelper";
import { z } from "zod";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { PasswordInput } from "squarecomponents";
import { AUTH_PROVIDERS, AuthProviderType } from "../../constants/authProviders";
import squareConfig from "../../config/square";

type UserDetails = z.infer<
  typeof GetUserDetailsV0ResponseZ.shape.data.shape.main
>;

type Props = {
  userDetails: UserDetails | null;
  accessToken: string | null;
  onRefresh: () => Promise<void>;
  onLinkSelf: (password: string) => Promise<void>;
  onLinkGoogle: (idToken: string) => Promise<void>;
  onUnlink: (provider: string) => Promise<void>;
  showError: (error: unknown) => void;
};

const ConnectedAccountsSection: React.FC<Props> = ({
  userDetails,
  accessToken,
  onRefresh,
  onLinkSelf,
  onLinkGoogle,
  onUnlink,
  showError,
}) => {
  const [isLinkSelfDialogOpen, setIsLinkSelfDialogOpen] = React.useState(false);
  const [linkSelfPassword, setLinkSelfPassword] = React.useState("");
  const [linkSelfConfirmPassword, setLinkSelfConfirmPassword] = React.useState("");
  const [isLinking, setIsLinking] = React.useState(false);
  const [isUnlinking, setIsUnlinking] = React.useState(false);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = React.useState(false);

  const googleButtonRef = React.useRef<HTMLDivElement>(null);

  const providers = userDetails?.auth_providers || [];

  const handleLinkSelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (linkSelfPassword !== linkSelfConfirmPassword) {
      showError(new Error("passwords do not match."));
      return;
    }
    try {
      setIsLinking(true);
      await onLinkSelf(linkSelfPassword);
      setIsLinkSelfDialogOpen(false);
      setLinkSelfPassword("");
      setLinkSelfConfirmPassword("");
      await onRefresh();
    } catch (error) {
      showError(error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleGoogleCallback = React.useCallback(
    async (response: any) => {
      try {
        setIsLinking(true);
        await onLinkGoogle(response.credential);
        await onRefresh();
      } catch (error) {
        showError(error);
      } finally {
        setIsLinking(false);
      }
    },
    [onLinkGoogle, onRefresh, showError],
  );

  const renderGoogleButton = React.useCallback(() => {
    const google = (window as any).google;
    if (google && googleButtonRef.current && squareConfig.googleClientID) {
      google.accounts.id.initialize({
        client_id: squareConfig.googleClientID,
        callback: handleGoogleCallback,
      });
      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "medium",
        text: "signin_with",
        shape: "pill",
      });
    }
  }, [handleGoogleCallback]);

  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  React.useEffect(() => {
    if (isGoogleScriptLoaded && !providers.includes("GOOGLE")) {
      renderGoogleButton();
    }
  }, [isGoogleScriptLoaded, providers, renderGoogleButton]);

  if (!userDetails) return null;

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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
        }}
      >
        {AUTH_PROVIDERS.map((provider) => {
          const isLinked = providers.includes(provider.type);
          const Icon = provider.icon;

          return (
            <Box
              key={provider.type}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Icon color={provider.color} />
                <Typography variant="body1">{provider.label}</Typography>
                {isLinked && (
                  <Chip
                    label="linked"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.75rem" }}
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isLinked ? (
                  <Tooltip title={providers.length <= 1 ? "at least one account must be linked" : "unlink account"}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={providers.length <= 1 || isUnlinking}
                        onClick={() => onUnlink(provider.type)}
                      >
                        {isUnlinking ? <CircularProgress size={20} /> : <DeleteOutlineIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  <>
                    {provider.type === "SELF" && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setIsLinkSelfDialogOpen(true)}
                        disabled={isLinking}
                      >
                        link
                      </Button>
                    )}
                    {provider.type === "GOOGLE" && (
                      <div ref={googleButtonRef} style={{ height: 32 }} />
                    )}
                  </>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Link Self Modal */}
      <Dialog
        open={isLinkSelfDialogOpen}
        onClose={() => !isLinking && setIsLinkSelfDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleLinkSelfSubmit}>
          <DialogTitle>link password</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              add a password to your account to sign in with your username.
            </Typography>
            <PasswordInput
              label="new password"
              value={linkSelfPassword}
              onChange={(e) => setLinkSelfPassword(e.target.value)}
              variant="outlined"
              others={{ required: true, disabled: isLinking }}
              uniqueIdForARIA="link-pass-new"
            />
            <PasswordInput
              label="confirm password"
              value={linkSelfConfirmPassword}
              onChange={(e) => setLinkSelfConfirmPassword(e.target.value)}
              variant="outlined"
              others={{ required: true, disabled: isLinking }}
              uniqueIdForARIA="link-pass-confirm"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsLinkSelfDialogOpen(false)} disabled={isLinking}>
              cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLinking || !linkSelfPassword || linkSelfPassword !== linkSelfConfirmPassword}
              startIcon={isLinking ? <CircularProgress size={16} /> : undefined}
            >
              link password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default ConnectedAccountsSection;

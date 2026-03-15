import * as React from "react";
import { Link } from "gatsby";
import { UsernameInput } from "squarecomponents";
import Button from "@mui/material/Button";
import { Alert, CircularProgress } from "@mui/material";

type Props = {
  username: string;
  isFetchingRecovery: boolean;
  lookupError: string | null;
  onUsernameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClearLookupError: () => void;
};

const UsernameStep: React.FC<Props> = ({
  username,
  isFetchingRecovery,
  lookupError,
  onUsernameChange,
  onSubmit,
  onClearLookupError,
}) => {
  return (
    <form
      className="common-form"
      onSubmit={onSubmit}
      aria-label="Password recovery form"
    >
      <UsernameInput
        value={username}
        onChange={(e) => {
          onUsernameChange(e.target.value);
          if (lookupError) onClearLookupError();
        }}
        label="username"
        uniqueIdForARIA="forgot-password-username-input"
        variant="outlined"
        autocomplete="username"
        others={{
          required: true,
          disabled: isFetchingRecovery,
        }}
      />

      {lookupError && (
        <Alert severity="error" onClose={onClearLookupError}>
          {lookupError}
        </Alert>
      )}

      <div className="fp-form-actions">
        <Button
          type="submit"
          variant={"contained" as any}
          disabled={isFetchingRecovery || !username.trim()}
          startIcon={
            isFetchingRecovery ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isFetchingRecovery ? "looking up…" : "find account"}
        </Button>
        <Button
          component={Link}
          to="/login"
          variant="text"
          color="inherit"
          disabled={isFetchingRecovery}
        >
          cancel
        </Button>
      </div>
    </form>
  );
};

export default UsernameStep;

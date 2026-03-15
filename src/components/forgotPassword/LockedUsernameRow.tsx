import * as React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

type Props = {
  username: string;
  onClear: () => void;
};

const LockedUsernameRow: React.FC<Props> = ({ username, onClear }) => {
  return (
    <div className="fp-username-locked">
      <Typography
        variant="body2"
        color="text.secondary"
        className="fp-username-label"
      >
        account
      </Typography>
      <Typography variant="body1" className="fp-username-value">
        {username}
      </Typography>
      <Tooltip title="Change username">
        <IconButton
          size="small"
          onClick={onClear}
          aria-label="change username"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default LockedUsernameRow;

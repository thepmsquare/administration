import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

type Props = {
  open: boolean;
  backupCodes: string[];
  username: string | undefined;
  onCopy: () => void;
  onDownload: () => void;
  onClose: () => void;
};

const BackupCodesDialog: React.FC<Props> = ({
  open,
  backupCodes,
  onCopy,
  onDownload,
  onClose,
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle>account recovery backup codes</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          save these backup codes in a secure place. each code can be used
          once if you forget your password.
        </Typography>

        <Grid container spacing={1}>
          {backupCodes.map((code) => (
            <Grid key={code}>
              <Paper
                variant="outlined"
                sx={{
                  py: 1,
                  textAlign: "center",
                  fontFamily: "monospace",
                  fontSize: 14,
                }}
              >
                {code}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCopy}>copy all</Button>
        <Button onClick={onDownload}>download</Button>
        <Button onClick={onClose} variant={"contained" as any}>
          done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BackupCodesDialog;

import * as React from "react";

import { CircularProgress } from "@mui/material";
import Button, { ButtonOwnProps } from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog(props: {
  open: boolean;
  handleClose: () => void;
  title: string;
  handleSuccess: () => void;
  confirmButtonColor: ButtonOwnProps["color"];
  text?: string;
  isLoading?: boolean;
}) {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} disabled={props.isLoading}>
          cancel
        </Button>
        <Button
          onClick={props.handleSuccess}
          color={props.confirmButtonColor}
          disabled={props.isLoading}
        >
          {props.isLoading ? <CircularProgress /> : "confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";

interface Props {
  handleClose: () => void;
  handleDelete: () => void;
  open: boolean;
  text?: any;
  disabled?: boolean;
}

/**
 * This is the Delete Confirmation Dialog
 *
 * @param handleClose This closes the dialog
 * @param handleDelete This performs the delete operation
 * @param {boolean} open This value is for checking if the dialog should open
 *
 * @returns A dialog box for delete
 */

const ConfirmDialog = ({
  open,
  handleClose,
  handleDelete,
  text,
  disabled = false,
}: Props) => {
  const data = text?.split("-");
  return (
    <div data-testid="confirm-dialog">
      <Dialog open={open} onClose={handleClose}>
        {disabled === false ? (
          <DialogTitle id="alert-dialog-title">
            <p style={{ fontSize: "14px" }}>
              {"Are You Sure want to Delete this?"}{" "}
            </p>
          </DialogTitle>
        ) : (
          <DialogTitle>
            <Typography variant="h6" component="p" gutterBottom>
              You Cannot Delete this Data, there are data in Other Modules
            </Typography>
            <Typography variant="body1">
              <strong>Document Count:</strong> {data[0]}
            </Typography>
            <Typography variant="body1">
              <strong>Audit Count:</strong> {data[1]}
            </Typography>
            <Typography variant="body1">
              <strong>Capa Count:</strong> {data[3]}
            </Typography>
            <Typography variant="body1">
              <strong>Hira Count:</strong> {data[2]}
            </Typography>
          </DialogTitle>
        )}
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            style={{ fontSize: "10px" }}
          >
            No, Take Me Back
          </Button>
          <Button
            onClick={handleDelete}
            disabled={disabled}
            data-testid="dialog-yes-button"
            variant="contained"
            color="primary"
            autoFocus
            style={{ fontSize: "10px" }}
          >
            Yes I am Sure
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmDialog;

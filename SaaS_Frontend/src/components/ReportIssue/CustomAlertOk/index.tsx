import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useNavigate } from "react-router-dom";

interface CustomAlertProps {
    open: boolean;
    handleClose: () => void;
  }

const  CustomAlertOk = ({ open, handleClose }: CustomAlertProps) => {
  
  const navigate = useNavigate();
  const handleOk = () => {
    handleClose();
    navigate(-1); // Navigate to the previous page
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Success!</DialogTitle>
      <DialogContent>
        <div>Your Ticket Has Been Submitted Successfully.</div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOk} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomAlertOk;

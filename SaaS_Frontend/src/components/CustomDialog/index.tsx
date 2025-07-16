import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import useStyles from "./styles";

type DialogProps = {
  component: any;
  setOpen: any;
  open: any;
};

function CustomDialog({ component, open, setOpen }: DialogProps) {
  const classes = useStyles();

  /**
   * @method handleClose
   * @description Function to which closes the custom dialog component
   * @returns nothing
   */
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <>
      <Dialog fullWidth={true} maxWidth="xl" open={open} onClose={handleClose}>
        <DialogContent className={classes.dialogBorder}>
          {component}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomDialog;
